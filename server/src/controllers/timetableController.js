const TimetableEntry = require('../models/TimetableEntry');
const Faculty = require('../models/Faculty');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Room = require('../models/Room');
const Conflict = require('../models/Conflict');
const ChangeHistory = require('../models/ChangeHistory');
const { validateCandidateEntry, detectAllConflicts } = require('../services/conflictEngine');

// Re-evaluates all conflicts in DB and saves active ones to Conflict collection
const syncConflictsInDB = async () => {
  const [allEntries, faculties, sections, rooms, subjects] = await Promise.all([
    TimetableEntry.find({}).populate('faculty section room subject'),
    Faculty.find({}),
    Section.find({}),
    Room.find({}),
    Subject.find({}),
  ]);

  const detected = detectAllConflicts(allEntries, faculties, sections, rooms, subjects);

  // Clear older active conflicts and insert fresh
  await Conflict.deleteMany({ status: 'ACTIVE' });

  if (detected.length > 0) {
    const conflictDocs = detected.map((d) => ({
      type: d.type,
      severity: d.severity,
      message: d.message,
      affectedEntries: d.affectedEntries,
      relatedFaculty: d.relatedFaculty,
      relatedRoom: d.relatedRoom,
      relatedSection: d.relatedSection,
      day: d.day,
      timeSlot: d.timeSlot,
      status: 'ACTIVE',
    }));
    await Conflict.insertMany(conflictDocs);
  }

  // Update hasConflict flag on entries
  const affectedEntryIdSet = new Set(
    detected.flatMap((d) => d.affectedEntries.map((e) => e?.toString() || e))
  );

  for (const entry of allEntries) {
    const isConflicted = affectedEntryIdSet.has(entry._id.toString());
    const matchedConflict = detected.find((d) =>
      d.affectedEntries.some((e) => (e?.toString() || e) === entry._id.toString())
    );
    await TimetableEntry.findByIdAndUpdate(entry._id, {
      hasConflict: isConflicted,
      conflictSummary: matchedConflict ? matchedConflict.message : '',
    });
  }

  return detected;
};

