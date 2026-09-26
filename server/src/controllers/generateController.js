const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const TimetableEntry = require('../models/TimetableEntry');
const Conflict = require('../models/Conflict');
const ChangeHistory = require('../models/ChangeHistory');
const { detectAllConflicts } = require('../services/conflictEngine');

// Helper to chunk arrays
const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

exports.generateTimetable = async (req, res) => {
  try {
    const {
      studentCount,
      facultyCount,
      facultyNames,
      classroomCount,
      classroomNumbers,
      blockCount,
      subjectCount,
      subjectNames,
      departmentList,
      workingDays,
      periodsPerDay,
      maxFacultyWorkload
    } = req.body;

    // Parse CSV inputs
    const parsedClassrooms = (classroomNumbers || '').split(',').map(s => s.trim()).filter(Boolean);
    const parsedFaculty = (facultyNames || '').split(',').map(s => s.trim()).filter(Boolean);
    const parsedSubjects = (subjectNames || '').split(',').map(s => s.trim()).filter(Boolean);
    const parsedDepartments = (departmentList || 'ACSE, CSE, ECE, EEE, MECH, CIVIL').split(',').map(s => s.trim()).filter(Boolean);
    const parsedDays = (workingDays || 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday').split(',').map(s => s.trim()).filter(Boolean);

    // Provide fallbacks if missing
    const DEPARTMENTS = parsedDepartments.length ? parsedDepartments : ['ACSE', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
    const DAYS = parsedDays.length ? parsedDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Generate dynamic hours based on periodsPerDay (assuming 1 hour per period, starting at 09:00)
    const pCount = Number(periodsPerDay) || 6;
    const HOURS = [];
    for(let i=0; i <= pCount; i++) {
        const hour = 9 + i; // 09:00, 10:00, etc.
        HOURS.push(`${hour < 10 ? '0'+hour : hour}:00`);
    }

    console.log('[Generate] Clearing existing collections...');
    await Promise.all([
      Faculty.deleteMany({}),
      Section.deleteMany({}),
      Subject.deleteMany({}),
      Room.deleteMany({}),
      TimeSlot.deleteMany({}),
      TimetableEntry.deleteMany({}),
      Conflict.deleteMany({}),
    ]);

    // 1. TimeSlots
    console.log('[Generate] Creating TimeSlots...');
    const timeSlotDocs = [];
    for (const day of DAYS) {
      let period = 1;
      for (let i = 0; i < Math.min(HOURS.length - 1, Number(periodsPerDay) || 6); i++) {
        timeSlotDocs.push({
          day,
          startTime: HOURS[i],
          endTime: HOURS[i + 1],
          periodNumber: period++,
          label: `Period ${period - 1}`
        });
      }
    }
    const createdTimeSlots = await TimeSlot.insertMany(timeSlotDocs);

    // 2. Rooms
    console.log('[Generate] Creating Rooms...');
    const roomDocs = [];
    
    // Add specific requested classrooms
    parsedClassrooms.forEach((rm, idx) => {
      roomDocs.push({ 
        roomNumber: rm, 
        building: `Block ${Math.floor(idx % (Number(blockCount) || 1)) + 1}`, 
        capacity: Math.floor(Number(studentCount) / (Number(classroomCount) || 1)), 
        roomType: 'CLASSROOM' 
      });
    });

    // Fill the rest if count is larger
    let roomIndex = 1;
    while (roomDocs.length < Number(classroomCount)) {
      roomDocs.push({
        roomNumber: `CR-AUTO-${roomIndex++}`,
        building: `Block ${Math.floor(Math.random() * (Number(blockCount) || 1)) + 1}`,
        capacity: 60,
        roomType: 'CLASSROOM'
      });
    }
    const createdRooms = await Room.insertMany(roomDocs);

    // 3. Subjects
    console.log('[Generate] Creating Subjects...');
    const subjectDocs = [];
    parsedSubjects.forEach((sub, idx) => {
      subjectDocs.push({
        code: `SUB-AUTO-${idx}`,
        name: sub,
        department: DEPARTMENTS[idx % DEPARTMENTS.length],
        type: idx % 3 === 0 ? 'LAB' : 'THEORY',
        credits: 3,
        defaultRoomType: idx % 3 === 0 ? 'LAB' : 'CLASSROOM',
        weeklyHours: 4
      });
    });

    // Fill rest
    let subIndex = 1;
    while (subjectDocs.length < Number(subjectCount)) {
      subjectDocs.push({
        code: `SUB-GEN-${subIndex}`,
        name: `Generated Subject ${subIndex}`,
        department: DEPARTMENTS[subIndex % DEPARTMENTS.length],
        type: 'THEORY',
        credits: 3,
        defaultRoomType: 'CLASSROOM',
        weeklyHours: 4
      });
      subIndex++;
    }
    const createdSubjects = await Subject.insertMany(subjectDocs);

    // 4. Faculty
    console.log('[Generate] Creating Faculty...');
    const facultyDocs = [];
    parsedFaculty.forEach((fac, idx) => {
      facultyDocs.push({
        name: fac,
        employeeId: `FAC-AUTO-${idx}`,
        email: `faculty${idx}@college.edu`,
        department: DEPARTMENTS[idx % DEPARTMENTS.length],
        subjects: [createdSubjects[idx % createdSubjects.length]._id],
        maxWeeklyHours: Number(maxFacultyWorkload) || 40
      });
    });

    let facIndex = 1;
    while (facultyDocs.length < Number(facultyCount)) {
      facultyDocs.push({
        name: `Generated Faculty ${facIndex}`,
        employeeId: `FAC-GEN-${facIndex}`,
        email: `genfaculty${facIndex}@college.edu`,
        department: DEPARTMENTS[facIndex % DEPARTMENTS.length],
        subjects: [createdSubjects[facIndex % createdSubjects.length]._id],
        maxWeeklyHours: Number(maxFacultyWorkload) || 40
      });
      facIndex++;
    }
    const createdFaculty = await Faculty.insertMany(facultyDocs);

    // 5. Sections
    console.log('[Generate] Creating Sections...');
    const sectionDocs = [];
    // Distribute students evenly among DEPARTMENTS
    const studentsPerDept = Math.floor(Number(studentCount) / DEPARTMENTS.length);
    for (const dept of DEPARTMENTS) {
      sectionDocs.push({
        name: `${dept}-A`,
        department: dept,
        year: 2,
        semester: 3,
        studentCount: studentsPerDept,
        academicYear: '2025-2026'
      });
    }
    const createdSections = await Section.insertMany(sectionDocs);

    // 6. Timetable Entries
    console.log('[Generate] Synthesizing Timetable...');
    const entries = [];
    let globalSlotIndex = 0;
    let globalRoomIndex = 0;

    for (const section of createdSections) {
      const dept = section.department;
      const deptFaculties = createdFaculty.filter(f => f.department === dept);
      
      if (deptFaculties.length > 0 && createdRooms.length > 0) {
        // Distribute classes across the week (target ~28 periods per section)
        const periodsToAssign = Math.min(28, createdTimeSlots.length);
        
        for (let i = 0; i < periodsToAssign; i++) {
            const slot = createdTimeSlots[globalSlotIndex % createdTimeSlots.length];
            globalSlotIndex++;
            
            const room = createdRooms[globalRoomIndex % createdRooms.length];
            globalRoomIndex++;
            
            // Randomize faculty slightly so workload isn't perfectly flat
            const randomOffset = Math.floor(Math.random() * 2);
            const fac = deptFaculties[(i + randomOffset) % deptFaculties.length];
            
            if (slot && fac && room) {
                entries.push({
                    academicYear: '2025-2026',
                    semester: section.semester,
                    section: section._id,
                    subject: fac.subjects[0],
                    faculty: fac._id,
                    room: room._id,
                    day: slot.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    periodNumber: slot.periodNumber,
                    status: 'PUBLISHED'
                });
            }
        }
      }
    }
    
    await TimetableEntry.insertMany(entries);
    console.log(`[Generate] Generated ${entries.length} Timetable Entries.`);

    console.log('[Generate] Running Conflict Detection...');
    await detectAllConflicts();

    res.status(200).json({ success: true, message: 'Autonomous Timetable Generation Complete.' });
  } catch (error) {
    console.error('[Generate] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
