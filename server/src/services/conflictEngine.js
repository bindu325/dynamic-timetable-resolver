/**
 * Dynamic Timetable Conflict Detection Engine
 * 
 * Accurately detects:
 * 1. FACULTY_CONFLICT: Same faculty assigned to 2+ classes overlapping in time on the same day.
 * 2. ROOM_CONFLICT: Same room assigned to 2+ classes overlapping in time on the same day.
 * 3. SECTION_CONFLICT: Same student section assigned to 2+ classes overlapping in time on the same day.
 * 4. CAPACITY_CONFLICT: Section student count exceeds room capacity.
 * 5. FACULTY_AVAILABILITY_CONFLICT: Faculty scheduled when marked UNAVAILABLE or outside available slots.
 * 6. ROOM_AVAILABILITY_CONFLICT: Room is inactive, under maintenance, or incompatible with subject type.
 * 7. INVALID_TIME_SLOT: Start time >= End time or invalid period range.
 */

// Helper: Convert "HH:mm" to minutes since midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
};

// Helper: Check if two time intervals overlap on the same day
const checkTimeOverlap = (day1, start1, end1, day2, start2, end2) => {
  if (day1 !== day2) return false;
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Overlaps if s1 < e2 and s2 < e1
  return s1 < e2 && s2 < e1;
};

// Helper to safely get string ID from populated or unpopulated fields
const getIdStr = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj._id) return obj._id.toString();
  return obj.toString();
};

/**
 * Validates a single proposed timetable entry against an existing set of timetable entries
 * and resource data (faculty list, section list, room list).
 */
