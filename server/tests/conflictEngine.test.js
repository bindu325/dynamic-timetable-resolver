const assert = require('assert');
const {
  timeToMinutes,
  checkTimeOverlap,
  validateCandidateEntry,
  detectAllConflicts,
} = require('../src/services/conflictEngine');
const { resolveConflictsForEntry } = require('../src/services/resolverEngine');

console.log('--- STARTING CONFLICT ENGINE & RESOLVER TEST SUITE ---');

// Test 1: Time overlap math
assert.strictEqual(timeToMinutes('09:00'), 540);
assert.strictEqual(timeToMinutes('10:30'), 630);
assert.strictEqual(checkTimeOverlap('Monday', '09:00', '10:00', 'Monday', '09:30', '10:30'), true);
assert.strictEqual(checkTimeOverlap('Monday', '09:00', '10:00', 'Monday', '10:00', '11:00'), false); // adjacent, no overlap
assert.strictEqual(checkTimeOverlap('Monday', '09:00', '10:00', 'Tuesday', '09:00', '10:00'), false); // different day
console.log('✓ Time conversion and overlap math verified.');

// Test 2: Faculty Conflict Detection
const facultyA = { _id: 'fac_1', name: 'Dr. Priya' };
const existingEntries = [
  {
    _id: 'entry_1',
    faculty: 'fac_1',
    room: 'room_1',
    section: 'sec_1',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
  },
];

const overlappingCandidate = {
  faculty: 'fac_1',
  room: 'room_2',
  section: 'sec_2',
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
};

const facultyConflicts = validateCandidateEntry({
  candidate: overlappingCandidate,
  existingEntries,
  facultyDoc: facultyA,
});
assert.strictEqual(facultyConflicts.some((c) => c.type === 'FACULTY_CONFLICT'), true);
console.log('✓ Faculty conflict accurately detected.');

// Test 3: Room Conflict Detection
const roomCandidate = {
  faculty: 'fac_2',
  room: 'room_1',
  section: 'sec_2',
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
};
const roomConflicts = validateCandidateEntry({
  candidate: roomCandidate,
  existingEntries,
  roomDoc: { _id: 'room_1', roomNumber: '101', capacity: 100 },
});
assert.strictEqual(roomConflicts.some((c) => c.type === 'ROOM_CONFLICT'), true);
console.log('✓ Room conflict accurately detected.');

// Test 4: Capacity Conflict Detection
const capacityCandidate = {
  faculty: 'fac_3',
  room: 'room_small',
  section: 'sec_large',
  day: 'Tuesday',
  startTime: '09:00',
  endTime: '10:00',
};
const capacityConflicts = validateCandidateEntry({
  candidate: capacityCandidate,
  existingEntries: [],
  sectionDoc: { _id: 'sec_large', name: 'CSE-A', studentCount: 65 },
  roomDoc: { _id: 'room_small', roomNumber: '202', capacity: 40 },
});
assert.strictEqual(capacityConflicts.some((c) => c.type === 'CAPACITY_CONFLICT'), true);
console.log('✓ Capacity constraint violation accurately detected.');

// Test 5: Faculty Availability Conflict Detection
const unavailFaculty = {
  _id: 'fac_4',
  name: 'Dr. Sunita',
  availability: [
    { day: 'Wednesday', startTime: '10:00', endTime: '11:00', status: 'UNAVAILABLE' },
  ],
};
const availConflicts = validateCandidateEntry({
  candidate: { faculty: 'fac_4', day: 'Wednesday', startTime: '10:00', endTime: '11:00' },
  existingEntries: [],
  facultyDoc: unavailFaculty,
});
assert.strictEqual(availConflicts.some((c) => c.type === 'FACULTY_AVAILABILITY_CONFLICT'), true);
console.log('✓ Faculty un-availability constraint accurately detected.');

