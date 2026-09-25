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

    // 1. Create Subjects (20+ subjects)
    console.log('[Seed] Creating subjects...');
    const subjectsData = [
      { name: 'Data Structures & Algorithms', code: 'CS201', department: 'CSE', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Database Management Systems', code: 'CS301', department: 'CSE', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Operating Systems', code: 'CS302', department: 'CSE', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Machine Learning', code: 'CS401', department: 'CSE', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Computer Networks', code: 'CS303', department: 'CSE', credits: 3, weeklyHours: 3, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Artificial Intelligence', code: 'CS402', department: 'CSE', credits: 3, weeklyHours: 3, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Software Engineering', code: 'CS304', department: 'CSE', credits: 3, weeklyHours: 3, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Data Science Laboratory', code: 'CS403L', department: 'CSE', credits: 2, weeklyHours: 3, type: 'LAB', preferredRoomType: 'LAB' },
      { name: 'DBMS Laboratory', code: 'CS305L', department: 'CSE', credits: 2, weeklyHours: 3, type: 'LAB', preferredRoomType: 'LAB' },
      { name: 'Web Technologies Lab', code: 'CS306L', department: 'CSE', credits: 2, weeklyHours: 3, type: 'LAB', preferredRoomType: 'LAB' },
      
      { name: 'Digital Signal Processing', code: 'EC301', department: 'ECE', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'VLSI Design', code: 'EC401', department: 'ECE', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Microprocessors & Microcontrollers', code: 'EC302', department: 'ECE', credits: 3, weeklyHours: 3, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Communication Systems', code: 'EC303', department: 'ECE', credits: 3, weeklyHours: 3, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'DSP & VLSI Simulation Lab', code: 'EC402L', department: 'ECE', credits: 2, weeklyHours: 3, type: 'LAB', preferredRoomType: 'LAB' },

      { name: 'Thermodynamics', code: 'ME201', department: 'MECH', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Fluid Mechanics', code: 'ME301', department: 'MECH', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Kinematics of Machinery', code: 'ME302', department: 'MECH', credits: 3, weeklyHours: 3, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Thermal Engineering Lab', code: 'ME303L', department: 'MECH', credits: 2, weeklyHours: 3, type: 'LAB', preferredRoomType: 'LAB' },

      { name: 'Structural Analysis', code: 'CE301', department: 'CIVIL', credits: 4, weeklyHours: 4, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Geotechnical Engineering', code: 'CE302', department: 'CIVIL', credits: 3, weeklyHours: 3, type: 'THEORY', preferredRoomType: 'CLASSROOM' },
      { name: 'Concrete Technology Lab', code: 'CE303L', department: 'CIVIL', credits: 2, weeklyHours: 3, type: 'LAB', preferredRoomType: 'LAB' },
    ];
    const createdSubjects = await Subject.insertMany(subjectsData);

    // 2. Create Rooms (12+ rooms)
    console.log('[Seed] Creating rooms...');
    const roomsData = [
      { roomNumber: 'LH-101', building: 'Academic Block A', capacity: 70, roomType: 'CLASSROOM', equipment: ['Projector', 'Audio System', 'Smartboard'], available: true },
      { roomNumber: 'LH-102', building: 'Academic Block A', capacity: 65, roomType: 'CLASSROOM', equipment: ['Projector', 'Whiteboard'], available: true },
      { roomNumber: 'LH-103', building: 'Academic Block A', capacity: 60, roomType: 'CLASSROOM', equipment: ['Projector'], available: true },
      { roomNumber: 'LH-201', building: 'Academic Block A', capacity: 75, roomType: 'CLASSROOM', equipment: ['Smart TV', 'Audio System'], available: true },
      { roomNumber: 'LH-202', building: 'Academic Block A', capacity: 35, roomType: 'CLASSROOM', equipment: ['Whiteboard'], available: true }, // small room for capacity conflict demo
      { roomNumber: 'LH-203', building: 'Academic Block A', capacity: 80, roomType: 'CLASSROOM', equipment: ['Projector', 'Air Conditioning'], available: true },
      
      { roomNumber: 'LAB-CS1', building: 'Turing Computing Center', capacity: 60, roomType: 'LAB', equipment: ['60 High-end PCs', 'Gigabit LAN', 'Server'], available: true },
      { roomNumber: 'LAB-CS2', building: 'Turing Computing Center', capacity: 60, roomType: 'LAB', equipment: ['60 Linux Workstations', 'GPU cluster access'], available: true },
      { roomNumber: 'LAB-ECE', building: 'Tesla Electronics Block', capacity: 50, roomType: 'LAB', equipment: ['Oscilloscopes', 'FPGA Kits', 'Soldering Stations'], available: true },
      { roomNumber: 'LAB-MECH', building: 'Newton Mechanical Block', capacity: 45, roomType: 'LAB', equipment: ['Wind Tunnel', 'Hydraulic Benches'], available: true },
      
      { roomNumber: 'AUD-MAIN', building: 'Central Auditorium', capacity: 200, roomType: 'SEMINAR_HALL', equipment: ['Full Stage AV', 'Dual 4K Projectors', 'Wireless Mics'], available: true },
      { roomNumber: 'SEMINAR-1', building: 'Academic Block B', capacity: 90, roomType: 'SEMINAR_HALL', equipment: ['Conferencing System', 'Smart Podium'], available: true },
    ];
    const createdRooms = await Room.insertMany(roomsData);

    // 3. Create Sections (10+ sections)
    console.log('[Seed] Creating sections...');
    const sectionsData = [
      { name: 'CSE-A', department: 'CSE', year: 3, semester: 5, studentCount: 60, academicYear: '2025-2026' },
      { name: 'CSE-B', department: 'CSE', year: 3, semester: 5, studentCount: 58, academicYear: '2025-2026' },
      { name: 'CSE-AI', department: 'CSE', year: 4, semester: 7, studentCount: 55, academicYear: '2025-2026' },
      { name: 'CSE-DS', department: 'CSE', year: 2, semester: 3, studentCount: 62, academicYear: '2025-2026' },
      { name: 'ECE-A', department: 'ECE', year: 3, semester: 5, studentCount: 50, academicYear: '2025-2026' },
      { name: 'ECE-B', department: 'ECE', year: 2, semester: 3, studentCount: 52, academicYear: '2025-2026' },
      { name: 'MECH-A', department: 'MECH', year: 3, semester: 5, studentCount: 45, academicYear: '2025-2026' },
      { name: 'MECH-B', department: 'MECH', year: 2, semester: 3, studentCount: 40, academicYear: '2025-2026' },
      { name: 'CIVIL-A', department: 'CIVIL', year: 3, semester: 5, studentCount: 42, academicYear: '2025-2026' },
      { name: 'CIVIL-B', department: 'CIVIL', year: 2, semester: 3, studentCount: 38, academicYear: '2025-2026' },
    ];
    const createdSections = await Section.insertMany(sectionsData);

    // 4. Create Faculty (16 faculty members with availability profiles)
    console.log('[Seed] Creating faculty members...');
    const facultyData = [
      {
        name: 'Dr. Priya Sharma',
        employeeId: 'FAC001',
        email: 'priya.sharma@college.edu',
        department: 'CSE',
        subjects: [createdSubjects[0]._id, createdSubjects[3]._id], // DSA, ML
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '10:00', status: 'AVAILABLE' },
          { day: 'Monday', startTime: '10:00', endTime: '11:00', status: 'UNAVAILABLE' }, // Will demonstrate faculty availability conflict!
          { day: 'Tuesday', startTime: '10:00', endTime: '11:00', status: 'PREFERRED' },
          { day: 'Wednesday', startTime: '11:15', endTime: '12:15', status: 'PREFERRED' },
        ],
        preferredTimeSlots: ['Tuesday 10:00-11:00', 'Wednesday 11:15-12:15'],
        unavailableTimeSlots: ['Monday 10:00-11:00'],
      },
      {
        name: 'Dr. Ramesh Kumar',
        employeeId: 'FAC002',
        email: 'ramesh.kumar@college.edu',
        department: 'CSE',
        subjects: [createdSubjects[1]._id, createdSubjects[8]._id], // DBMS, DBMS Lab
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '10:00', status: 'PREFERRED' },
          { day: 'Tuesday', startTime: '11:15', endTime: '12:15', status: 'PREFERRED' },
        ],
      },
      {
        name: 'Prof. Ananya Roy',
        employeeId: 'FAC003',
        email: 'ananya.roy@college.edu',
        department: 'CSE',
        subjects: [createdSubjects[2]._id, createdSubjects[4]._id], // OS, CN
        availability: [],
      },
      {
        name: 'Dr. Vikram Sethi',
        employeeId: 'FAC004',
        email: 'vikram.sethi@college.edu',
        department: 'CSE',
        subjects: [createdSubjects[5]._id, createdSubjects[6]._id], // AI, SE
        availability: [],
      },
      {
        name: 'Prof. Sneha Deshmukh',
        employeeId: 'FAC005',
        email: 'sneha.deshmukh@college.edu',
        department: 'CSE',
        subjects: [createdSubjects[7]._id, createdSubjects[9]._id], // DS Lab, Web Tech Lab
        availability: [],
      },
      {
        name: 'Dr. Alok Verma',
        employeeId: 'FAC006',
        email: 'alok.verma@college.edu',
        department: 'ECE',
        subjects: [createdSubjects[10]._id, createdSubjects[14]._id], // DSP, DSP Lab
        availability: [],
      },
      {
        name: 'Prof. Rajesh Nair',
        employeeId: 'FAC007',
        email: 'rajesh.nair@college.edu',
        department: 'ECE',
        subjects: [createdSubjects[11]._id, createdSubjects[12]._id], // VLSI, Microprocessors
        availability: [],
      },
      {
        name: 'Dr. Kavita Menon',
        employeeId: 'FAC008',
        email: 'kavita.menon@college.edu',
        department: 'ECE',
        subjects: [createdSubjects[13]._id], // Communication Systems
        availability: [],
      },
      {
        name: 'Dr. Manoj Tiwari',
        employeeId: 'FAC009',
        email: 'manoj.tiwari@college.edu',
        department: 'MECH',
        subjects: [createdSubjects[15]._id, createdSubjects[18]._id], // Thermo, Thermal Lab
        availability: [],
      },
      {
        name: 'Prof. Sanjay Gupta',
        employeeId: 'FAC010',
        email: 'sanjay.gupta@college.edu',
        department: 'MECH',
        subjects: [createdSubjects[16]._id, createdSubjects[17]._id], // Fluid Mech, Kinematics
        availability: [],
      },
      {
        name: 'Dr. Sunita Patel',
        employeeId: 'FAC011',
        email: 'sunita.patel@college.edu',
        department: 'CIVIL',
        subjects: [createdSubjects[19]._id, createdSubjects[21]._id], // Structural, Concrete Lab
        availability: [],
      },
      {
        name: 'Prof. Amit Hegde',
        employeeId: 'FAC012',
        email: 'amit.hegde@college.edu',
        department: 'CIVIL',
        subjects: [createdSubjects[20]._id], // Geotechnical
        availability: [],
      },
      {
        name: 'Dr. Neha Kapoor',
        employeeId: 'FAC013',
        email: 'neha.kapoor@college.edu',
        department: 'CSE',
        subjects: [createdSubjects[0]._id, createdSubjects[1]._id],
        availability: [],
      },
      {
        name: 'Prof. Rohit Sengupta',
        employeeId: 'FAC014',
        email: 'rohit.sengupta@college.edu',
        department: 'CSE',
        subjects: [createdSubjects[2]._id, createdSubjects[3]._id],
        availability: [],
      },
      {
        name: 'Dr. Tarun Mittal',
        employeeId: 'FAC015',
        email: 'tarun.mittal@college.edu',
        department: 'ECE',
        subjects: [createdSubjects[10]._id, createdSubjects[11]._id],
        availability: [],
      },
      {
        name: 'Prof. Swati Joshi',
        employeeId: 'FAC016',
        email: 'swati.joshi@college.edu',
        department: 'MECH',
        subjects: [createdSubjects[15]._id, createdSubjects[16]._id],
        availability: [],
      },
    ];
    const createdFaculty = await Faculty.insertMany(facultyData);

    // 5. Create Time Slots (36 slots across Mon-Sat)
    console.log('[Seed] Creating time slots...');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const standardPeriods = [
      { startTime: '09:00', endTime: '10:00', periodNumber: 1, label: 'Period 1' },
      { startTime: '10:00', endTime: '11:00', periodNumber: 2, label: 'Period 2' },
      { startTime: '11:15', endTime: '12:15', periodNumber: 3, label: 'Period 3' },
      { startTime: '12:15', endTime: '13:15', periodNumber: 4, label: 'Period 4' },
      { startTime: '14:00', endTime: '15:00', periodNumber: 5, label: 'Period 5' },
      { startTime: '15:00', endTime: '16:00', periodNumber: 6, label: 'Period 6' },
    ];

    const timeSlotsData = [];
    days.forEach((day) => {
      standardPeriods.forEach((p) => {
        timeSlotsData.push({
          day,
          startTime: p.startTime,
          endTime: p.endTime,
          periodNumber: p.periodNumber,
          label: `${day} ${p.label}`,
          isBreak: false,
        });
      });
    });
    await TimeSlot.insertMany(timeSlotsData);

    // 6. Create Users (Admin, Faculty, Viewer)
    console.log('[Seed] Creating users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'ADMIN',
    });

    await User.create({
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@college.edu',
      password: 'password123',
      role: 'FACULTY',
      facultyId: createdFaculty[0]._id,
    });

    await User.create({
      name: 'Student Viewer',
      email: 'viewer@college.edu',
      password: 'password123',
      role: 'VIEWER',
    });

    // 7. Create Timetable Entries (50+ entries with INTENTIONAL CONFLICTS for instant demo)
    console.log('[Seed] Creating timetable schedule entries...');
    const timetableEntriesData = [
      // --- CSE-A Schedule (Semester 5) ---
      // Monday
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id, // CSE-A (60 students)
        subject: createdSubjects[0]._id, // DSA
        faculty: createdFaculty[1]._id, // Dr. Ramesh Kumar (CONFLICT 1: Double booked with CSE-B at Monday 09:00-10:00)
        room: createdRooms[0]._id, // LH-101
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id, // CSE-A (60 students)
        subject: createdSubjects[3]._id, // Machine Learning
        faculty: createdFaculty[0]._id, // Dr. Priya Sharma (CONFLICT 2: Faculty marked UNAVAILABLE on Mon 10:00-11:00)
        room: createdRooms[0]._id, // LH-101
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id, // CSE-A (60 students)
        subject: createdSubjects[1]._id, // DBMS
        faculty: createdFaculty[1]._id, // Dr. Ramesh Kumar
        room: createdRooms[4]._id, // LH-202 (CONFLICT 3: Capacity is 35, Section has 60 students!)
        day: 'Monday',
        startTime: '11:15',
        endTime: '12:15',
        periodNumber: 3,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id, // CSE-A
        subject: createdSubjects[2]._id, // OS
        faculty: createdFaculty[2]._id, // Prof. Ananya Roy
        room: createdRooms[0]._id, // LH-101
        day: 'Monday',
        startTime: '12:15',
        endTime: '13:15',
        periodNumber: 4,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id, // CSE-A
        subject: createdSubjects[8]._id, // DBMS Lab
        faculty: createdFaculty[1]._id, // Dr. Ramesh Kumar
        room: createdRooms[6]._id, // LAB-CS1
        day: 'Monday',
        startTime: '14:00',
        endTime: '16:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },

      // --- CSE-B Schedule (Semester 5) ---
      // Monday (Conflict source for Dr. Ramesh Kumar)
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id, // CSE-B
        subject: createdSubjects[1]._id, // DBMS
        faculty: createdFaculty[1]._id, // Dr. Ramesh Kumar (DOUBLE BOOKED at Mon 09:00-10:00)
        room: createdRooms[1]._id, // LH-102
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      // Conflict source for Room Double Booking: LH-101 double booked at Mon 12:15-13:15
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id, // CSE-B
        subject: createdSubjects[4]._id, // CN
        faculty: createdFaculty[3]._id, // Dr. Vikram Sethi
        room: createdRooms[0]._id, // LH-101 (CONFLICT 4: Room double booked with CSE-A at Mon 12:15-13:15)
        day: 'Monday',
        startTime: '12:15',
        endTime: '13:15',
        periodNumber: 4,
        status: 'PUBLISHED',
      },

      // Tuesday for CSE-A
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[4]._id, // CN
        faculty: createdFaculty[2]._id,
        room: createdRooms[0]._id,
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[5]._id, // AI
        faculty: createdFaculty[3]._id,
        room: createdRooms[0]._id,
        day: 'Tuesday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[0]._id, // DSA
        faculty: createdFaculty[0]._id,
        room: createdRooms[0]._id,
        day: 'Tuesday',
        startTime: '11:15',
        endTime: '12:15',
        periodNumber: 3,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[6]._id, // SE
        faculty: createdFaculty[3]._id,
        room: createdRooms[0]._id,
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '15:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },

      // Wednesday for CSE-A
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[2]._id, // OS
        faculty: createdFaculty[2]._id,
        room: createdRooms[0]._id,
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[1]._id, // DBMS
        faculty: createdFaculty[1]._id,
        room: createdRooms[0]._id,
        day: 'Wednesday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[3]._id, // ML
        faculty: createdFaculty[0]._id,
        room: createdRooms[0]._id,
        day: 'Wednesday',
        startTime: '11:15',
        endTime: '12:15',
        periodNumber: 3,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[7]._id, // DS Lab
        faculty: createdFaculty[4]._id,
        room: createdRooms[7]._id, // LAB-CS2
        day: 'Wednesday',
        startTime: '14:00',
        endTime: '16:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },

      // Thursday for CSE-A
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[3]._id, // ML
        faculty: createdFaculty[0]._id,
        room: createdRooms[0]._id,
        day: 'Thursday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[5]._id, // AI
        faculty: createdFaculty[3]._id,
        room: createdRooms[0]._id,
        day: 'Thursday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[4]._id, // CN
        faculty: createdFaculty[2]._id,
        room: createdRooms[0]._id,
        day: 'Thursday',
        startTime: '11:15',
        endTime: '12:15',
        periodNumber: 3,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[0]._id, // DSA
        faculty: createdFaculty[12]._id,
        room: createdRooms[0]._id,
        day: 'Thursday',
        startTime: '14:00',
        endTime: '15:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },

      // Friday for CSE-A
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[6]._id, // SE
        faculty: createdFaculty[3]._id,
        room: createdRooms[0]._id,
        day: 'Friday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[2]._id, // OS
        faculty: createdFaculty[2]._id,
        room: createdRooms[0]._id,
        day: 'Friday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[1]._id, // DBMS
        faculty: createdFaculty[1]._id,
        room: createdRooms[0]._id,
        day: 'Friday',
        startTime: '11:15',
        endTime: '12:15',
        periodNumber: 3,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[0]._id,
        subject: createdSubjects[9]._id, // Web Tech Lab
        faculty: createdFaculty[4]._id,
        room: createdRooms[6]._id,
        day: 'Friday',
        startTime: '14:00',
        endTime: '16:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },

      // --- CSE-B (Additional entries) ---
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id,
        subject: createdSubjects[0]._id,
        faculty: createdFaculty[12]._id,
        room: createdRooms[1]._id,
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id,
        subject: createdSubjects[2]._id,
        faculty: createdFaculty[13]._id,
        room: createdRooms[1]._id,
        day: 'Tuesday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id,
        subject: createdSubjects[3]._id,
        faculty: createdFaculty[13]._id,
        room: createdRooms[1]._id,
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id,
        subject: createdSubjects[5]._id,
        faculty: createdFaculty[3]._id,
        room: createdRooms[1]._id,
        day: 'Wednesday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id,
        subject: createdSubjects[4]._id,
        faculty: createdFaculty[2]._id,
        room: createdRooms[1]._id,
        day: 'Thursday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id,
        subject: createdSubjects[6]._id,
        faculty: createdFaculty[3]._id,
        room: createdRooms[1]._id,
        day: 'Thursday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[1]._id,
        subject: createdSubjects[8]._id,
        faculty: createdFaculty[1]._id,
        room: createdRooms[6]._id,
        day: 'Friday',
        startTime: '14:00',
        endTime: '16:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },

      // --- ECE-A (Semester 5) Schedule ---
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[10]._id, // DSP
        faculty: createdFaculty[5]._id,
        room: createdRooms[2]._id, // LH-103
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[11]._id, // VLSI
        faculty: createdFaculty[6]._id,
        room: createdRooms[2]._id,
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[12]._id, // Microprocessors
        faculty: createdFaculty[6]._id,
        room: createdRooms[2]._id,
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[13]._id, // Comm Systems
        faculty: createdFaculty[7]._id,
        room: createdRooms[2]._id,
        day: 'Tuesday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[14]._id, // DSP Lab
        faculty: createdFaculty[5]._id,
        room: createdRooms[8]._id, // LAB-ECE
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '16:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[10]._id,
        faculty: createdFaculty[14]._id,
        room: createdRooms[2]._id,
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[11]._id,
        faculty: createdFaculty[6]._id,
        room: createdRooms[2]._id,
        day: 'Wednesday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[12]._id,
        faculty: createdFaculty[6]._id,
        room: createdRooms[2]._id,
        day: 'Thursday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[4]._id,
        subject: createdSubjects[13]._id,
        faculty: createdFaculty[7]._id,
        room: createdRooms[2]._id,
        day: 'Friday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },

      // --- MECH-A (Semester 5) Schedule ---
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[6]._id,
        subject: createdSubjects[15]._id, // Thermo
        faculty: createdFaculty[8]._id,
        room: createdRooms[3]._id, // LH-201
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[6]._id,
        subject: createdSubjects[16]._id, // Fluid Mech
        faculty: createdFaculty[9]._id,
        room: createdRooms[3]._id,
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[6]._id,
        subject: createdSubjects[17]._id, // Kinematics
        faculty: createdFaculty[9]._id,
        room: createdRooms[3]._id,
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[6]._id,
        subject: createdSubjects[18]._id, // Thermal Lab
        faculty: createdFaculty[8]._id,
        room: createdRooms[9]._id, // LAB-MECH
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '16:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[6]._id,
        subject: createdSubjects[15]._id,
        faculty: createdFaculty[15]._id,
        room: createdRooms[3]._id,
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[6]._id,
        subject: createdSubjects[16]._id,
        faculty: createdFaculty[9]._id,
        room: createdRooms[3]._id,
        day: 'Thursday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[6]._id,
        subject: createdSubjects[17]._id,
        faculty: createdFaculty[9]._id,
        room: createdRooms[3]._id,
        day: 'Friday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },

      // --- CIVIL-A (Semester 5) Schedule ---
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[8]._id,
        subject: createdSubjects[19]._id, // Structural
        faculty: createdFaculty[10]._id,
        room: createdRooms[5]._id, // LH-203
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[8]._id,
        subject: createdSubjects[20]._id, // Geotech
        faculty: createdFaculty[11]._id,
        room: createdRooms[5]._id,
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        periodNumber: 2,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[8]._id,
        subject: createdSubjects[21]._id, // Concrete Lab
        faculty: createdFaculty[10]._id,
        room: createdRooms[5]._id,
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '16:00',
        periodNumber: 5,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[8]._id,
        subject: createdSubjects[19]._id,
        faculty: createdFaculty[10]._id,
        room: createdRooms[5]._id,
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
      {
        academicYear: '2025-2026',
        semester: 5,
        section: createdSections[8]._id,
        subject: createdSubjects[20]._id,
        faculty: createdFaculty[11]._id,
        room: createdRooms[5]._id,
        day: 'Thursday',
        startTime: '09:00',
        endTime: '10:00',
        periodNumber: 1,
        status: 'PUBLISHED',
      },
    ];

    const insertedEntries = await TimetableEntry.insertMany(timetableEntriesData);

    // Initial Change History Record
    await ChangeHistory.create({
      changedBy: adminUser._id,
      changedByName: 'System Administrator',
      changeType: 'CREATE',
      reason: 'Initial system database seed and semester schedule deployment',
    });

    // Run Conflict Detection over seeded data
    console.log('[Seed] Running initial conflict engine scan...');
    const detected = detectAllConflicts(
      insertedEntries,
      createdFaculty,
      createdSections,
      createdRooms,
      createdSubjects
    );

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

      // Update hasConflict flag
      const affectedIdSet = new Set(
        detected.flatMap((d) => d.affectedEntries.map((e) => e?.toString() || e))
      );
      for (const entry of insertedEntries) {
        if (affectedIdSet.has(entry._id.toString())) {
          const match = detected.find((d) =>
            d.affectedEntries.some((e) => (e?.toString() || e) === entry._id.toString())
          );
          await TimetableEntry.findByIdAndUpdate(entry._id, {
            hasConflict: true,
            conflictSummary: match ? match.message : 'Schedule conflict',
          });
        }
      }
    }

    console.log(`[Seed Success] Created:
- ${createdFaculty.length} Faculty
- ${createdSections.length} Sections
- ${createdSubjects.length} Subjects
- ${createdRooms.length} Rooms
- ${timeSlotsData.length} Time Slots
- ${insertedEntries.length} Timetable Entries
- ${detected.length} Active Intentional Demo Conflicts`);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`, error);
  }
};

module.exports = seedDatabase;
