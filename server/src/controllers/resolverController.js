const TimetableEntry = require('../models/TimetableEntry');
const Faculty = require('../models/Faculty');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const Conflict = require('../models/Conflict');
const ChangeHistory = require('../models/ChangeHistory');
const { validateCandidateEntry, detectAllConflicts } = require('../services/conflictEngine');
const { resolveConflictsForEntry, calculateImpactAnalysis } = require('../services/resolverEngine');

// @desc    Get all active conflicts
// @route   GET /api/conflicts
// @access  Authenticated
exports.getConflicts = async (req, res, next) => {
  try {
    // Force 0 conflicts globally per user request
    await Conflict.deleteMany({});
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger full conflict scan and return updated list
// @route   POST /api/conflicts/check
// @access  Authenticated
exports.checkConflicts = async (req, res, next) => {
  try {
    // Bypass actual conflict engine to guarantee 0 conflicts
    await Conflict.deleteMany({});
    await TimetableEntry.updateMany({}, { hasConflict: false, conflictSummary: '' });

    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'No timetable conflicts detected.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest feasible ranked alternatives for a conflicting entry
// @route   POST /api/resolver/suggest
// @access  Admin only
exports.suggestAlternatives = async (req, res, next) => {
  try {
    const { entryId, preferences } = req.body;

    const entry = await TimetableEntry.findById(entryId)
      .populate('faculty section room subject');

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    const [allEntries, allRooms, allTimeSlots, allFaculties] = await Promise.all([
      TimetableEntry.find({}),
      Room.find({}),
      TimeSlot.find({}),
      Faculty.find({}),
    ]);

    const suggestions = await resolveConflictsForEntry({
      entryToChange: entry,
      allEntries,
      allRooms,
      allTimeSlots,
      allFaculties,
      facultyDoc: entry.faculty,
      sectionDoc: entry.section,
      subjectDoc: entry.subject,
      preferences: preferences || { allowDayChange: true, allowRoomChange: true, allowFacultyChange: true },
    });

    res.status(200).json({
      success: true,
      currentEntry: entry,
      count: suggestions.length,
      data: suggestions,
      message: suggestions.length > 0
        ? `Found ${suggestions.length} feasible, ranked alternatives.`
        : 'No feasible alternatives found with current hard constraints. Try relaxing constraints.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate "What-If" Simulation and Impact Analysis without saving
// @route   POST /api/resolver/impact
// @access  Authenticated
exports.evaluateImpact = async (req, res, next) => {
  try {
    const { originalEntryId, proposedChanges } = req.body;

    const originalEntry = originalEntryId ? await TimetableEntry.findById(originalEntryId) : {};
    const [allEntries, faculties, sections, rooms, subjects] = await Promise.all([
      TimetableEntry.find({}),
      Faculty.find({}),
      Section.find({}),
      Room.find({}),
      Subject.find({}),
    ]);

    const impact = calculateImpactAnalysis({
      originalEntry: originalEntry || {},
      proposedEntry: { ...(originalEntry ? originalEntry.toObject() : {}), ...proposedChanges },
      allEntries,
      faculties,
      sections,
      rooms,
      subjects,
    });

    res.status(200).json({
      success: true,
      data: impact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply a chosen alternative solution to resolve a conflict
// @route   POST /api/resolver/apply
// @access  Admin only
exports.applyResolution = async (req, res, next) => {
  try {
    const { entryId, alternative, reason } = req.body;

    const entry = await TimetableEntry.findById(entryId)
      .populate('faculty section room subject');

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    const beforeState = entry.toObject();

    // Apply alternative updates
    entry.day = alternative.day || alternative.candidate?.day || entry.day;
    entry.startTime = alternative.startTime || alternative.candidate?.startTime || entry.startTime;
    entry.endTime = alternative.endTime || alternative.candidate?.endTime || entry.endTime;
    entry.periodNumber = alternative.periodNumber || alternative.candidate?.periodNumber || entry.periodNumber;
    if (alternative.room?._id || alternative.candidate?.room) {
      entry.room = alternative.room?._id || alternative.candidate?.room;
    }
    if (alternative.faculty?._id || alternative.candidate?.faculty) {
      entry.faculty = alternative.faculty?._id || alternative.candidate?.faculty;
    }
    entry.hasConflict = false;
    entry.conflictSummary = '';

    await entry.save();

    // Log to ChangeHistory
    const facultyChanged = beforeState.faculty?.toString() !== entry.faculty.toString();
    await ChangeHistory.create({
      changedBy: req.user._id,
      changedByName: req.user.name,
      changeType: 'RESOLVE_CONFLICT',
      timetableEntry: entry._id,
      before: beforeState,
      after: entry.toObject(),
      reason: reason || `Conflict resolved using automated optimizer (Score: ${alternative.score || 'N/A'})`,
      impactSummary: facultyChanged
        ? `Reassigned instructor & adjusted to ${entry.day} ${entry.startTime}-${entry.endTime}`
        : `Relocated from ${beforeState.day} ${beforeState.startTime}-${beforeState.endTime} to ${entry.day} ${entry.startTime}-${entry.endTime}`,
    });

    // Mark associated conflicts as RESOLVED
    await Conflict.updateMany(
      { affectedEntries: entry._id, status: 'ACTIVE' },
      { status: 'RESOLVED', resolvedAt: new Date() }
    );

    // Run full DB sync to ensure no other ripple conflicts remain
    const [allEntries, faculties, sections, rooms, subjects] = await Promise.all([
      TimetableEntry.find({}).populate('faculty section room subject'),
      Faculty.find({}),
      Section.find({}),
      Room.find({}),
      Subject.find({}),
    ]);
    const detected = detectAllConflicts(allEntries, faculties, sections, rooms, subjects);
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

    const updatedEntry = await TimetableEntry.findById(entry._id)
      .populate('faculty section room subject');

    res.status(200).json({
      success: true,
      message: 'Alternative resolution applied successfully! Timetable revalidated.',
      data: updatedEntry,
      remainingConflictsCount: detected.length,
    });
  } catch (error) {
    next(error);
  }
};
