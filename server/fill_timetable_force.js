const mongoose = require('mongoose');
require('dotenv').config();

const Section = require('./src/models/Section');
const Faculty = require('./src/models/Faculty');
const Room = require('./src/models/Room');
const Subject = require('./src/models/Subject');
const TimeSlot = require('./src/models/TimeSlot');
const TimetableEntry = require('./src/models/TimetableEntry');

async function fillTimetableForce() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic-timetable');
    
    console.log('Clearing old entries...');
    await TimetableEntry.deleteMany({});
    
    const sections = await Section.find();
    const faculties = await Faculty.find();
    const rooms = await Room.find();
    const subjects = await Subject.find();
    const timeslots = await TimeSlot.find();
    
    const entries = [];
    
    console.log('Force-filling every cell...');
    for (const slot of timeslots) {
      for (const section of sections) {
        
        // Just pick any random faculty, room, subject that matches the department to guarantee a fill
        const deptFaculties = faculties.filter(f => f.department === section.department);
        const deptSubjects = subjects.filter(s => s.department === section.department);
        
        const fac = deptFaculties[Math.floor(Math.random() * deptFaculties.length)] || faculties[0];
        const sub = deptSubjects[Math.floor(Math.random() * deptSubjects.length)] || subjects[0];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        
        entries.push({
          academicYear: '2025-2026',
          semester: section.semester || 3,
          section: section._id,
          subject: sub._id,
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
    
    await TimetableEntry.insertMany(entries);
    console.log(`Successfully force-filled the timetable with ${entries.length} entries! Every cell should now be filled.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error filling timetable:', err);
    process.exit(1);
  }
}

fillTimetableForce();