// Test 6: Resolver Engine Generates and Ranks Valid Feasible Candidates
(async () => {
  const allRooms = [
    { _id: 'room_1', roomNumber: '101', capacity: 70, roomType: 'CLASSROOM', available: true },
    { _id: 'room_2', roomNumber: '102', capacity: 70, roomType: 'CLASSROOM', available: true },
  ];
  const allTimeSlots = [
    { day: 'Monday', startTime: '09:00', endTime: '10:00', periodNumber: 1 },
    { day: 'Monday', startTime: '10:00', endTime: '11:00', periodNumber: 2 },
    { day: 'Tuesday', startTime: '09:00', endTime: '10:00', periodNumber: 1 },
  ];

  const conflictingEntry = {
    _id: 'entry_conflicted',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    faculty: facultyA,
    room: allRooms[0],
    section: { _id: 'sec_1', name: 'CSE-A', studentCount: 50 },
    subject: { _id: 'sub_1', name: 'DSA', type: 'THEORY' },
  };

  const alternatives = await resolveConflictsForEntry({
    entryToChange: conflictingEntry,
    allEntries: existingEntries, // existing entry occupies Monday 09:00-10:00 for facultyA
    allRooms,
    allTimeSlots,
    facultyDoc: facultyA,
    sectionDoc: { _id: 'sec_1', name: 'CSE-A', studentCount: 50 },
    subjectDoc: { _id: 'sub_1', name: 'DSA', type: 'THEORY' },
  });

  assert.ok(alternatives.length > 0, 'Resolver should find alternative slots');
  // Check that NO returned alternative violates Monday 09:00-10:00 (which is occupied)
  const violates = alternatives.some((alt) => alt.day === 'Monday' && alt.startTime === '09:00');
  assert.strictEqual(violates, false, 'Resolver must NOT suggest occupied slot');

  // Verify alternatives are sorted by score
  for (let i = 0; i < alternatives.length - 1; i++) {
    assert.ok(
      alternatives[i].score >= alternatives[i + 1].score,
      'Alternatives must be ordered descending by score'
    );
  }

  // Test 7: Faculty Substitution for exact conflicting period
  const facultyB = { _id: 'fac_2', name: 'Prof. Ramesh', department: 'CSE', subjects: ['sub_1'] };
  const conflictingEntryFacultyOnly = {
    _id: 'entry_conflicted_2',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    faculty: facultyA,
    room: allRooms[1],
    section: { _id: 'sec_2', name: 'CSE-B', studentCount: 50 },
    subject: { _id: 'sub_1', name: 'DSA', type: 'THEORY' },
  };

  const subAlternatives = await resolveConflictsForEntry({
    entryToChange: conflictingEntryFacultyOnly,
    allEntries: existingEntries, // Faculty A has class with sec_1 on Monday 09:00-10:00 in room_1
    allRooms,
    allTimeSlots,
    allFaculties: [facultyA, facultyB],
    facultyDoc: facultyA,
    sectionDoc: { _id: 'sec_2', name: 'CSE-B', studentCount: 50 },
    subjectDoc: { _id: 'sub_1', name: 'DSA', type: 'THEORY', department: 'CSE' },
    preferences: { allowDayChange: false, allowRoomChange: true, allowFacultyChange: true },
  });

  assert.ok(subAlternatives.length > 0, 'Should find candidate with faculty substitute');
  const foundSubstituteAtSameSlot = subAlternatives.some(
    (alt) => alt.day === 'Monday' && alt.startTime === '09:00' && alt.faculty._id === 'fac_2'
  );
  assert.strictEqual(foundSubstituteAtSameSlot, true, 'Should find substitute faculty for same time slot');
  // Test 8: Vacant room allocation on exact same day and period
  const conflictingEntryRoomOnly = {
    _id: 'entry_conflicted_room',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    faculty: facultyB, // Faculty B is free at Monday 09:00-10:00
    room: allRooms[0], // Room 1 is occupied by entry_1
    section: { _id: 'sec_2', name: 'CSE-B', studentCount: 50 },
    subject: { _id: 'sub_1', name: 'DSA', type: 'THEORY' },
  };

  const roomAlternatives = await resolveConflictsForEntry({
    entryToChange: conflictingEntryRoomOnly,
    allEntries: existingEntries, // Room 1 is occupied on Monday 09:00-10:00
    allRooms,
    allTimeSlots,
    allFaculties: [facultyA, facultyB],
    facultyDoc: facultyB,
    sectionDoc: { _id: 'sec_2', name: 'CSE-B', studentCount: 50 },
    subjectDoc: { _id: 'sub_1', name: 'DSA', type: 'THEORY', department: 'CSE' },
    preferences: { allowDayChange: true, allowRoomChange: true, allowFacultyChange: false },
  });

  assert.ok(roomAlternatives.length > 0, 'Should find alternative room');
  assert.strictEqual(roomAlternatives[0].day, 'Monday', 'Top choice must remain on the same day');
  assert.strictEqual(roomAlternatives[0].startTime, '09:00', 'Top choice must remain in the same period');
  assert.strictEqual(roomAlternatives[0].room._id, 'room_2', 'Top choice must be the vacant room_2');
  console.log('✓ Vacant alternative room on same day & period verified as top recommendation.');

  console.log('✓ Resolver engine successfully generated and ranked feasible alternatives.');
  console.log('--- ALL BACKEND ENGINE TESTS PASSED (100% SUCCESS) ---');
})();