// @desc    Get all timetable entries with filters
// @route   GET /api/timetable
// @access  Public / Authenticated
exports.getTimetableEntries = async (req, res, next) => {
  try {
    const { section, faculty, room, subject, day, semester, academicYear, status } = req.query;
    let query = {};

    if (section && section !== 'ALL') query.section = section;
    if (faculty && faculty !== 'ALL') query.faculty = faculty;
    if (room && room !== 'ALL') query.room = room;
    if (subject && subject !== 'ALL') query.subject = subject;
    if (day && day !== 'ALL') query.day = day;
    if (semester && semester !== 'ALL') query.semester = Number(semester);
    if (academicYear && academicYear !== 'ALL') query.academicYear = academicYear;
    if (status && status !== 'ALL') query.status = status;

    // If faculty role, restrict to their faculty classes unless viewer request
    if (req.user?.role === 'FACULTY' && req.user.facultyId && !section && !faculty) {
      query.faculty = req.user.facultyId;
    }

    const entries = await TimetableEntry.find(query)
      .populate('faculty', 'name employeeId email department')
      .populate('section', 'name department year semester studentCount academicYear')
      .populate('subject', 'name code department credits type')
      .populate('room', 'roomNumber building capacity roomType available')
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single timetable entry
// @route   GET /api/timetable/:id
// @access  Public
exports.getTimetableEntryById = async (req, res, next) => {
  try {
    const entry = await TimetableEntry.findById(req.params.id)
      .populate('faculty')
      .populate('section')
      .populate('subject')
      .populate('room');
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Create timetable entry with conflict check
// @route   POST /api/timetable
// @access  Admin only
exports.createTimetableEntry = async (req, res, next) => {
  try {
    const { academicYear, semester, section, subject, faculty, room, day, startTime, endTime, status, allowForce } = req.body;

    const [allEntries, facultyDoc, sectionDoc, roomDoc, subjectDoc] = await Promise.all([
      TimetableEntry.find({}),
      Faculty.findById(faculty),
      Section.findById(section),
      Room.findById(room),
      Subject.findById(subject),
    ]);

    // Check conflicts
    const conflicts = validateCandidateEntry({
      candidate: { section, subject, faculty, room, day, startTime, endTime },
      existingEntries: allEntries,
      facultyDoc,
      sectionDoc,
      roomDoc,
      subjectDoc,
    });

    const hasHardConflict = conflicts.some((c) => c.severity === 'ERROR');

    if (hasHardConflict && !allowForce) {
      return res.status(409).json({
        success: false,
        message: 'Conflict detected with this timetable schedule.',
        conflicts,
        canForce: true,
      });
    }

    const entry = await TimetableEntry.create({
      academicYear: academicYear || '2025-2026',
      semester: semester || sectionDoc?.semester || 1,
      section,
      subject,
      faculty,
      room,
      day,
      startTime,
      endTime,
      status: status || 'PUBLISHED',
      hasConflict: hasHardConflict,
      conflictSummary: hasHardConflict ? conflicts[0].message : '',
    });

    // Record change history
    await ChangeHistory.create({
      changedBy: req.user._id,
      changedByName: req.user.name,
      changeType: 'CREATE',
      timetableEntry: entry._id,
      after: entry.toObject(),
      reason: req.body.reason || 'New timetable entry created',
    });

    // Sync all conflicts across the system
    await syncConflictsInDB();

    const populatedEntry = await TimetableEntry.findById(entry._id)
      .populate('faculty section room subject');

    res.status(201).json({
      success: true,
      message: hasHardConflict ? 'Entry created with unresolved conflicts.' : 'Timetable entry scheduled successfully.',
      data: populatedEntry,
      conflicts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update timetable entry
// @route   PUT /api/timetable/:id
// @access  Admin only
exports.updateTimetableEntry = async (req, res, next) => {
  try {
    const existingEntry = await TimetableEntry.findById(req.params.id);
    if (!existingEntry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    const beforeState = existingEntry.toObject();

    const updated = await TimetableEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('faculty section room subject');

    // Record change history
    await ChangeHistory.create({
      changedBy: req.user._id,
      changedByName: req.user.name,
      changeType: 'UPDATE',
      timetableEntry: updated._id,
      before: beforeState,
      after: updated.toObject(),
      reason: req.body.reason || 'Timetable schedule modified',
    });

    await syncConflictsInDB();

    res.status(200).json({
      success: true,
      message: 'Timetable entry updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Admin only
exports.deleteTimetableEntry = async (req, res, next) => {
  try {
    const entry = await TimetableEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    await ChangeHistory.create({
      changedBy: req.user._id,
      changedByName: req.user.name,
      changeType: 'DELETE',
      timetableEntry: null,
      before: entry.toObject(),
      reason: req.body.reason || 'Timetable entry deleted',
    });

    await TimetableEntry.findByIdAndDelete(req.params.id);
    await syncConflictsInDB();

    res.status(200).json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish or Unpublish entire timetable / by section
// @route   POST /api/timetable/status
// @access  Admin only
exports.setPublishStatus = async (req, res, next) => {
  try {
    const { status, sectionId } = req.body;
    let query = {};
    if (sectionId && sectionId !== 'ALL') query.section = sectionId;

    await TimetableEntry.updateMany(query, { status: status || 'PUBLISHED' });

    await ChangeHistory.create({
      changedBy: req.user._id,
      changedByName: req.user.name,
      changeType: 'STATUS_CHANGE',
      reason: `Timetable status updated to ${status} for ${sectionId || 'all sections'}`,
    });

    res.status(200).json({ success: true, message: `Timetable status set to ${status}` });
  } catch (error) {
    next(error);
  }
};