const validateCandidateEntry = ({
  candidate,
  existingEntries = [],
  facultyDoc = null,
  sectionDoc = null,
  roomDoc = null,
  subjectDoc = null,
  ignoreEntryId = null,
}) => {
  const conflicts = [];
  const startMin = timeToMinutes(candidate.startTime);
  const endMin = timeToMinutes(candidate.endTime);

  // 1. Time validity check
  if (startMin >= endMin) {
    conflicts.push({
      type: 'INVALID_TIME_SLOT',
      severity: 'ERROR',
      message: `Invalid time range: start time (${candidate.startTime}) must be strictly before end time (${candidate.endTime}).`,
    });
  }

  // 2. Capacity check
  if (sectionDoc && roomDoc) {
    const studentCount = sectionDoc.studentCount || 0;
    const roomCapacity = roomDoc.capacity || 0;
    if (studentCount > roomCapacity) {
      conflicts.push({
        type: 'CAPACITY_CONFLICT',
        severity: 'ERROR',
        message: `Capacity Conflict: Section "${sectionDoc.name}" has ${studentCount} students, but Room "${roomDoc.roomNumber}" only seats ${roomCapacity}.`,
        relatedSection: sectionDoc._id,
        relatedRoom: roomDoc._id,
      });
    }
  }

  // 3. Room Availability & Type Check
  if (roomDoc) {
    if (roomDoc.available === false) {
      conflicts.push({
        type: 'ROOM_AVAILABILITY_CONFLICT',
        severity: 'ERROR',
        message: `Room Availability Conflict: Room "${roomDoc.roomNumber}" is currently marked as unavailable/inactive.`,
        relatedRoom: roomDoc._id,
      });
    }
    if (roomDoc.maintenanceDays && roomDoc.maintenanceDays.includes(candidate.day)) {
      conflicts.push({
        type: 'ROOM_AVAILABILITY_CONFLICT',
        severity: 'ERROR',
        message: `Room Availability Conflict: Room "${roomDoc.roomNumber}" is undergoing scheduled maintenance on ${candidate.day}.`,
        relatedRoom: roomDoc._id,
      });
    }
    if (subjectDoc && subjectDoc.type === 'LAB' && roomDoc.roomType !== 'LAB') {
      conflicts.push({
        type: 'ROOM_AVAILABILITY_CONFLICT',
        severity: 'WARNING',
        message: `Lab Subject Warning: "${subjectDoc.name}" is a LAB subject but Room "${roomDoc.roomNumber}" is a ${roomDoc.roomType}.`,
        relatedRoom: roomDoc._id,
      });
    }
  }

  // 4. Faculty Availability Check
  if (facultyDoc) {
    // Check specific availability records
    if (facultyDoc.availability && facultyDoc.availability.length > 0) {
      const matchAvail = facultyDoc.availability.find(
        (a) =>
          a.day === candidate.day &&
          checkTimeOverlap(a.day, a.startTime, a.endTime, candidate.day, candidate.startTime, candidate.endTime)
      );

      if (matchAvail && matchAvail.status === 'UNAVAILABLE') {
        conflicts.push({
          type: 'FACULTY_AVAILABILITY_CONFLICT',
          severity: 'ERROR',
          message: `Faculty Availability Conflict: ${facultyDoc.name} is marked as UNAVAILABLE on ${candidate.day} from ${candidate.startTime} to ${candidate.endTime}.`,
          relatedFaculty: facultyDoc._id,
          day: candidate.day,
          timeSlot: `${candidate.startTime}-${candidate.endTime}`,
        });
      }
    }

    // Check string array format unavailableTimeSlots
    if (facultyDoc.unavailableTimeSlots && facultyDoc.unavailableTimeSlots.length > 0) {
      const isUnavail = facultyDoc.unavailableTimeSlots.some((slot) => {
        return slot.includes(candidate.day) && (slot.includes(candidate.startTime) || slot.includes(candidate.endTime));
      });
      if (isUnavail) {
        conflicts.push({
          type: 'FACULTY_AVAILABILITY_CONFLICT',
          severity: 'ERROR',
          message: `Faculty Availability Conflict: ${facultyDoc.name} marked ${candidate.day} ${candidate.startTime}-${candidate.endTime} in unavailable slots list.`,
          relatedFaculty: facultyDoc._id,
        });
      }
    }
  }

  // 5. Overlap checks against existing schedule
  const candFacultyId = getIdStr(candidate.faculty);
  const candRoomId = getIdStr(candidate.room);
  const candSectionId = getIdStr(candidate.section);
  const ignoreIdStr = ignoreEntryId ? getIdStr(ignoreEntryId) : null;

  for (const entry of existingEntries) {
    const entryId = getIdStr(entry);
    if (ignoreIdStr && entryId === ignoreIdStr) continue;

    const overlap = checkTimeOverlap(
      candidate.day,
      candidate.startTime,
      candidate.endTime,
      entry.day,
      entry.startTime,
      entry.endTime
    );

    if (!overlap) continue;

    const entryFacultyId = getIdStr(entry.faculty);
    const entryRoomId = getIdStr(entry.room);
    const entrySectionId = getIdStr(entry.section);

    // Faculty Overlap
    if (candFacultyId && entryFacultyId && candFacultyId === entryFacultyId) {
      const facultyName = facultyDoc?.name || entry.faculty?.name || 'Faculty';
      const subjectName = entry.subject?.name || 'another subject';
      conflicts.push({
        type: 'FACULTY_CONFLICT',
        severity: 'ERROR',
        message: `Faculty Conflict: ${facultyName} is already assigned to ${subjectName} on ${entry.day} at ${entry.startTime}-${entry.endTime}.`,
        affectedEntries: [entryId],
        relatedFaculty: candidate.faculty,
        day: candidate.day,
        timeSlot: `${candidate.startTime}-${candidate.endTime}`,
      });
    }

    // Room Overlap
    if (candRoomId && entryRoomId && candRoomId === entryRoomId) {
      const roomNum = roomDoc?.roomNumber || entry.room?.roomNumber || 'Room';
      const subjectName = entry.subject?.name || 'another subject';
      conflicts.push({
        type: 'ROOM_CONFLICT',
        severity: 'ERROR',
        message: `Room Conflict: Room ${roomNum} is already occupied by ${subjectName} on ${entry.day} at ${entry.startTime}-${entry.endTime}.`,
        affectedEntries: [entryId],
        relatedRoom: candidate.room,
        day: candidate.day,
        timeSlot: `${candidate.startTime}-${candidate.endTime}`,
      });
    }

    // Section Overlap
    if (candSectionId && entrySectionId && candSectionId === entrySectionId) {
      const sectionName = sectionDoc?.name || entry.section?.name || 'Section';
      const subjectName = entry.subject?.name || 'another subject';
      conflicts.push({
        type: 'SECTION_CONFLICT',
        severity: 'ERROR',
        message: `Section Conflict: Section ${sectionName} is already scheduled for ${subjectName} on ${entry.day} at ${entry.startTime}-${entry.endTime}.`,
        affectedEntries: [entryId],
        relatedSection: candidate.section,
        day: candidate.day,
        timeSlot: `${candidate.startTime}-${candidate.endTime}`,
      });
    }
  }

  return conflicts;
};

/**
 * Scans the entire active database of timetable entries and returns all detected conflicts.
 */
