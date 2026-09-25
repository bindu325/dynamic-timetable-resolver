/**
 * Dynamic Timetable Conflict Resolver Engine
 * 
 * Algorithm & Architecture:
 * 1. Takes the conflicting timetable entry, all other active entries, available rooms, time slots, and faculty availability.
 * 2. Systematically generates candidate combinations of: (Day, TimeSlot, Room)
 * 3. Evaluates every candidate against all HARD CONSTRAINTS:
 *    - Faculty availability (must not be marked UNAVAILABLE)
 *    - Faculty collision (faculty cannot have another class at this time)
 *    - Room collision (room cannot be booked at this time)
 *    - Room active status & maintenance days
 *    - Section collision (section cannot have another class at this time)
 *    - Capacity check (room capacity >= section student count)
 * 4. Ranks surviving valid candidates using a multi-factor SOFT SCORING MODEL (0 - 100):
 *    - +30: Faculty explicitly marked this as PREFERRED slot
 *    - +25: Room is exact match for Subject type (e.g. LAB in Lab Room, THEORY in Classroom)
 *    - +15: Same day preference or minimal shift from original day
 *    - +15: Avoids timetable gaps for the section (compact section schedule)
 *    - +10: Optimal room capacity margin (avoids wasting a 120-seat auditorium on a 30-student class)
 *    - +5: Optimal daily faculty load distribution (avoids >4 classes/day)
 * 5. Returns sorted candidates with detailed constraint breakdowns, scores, advantages, and warnings.
 */

const { validateCandidateEntry, getIdStr, timeToMinutes } = require('./conflictEngine');

