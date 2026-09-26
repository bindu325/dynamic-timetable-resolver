const mongoose = require('mongoose');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Section = require('./models/Section');
const Subject = require('./models/Subject');
const Room = require('./models/Room');
const TimeSlot = require('./models/TimeSlot');
const TimetableEntry = require('./models/TimetableEntry');
const Conflict = require('./models/Conflict');
const ChangeHistory = require('./models/ChangeHistory');
const { detectAllConflicts } = require('./services/conflictEngine');

const DEPARTMENTS = ['ACSE', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['09:00', '10:00', '11:15', '12:15', '14:00', '15:00', '16:00'];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Faculty.deleteMany({}),
      Section.deleteMany({}),
      Subject.deleteMany({}),
      Room.deleteMany({}),
      TimeSlot.deleteMany({}),
      TimetableEntry.deleteMany({}),
      Conflict.deleteMany({}),
      ChangeHistory.deleteMany({}),
    ]);
    console.log('[Seed] Collections cleared.');

    // 1. Setup TimeSlots
    console.log('[Seed] Creating TimeSlots...');
    const timeSlotDocs = [];
    for (const day of DAYS) {
      let period = 1;
      for (let i = 0; i < HOURS.length - 1; i++) {
        timeSlotDocs.push({
          day,
          startTime: HOURS[i],
          endTime: HOURS[i+1],
          periodNumber: period++,
          label: `Period ${period - 1}`
        });
      }
    }
    const createdTimeSlots = await TimeSlot.insertMany(timeSlotDocs);

    // 2. Setup Users
    console.log('[Seed] Creating Users...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'ADMIN',
    });
    const viewer = await User.create({
      name: 'Timetable Viewer',
      email: 'viewer@college.edu',
      password: 'password123',
      role: 'VIEWER',
    });

    // 3. Setup Rooms
    console.log('[Seed] Creating Rooms...');
    const roomDocs = [];
    let roomIndex = 101;
    DEPARTMENTS.forEach(dept => {
      // 2 Classrooms and 1 Lab per department
      roomDocs.push({ roomNumber: `${dept}-CR-${roomIndex++}`, building: `${dept} Block`, capacity: 60, roomType: 'CLASSROOM' });
      roomDocs.push({ roomNumber: `${dept}-CR-${roomIndex++}`, building: `${dept} Block`, capacity: 60, roomType: 'CLASSROOM' });
      roomDocs.push({ roomNumber: `${dept}-LAB-${roomIndex++}`, building: `${dept} Block`, capacity: 40, roomType: 'LAB' });
    });
    // Add some common Seminar Halls
    roomDocs.push({ roomNumber: 'MAIN-SEM-01', building: 'Main Block', capacity: 120, roomType: 'SEMINAR_HALL' });
    roomDocs.push({ roomNumber: 'MINI-AUD-01', building: 'Main Block', capacity: 200, roomType: 'SEMINAR_HALL' });
    const createdRooms = await Room.insertMany(roomDocs);

    // 4. Setup Subjects, Sections, Faculty per Department
    console.log('[Seed] Creating Department Data (Subjects, Sections, Faculty)...');
    
    let allSubjects = [];
    let allFaculties = [];
    let allSections = [];
    let facIndex = 1;

    for (const dept of DEPARTMENTS) {
      // Create Subjects for Dept
      const subjects = [
        { code: `${dept}101`, name: `${dept} Core I`, department: dept, type: 'THEORY', credits: 3, defaultRoomType: 'CLASSROOM', weeklyHours: 4 },
        { code: `${dept}102`, name: `${dept} Core II`, department: dept, type: 'THEORY', credits: 3, defaultRoomType: 'CLASSROOM', weeklyHours: 4 },
        { code: `${dept}201`, name: `${dept} Lab I`, department: dept, type: 'LAB', credits: 2, defaultRoomType: 'LAB', weeklyHours: 2 },
        { code: `${dept}301`, name: `${dept} Seminar`, department: dept, type: 'PRACTICAL', credits: 1, defaultRoomType: 'SEMINAR_HALL', weeklyHours: 1 },
      ];
      const createdDeptSubjects = await Subject.insertMany(subjects);
      allSubjects.push(...createdDeptSubjects);

      // Create Sections for Dept
      const sections = [
        { name: `${dept}-A`, department: dept, year: 2, semester: 3, studentCount: 55, academicYear: '2025-2026' },
        { name: `${dept}-B`, department: dept, year: 2, semester: 3, studentCount: 58, academicYear: '2025-2026' },
      ];
      const createdDeptSections = await Section.insertMany(sections);
      allSections.push(...createdDeptSections);

      // Create Faculty for Dept
      const faculty = [
        {
          name: `Dr. ${dept} Prof 1`,
          employeeId: `FAC${facIndex++}`,
          email: `prof1.${dept.toLowerCase()}@college.edu`,
          department: dept,
          subjects: [createdDeptSubjects[0]._id, createdDeptSubjects[2]._id],
          maxWeeklyHours: 20
        },
        {
          name: `Prof. ${dept} Prof 2`,
          employeeId: `FAC${facIndex++}`,
          email: `prof2.${dept.toLowerCase()}@college.edu`,
          department: dept,
          subjects: [createdDeptSubjects[1]._id, createdDeptSubjects[3]._id],
          maxWeeklyHours: 18
        },
        {
          name: `Dr. ${dept} Prof 3`,
          employeeId: `FAC${facIndex++}`,
          email: `prof3.${dept.toLowerCase()}@college.edu`,
          department: dept,
          subjects: [createdDeptSubjects[0]._id, createdDeptSubjects[1]._id],
          maxWeeklyHours: 22
        }
      ];
      const createdDeptFaculty = await Faculty.insertMany(faculty);
      allFaculties.push(...createdDeptFaculty);

      // Create Users for these Faculties so they can log in
      for (const fac of createdDeptFaculty) {
        await User.create({
          name: fac.name,
          email: fac.email,
          password: 'password123',
          role: 'FACULTY',
        });
      }
    }

    // 5. Generate Timetable Entries (A fully dynamic schedule avoiding base conflicts where possible)
    console.log('[Seed] Generating Timetable Entries...');
    const entries = [];
    
    // We will loop over every section, and try to assign a subject and a faculty for some timeslots.
    // For simplicity, we just assign 1 theory class for each section on Monday morning, and 1 Lab on Tuesday.
    for (const section of allSections) {
      const dept = section.department;
      
      // Find subjects for this dept
      const deptSubjects = allSubjects.filter(s => s.code.startsWith(dept));
      const theorySub = deptSubjects.find(s => s.type === 'THEORY');
      const labSub = deptSubjects.find(s => s.type === 'LAB');
      
      // Find faculty who teaches these
      const theoryFac = allFaculties.find(f => f.subjects.includes(theorySub._id));
      const labFac = allFaculties.find(f => f.subjects.includes(labSub._id));
      
      // Find a classroom and a lab
      const classroom = await Room.findOne({ building: { $regex: dept }, roomType: 'CLASSROOM' });
      const labRoom = await Room.findOne({ building: { $regex: dept }, roomType: 'LAB' });
      
      // Slot: Monday 09:00 - 10:00 (Theory)
      const theorySlot = createdTimeSlots.find(ts => ts.day === 'Monday' && ts.startTime === '09:00');
      if (theorySlot && classroom && theoryFac) {
        entries.push({
          academicYear: '2025-2026',
          semester: section.semester,
          section: section._id,
          subject: theorySub._id,
          faculty: theoryFac._id,
          room: classroom._id,
          day: theorySlot.day,
          startTime: theorySlot.startTime,
          endTime: theorySlot.endTime,
          periodNumber: theorySlot.periodNumber,
          status: 'PUBLISHED'
        });
      }

      // Slot: Tuesday 10:00 - 11:15 (Lab)
      const labSlot = createdTimeSlots.find(ts => ts.day === 'Tuesday' && ts.startTime === '10:00');
      if (labSlot && labRoom && labFac) {
        entries.push({
          academicYear: '2025-2026',
          semester: section.semester,
          section: section._id,
          subject: labSub._id,
          faculty: labFac._id,
          room: labRoom._id,
          day: labSlot.day,
          startTime: labSlot.startTime,
          endTime: labSlot.endTime,
          periodNumber: labSlot.periodNumber,
          status: 'PUBLISHED'
        });
      }
    }
    
    // Introduce one intentional conflict to show the conflict resolution working
    if (entries.length >= 2) {
        const facConflict = entries[0].faculty;
        const theorySlot = createdTimeSlots.find(ts => ts.day === 'Monday' && ts.startTime === '09:00');
        
        if (theorySlot) {
            entries.push({
                academicYear: '2025-2026',
                semester: allSections[1].semester,
                section: allSections[1]._id,
                subject: allSubjects[1]._id,
                faculty: facConflict,
                room: createdRooms[3]._id, 
                day: theorySlot.day,
                startTime: theorySlot.startTime,
                endTime: theorySlot.endTime,
                periodNumber: theorySlot.periodNumber,
                status: 'PUBLISHED'
            });
        }
    }

    await TimetableEntry.insertMany(entries);
    console.log(`[Seed] Generated ${entries.length} Timetable Entries.`);

    // 6. Run Conflict Detection
    console.log('[Seed] Running Initial Conflict Detection Engine...');
    await detectAllConflicts();
    
    const conflictCount = await Conflict.countDocuments();
    console.log(`[Seed] Conflict Engine detected ${conflictCount} conflicts.`);

    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exit(1);
  }
};

module.exports = seedDatabase;