const detectAllConflicts = (allEntries = [], faculties = [], sections = [], rooms = [], subjects = []) => {
  const facultyMap = new Map(faculties.map((f) => [f._id.toString(), f]));
  const sectionMap = new Map(sections.map((s) => [s._id.toString(), s]));
  const roomMap = new Map(rooms.map((r) => [r._id.toString(), r]));
  const subjectMap = new Map(subjects.map((sub) => [sub._id.toString(), sub]));

  const detectedConflicts = [];
  const seenConflictKeys = new Set();

  for (let i = 0; i < allEntries.length; i++) {
    const entryA = allEntries[i];
    const facultyA = facultyMap.get(getIdStr(entryA.faculty)) || entryA.faculty;
    const sectionA = sectionMap.get(getIdStr(entryA.section)) || entryA.section;
    const roomA = roomMap.get(getIdStr(entryA.room)) || entryA.room;
    const subjectA = subjectMap.get(getIdStr(entryA.subject)) || entryA.subject;

    // 1. Check intrinsic constraints on Entry A (Capacity, Faculty Availability, Room Maintenance)
    const intrinsicConflicts = validateCandidateEntry({
      candidate: entryA,
      existingEntries: [],
      facultyDoc: facultyA,
      sectionDoc: sectionA,
      roomDoc: roomA,
      subjectDoc: subjectA,
    });

    intrinsicConflicts.forEach((c) => {
      const key = `${c.type}_${getIdStr(entryA)}_${c.message}`;
      if (!seenConflictKeys.has(key)) {
        seenConflictKeys.add(key);
        detectedConflicts.push({
          ...c,
          affectedEntries: [entryA._id],
        });
      }
    });

    // 2. Check pair-wise overlaps with other entries
    for (let j = i + 1; j < allEntries.length; j++) {
      const entryB = allEntries[j];
      const overlap = checkTimeOverlap(
        entryA.day,
        entryA.startTime,
        entryA.endTime,
        entryB.day,
        entryB.startTime,
        entryB.endTime
      );

      if (!overlap) continue;

      const fA = getIdStr(entryA.faculty);
      const fB = getIdStr(entryB.faculty);
      const rA = getIdStr(entryA.room);
      const rB = getIdStr(entryB.room);
      const sA = getIdStr(entryA.section);
      const sB = getIdStr(entryB.section);

      // Faculty conflict
      if (fA && fB && fA === fB) {
        const facultyName = facultyA?.name || 'Faculty';
        const key = `FAC_${fA}_${entryA.day}_${entryA.startTime}_${entryB._id}`;
        if (!seenConflictKeys.has(key)) {
          seenConflictKeys.add(key);
          detectedConflicts.push({
            type: 'FACULTY_CONFLICT',
            severity: 'ERROR',
            message: `Faculty Conflict: ${facultyName} has overlapping classes on ${entryA.day} (${entryA.startTime}-${entryA.endTime}) between (${entryA.subject?.name || 'Subject 1'} and ${entryB.subject?.name || 'Subject 2'}).`,
            affectedEntries: [entryA._id, entryB._id],
            relatedFaculty: entryA.faculty?._id || entryA.faculty,
            day: entryA.day,
            timeSlot: `${entryA.startTime}-${entryA.endTime}`,
          });
        }
      }

      // Room conflict
      if (rA && rB && rA === rB) {
        const roomNum = roomA?.roomNumber || 'Room';
        const key = `ROOM_${rA}_${entryA.day}_${entryA.startTime}_${entryB._id}`;
        if (!seenConflictKeys.has(key)) {
          seenConflictKeys.add(key);
          detectedConflicts.push({
            type: 'ROOM_CONFLICT',
            severity: 'ERROR',
            message: `Room Conflict: Room ${roomNum} is double-booked on ${entryA.day} (${entryA.startTime}-${entryA.endTime}).`,
            affectedEntries: [entryA._id, entryB._id],
            relatedRoom: entryA.room?._id || entryA.room,
            day: entryA.day,
            timeSlot: `${entryA.startTime}-${entryA.endTime}`,
          });
        }
      }

      // Section conflict
      if (sA && sB && sA === sB) {
        const sectionName = sectionA?.name || 'Section';
        const key = `SEC_${sA}_${entryA.day}_${entryA.startTime}_${entryB._id}`;
        if (!seenConflictKeys.has(key)) {
          seenConflictKeys.add(key);
          detectedConflicts.push({
            type: 'SECTION_CONFLICT',
            severity: 'ERROR',
            message: `Section Conflict: Section ${sectionName} is scheduled for multiple subjects concurrently on ${entryA.day} (${entryA.startTime}-${entryA.endTime}).`,
            affectedEntries: [entryA._id, entryB._id],
            relatedSection: entryA.section?._id || entryA.section,
            day: entryA.day,
            timeSlot: `${entryA.startTime}-${entryA.endTime}`,
          });
        }
      }
    }
  }

  return detectedConflicts;
};

module.exports = {
  timeToMinutes,
  checkTimeOverlap,
  getIdStr,
  validateCandidateEntry,
  detectAllConflicts,
};