const resolveConflictsForEntry = async ({
  entryToChange,
  allEntries = [],
  allRooms = [],
  allTimeSlots = [],
  allFaculties = [],
  facultyDoc = null,
  sectionDoc = null,
  subjectDoc = null,
  preferences = {
    allowDayChange: true,
    allowRoomChange: true,
    allowFacultyChange: true,
    preferredDays: [],
  },
}) => {
  const candidates = [];
  const currentEntryId = getIdStr(entryToChange);

  // Filter out the conflicting entry from existing entries
  const backgroundEntries = allEntries.filter((e) => getIdStr(e) !== currentEntryId);

  // Unique days and unique slots
  const days = preferences.allowDayChange
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : [entryToChange.day];

  // Distinct time slot ranges
  const slotMap = new Map();
  allTimeSlots.forEach((slot) => {
    if (!slot.isBreak) {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, slot);
      }
    }
  });

  const uniqueTimeSlots = Array.from(slotMap.values());

  // If no slots configured, use standard default periods
  const standardSlots = uniqueTimeSlots.length > 0 ? uniqueTimeSlots : [
    { startTime: '09:00', endTime: '10:00', periodNumber: 1 },
    { startTime: '10:00', endTime: '11:00', periodNumber: 2 },
    { startTime: '11:15', endTime: '12:15', periodNumber: 3 },
    { startTime: '12:15', endTime: '13:15', periodNumber: 4 },
    { startTime: '14:00', endTime: '15:00', periodNumber: 5 },
    { startTime: '15:00', endTime: '16:00', periodNumber: 6 },
  ];

  // Candidate rooms to test
  const candidateRooms = preferences.allowRoomChange
    ? allRooms.filter((r) => r.available !== false)
    : allRooms.filter((r) => getIdStr(r) === getIdStr(entryToChange.room));

  // Candidate faculties to test
  let candidateFaculties = [facultyDoc].filter(Boolean);
  if (preferences.allowFacultyChange !== false && allFaculties && allFaculties.length > 0) {
    const origSubjectId = getIdStr(subjectDoc || entryToChange.subject);
    const origDept = subjectDoc?.department || facultyDoc?.department;

    // Filter faculties who either teach this subject or are in the same department
    const qualifiedFaculties = allFaculties.filter((f) => {
      const teachesSubject = f.subjects && f.subjects.some((s) => getIdStr(s) === origSubjectId);
      const sameDept = origDept ? f.department === origDept : true;
      return teachesSubject || sameDept;
    });

    if (qualifiedFaculties.length > 0) {
      candidateFaculties = qualifiedFaculties;
    } else {
      candidateFaculties = allFaculties;
    }
  }

  // Iterate over all permutations
  for (const day of days) {
    for (const slot of standardSlots) {
      for (const room of candidateRooms) {
        for (const candidateFaculty of candidateFaculties) {
          const isFacultySubstituted = getIdStr(candidateFaculty) !== getIdStr(facultyDoc);

          const proposedCandidate = {
            _id: entryToChange._id,
            academicYear: entryToChange.academicYear,
            semester: entryToChange.semester,
            section: entryToChange.section?._id || entryToChange.section,
            subject: entryToChange.subject?._id || entryToChange.subject,
            faculty: candidateFaculty._id,
            room: room._id,
            day: day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            periodNumber: slot.periodNumber || 1,
          };

          // Run Hard Validation
          const hardErrors = validateCandidateEntry({
            candidate: proposedCandidate,
            existingEntries: backgroundEntries,
            facultyDoc: candidateFaculty,
            sectionDoc,
            roomDoc: room,
            subjectDoc,
            ignoreEntryId: currentEntryId,
          });

          const isHardViolated = hardErrors.some((e) => e.severity === 'ERROR');

          if (isHardViolated) {
            // Reject invalid candidate from suggested list
            continue;
          }

          // Candidate passed all hard constraints! Calculate Soft Score
          let score = 50; // Baseline for a valid solution
          const advantages = [];
          const warnings = [];

          // Faculty & Time Slot matching priorities
          const isExactDayAndTime = day === entryToChange.day && slot.startTime === entryToChange.startTime;
          
          if (isFacultySubstituted) {
            // Finding an available faculty substitute for the exact time slot is the highest priority
            if (isExactDayAndTime) {
              score += 35;
              advantages.push(`Maintains original period (${entryToChange.day} ${entryToChange.startTime}-${entryToChange.endTime}) with substitute instructor: ${candidateFaculty.name}`);
            } else {
              score += 15;
              advantages.push(`Faculty substitute: ${candidateFaculty.name} (${candidateFaculty.department || 'Qualified'})`);
            }
          } else {
            // Retaining original instructor
            score += 10;
            advantages.push('Retains original instructor');
          }

          // Advantage 1: Same room as requested
          if (getIdStr(room) === getIdStr(entryToChange.room)) {
            score += 10;
            advantages.push('Keeps original preferred room');
          } else {
            advantages.push(`Alternative room: ${room.roomNumber} (${room.roomType}, Cap: ${room.capacity})`);
          }

          // Advantage 2: Same day as requested
          if (day === entryToChange.day) {
            score += 15;
            advantages.push('Maintains original scheduled day');
          } else {
            advantages.push(`Moved to ${day}`);
          }

          // Advantage 3: Candidate Faculty Preferred Time Slot Check
          let facultyPreferred = false;
          if (candidateFaculty?.availability) {
            const prefMatch = candidateFaculty.availability.find(
              (a) => a.day === day && a.startTime === slot.startTime && a.status === 'PREFERRED'
            );
            if (prefMatch) {
              score += 20;
              facultyPreferred = true;
              advantages.push('Matches faculty preferred working slot');
            }
          }
          if (candidateFaculty?.preferredTimeSlots?.some((s) => s.includes(day) && s.includes(slot.startTime))) {
            if (!facultyPreferred) {
              score += 15;
              advantages.push('Matches faculty listed preferred hours');
            }
          }

          // Advantage 4: Room Type Match
          if (subjectDoc?.type === 'LAB') {
            if (room.roomType === 'LAB') {
              score += 15;
              advantages.push('Perfect lab facility match');
            } else {
              score -= 10;
              warnings.push('Lab course assigned to non-lab classroom');
            }
          } else if (room.roomType === 'CLASSROOM') {
            score += 10;
            advantages.push('Optimal classroom environment for theory lecture');
          }

          // Advantage 5: Capacity Efficiency
          const studentCount = sectionDoc?.studentCount || 40;
          const capacityRatio = studentCount / (room.capacity || 1);
          if (capacityRatio >= 0.6 && capacityRatio <= 0.95) {
            score += 10;
            advantages.push('Optimal seat utilization (60%-95% room fullness)');
          } else if (capacityRatio < 0.4) {
            score -= 5;
            warnings.push(`Room capacity (${room.capacity}) is much larger than section size (${studentCount})`);
          }

          // Advantage 6: Section workload compactness
          // Check if section already has class right before or after this slot on the same day
          const adjacentClass = backgroundEntries.find((e) => {
            if (getIdStr(e.section) !== getIdStr(sectionDoc)) return false;
            if (e.day !== day) return false;
            return e.endTime === slot.startTime || e.startTime === slot.endTime;
          });

          if (adjacentClass) {
            score += 10;
            advantages.push('Creates a continuous class block (no idle gap for students)');
          }

          // Cap score at 100
          const finalScore = Math.min(100, Math.max(10, score));

          candidates.push({
            candidate: proposedCandidate,
            day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            periodNumber: slot.periodNumber || 1,
            room: {
              _id: room._id,
              roomNumber: room.roomNumber,
              building: room.building,
              capacity: room.capacity,
              roomType: room.roomType,
            },
            faculty: {
              _id: candidateFaculty?._id,
              name: candidateFaculty?.name,
              department: candidateFaculty?.department,
            },
            section: {
              _id: sectionDoc?._id,
              name: sectionDoc?.name,
            },
            subject: {
              _id: subjectDoc?._id,
              name: subjectDoc?.name,
              code: subjectDoc?.code,
            },
            score: finalScore,
            hardConstraintsPassed: true,
            advantages,
            warnings,
            explanation: `Score ${finalScore}/100: ${advantages.slice(0, 3).join(', ')}`,
          });
        }
      }
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  // Return top 10 best feasible alternatives
  return candidates.slice(0, 10);
};

/**
 * Calculates impact analysis of changing an entry from Old -> New
 */
const calculateImpactAnalysis = ({
  originalEntry,
  proposedEntry,
  allEntries = [],
  faculties = [],
  sections = [],
  rooms = [],
  subjects = [],
}) => {
  const origFaculty = faculties.find((f) => getIdStr(f) === getIdStr(originalEntry.faculty));
  const origSection = sections.find((s) => getIdStr(s) === getIdStr(originalEntry.section));
  const origRoom = rooms.find((r) => getIdStr(r) === getIdStr(originalEntry.room));
  const origSubject = subjects.find((s) => getIdStr(s) === getIdStr(originalEntry.subject));

  const propFaculty = faculties.find((f) => getIdStr(f) === getIdStr(proposedEntry.faculty)) || origFaculty;
  const propSection = sections.find((s) => getIdStr(s) === getIdStr(proposedEntry.section)) || origSection;
  const propRoom = rooms.find((r) => getIdStr(r) === getIdStr(proposedEntry.room)) || origRoom;
  const propSubject = subjects.find((s) => getIdStr(s) === getIdStr(proposedEntry.subject)) || origSubject;

  // Simulate replacement
  const simulatedEntries = allEntries
    .filter((e) => getIdStr(e) !== getIdStr(originalEntry))
    .concat([{ ...proposedEntry, _id: originalEntry._id || 'SIMULATED' }]);

  const conflicts = validateCandidateEntry({
    candidate: proposedEntry,
    existingEntries: allEntries,
    facultyDoc: propFaculty,
    sectionDoc: propSection,
    roomDoc: propRoom,
    subjectDoc: propSubject,
    ignoreEntryId: originalEntry._id,
  });

  const isFeasible = !conflicts.some((c) => c.severity === 'ERROR');

  return {
    isFeasible,
    conflictCount: conflicts.length,
    conflicts,
    before: {
      day: originalEntry.day,
      time: `${originalEntry.startTime}-${originalEntry.endTime}`,
      faculty: origFaculty?.name || 'Faculty',
      room: origRoom?.roomNumber || 'Room',
      section: origSection?.name || 'Section',
      subject: origSubject?.name || 'Subject',
    },
    after: {
      day: proposedEntry.day,
      time: `${proposedEntry.startTime}-${proposedEntry.endTime}`,
      faculty: propFaculty?.name || 'Faculty',
      room: propRoom?.roomNumber || 'Room',
      section: propSection?.name || 'Section',
      subject: propSubject?.name || 'Subject',
    },
    summary: isFeasible
      ? 'Proposed schedule change is valid with 0 hard conflicts.'
      : `Proposed schedule change introduces ${conflicts.length} conflict(s).`,
  };
};

module.exports = {
  resolveConflictsForEntry,
  calculateImpactAnalysis,
};
