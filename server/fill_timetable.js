const mongoose = require('mongoose');
require('dotenv').config();

const Section = require('./src/models/Section');
const Faculty = require('./src/models/Faculty');
const Room = require('./src/models/Room');
const Subject = require('./src/models/Subject');
const TimeSlot = require('./src/models/TimeSlot');
const TimetableEntry = require('./src/models/TimetableEntry');
const Conflict = require('./src/models/Conflict');

async function fillTimetable() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic-timetable');
    
    console.log('Clearing old entries...');
    await TimetableEntry.deleteMany({});
    await Conflict.deleteMany({});
    
    const sections = await Section.find();
    const faculties = await Faculty.find();
    const rooms = await Room.find();
    const subjects = await Subject.find();
    const timeslots = await TimeSlot.find();
    
    const days = [...new Set(timeslots.map(ts => ts.day))];
    const entries = [];
    
    console.log('Generating conflict-free timetable...');
    for (const day of days) {
      const slotsForDay = timeslots.filter(ts => ts.day === day);
      for (const slot of slotsForDay) {
        let usedRooms = new Set();
        let usedFaculties = new Set();
        
        for (const section of sections) {
          const dept = section.department;
          
          // Find available faculty from same department
          const deptFaculties = faculties.filter(f => f.department === dept && !usedFaculties.has(f._id.toString()));
          if (deptFaculties.length === 0) continue; // Skip if no faculty
          const fac = deptFaculties[0];
          
          // Find available room
          const availableRooms = rooms.filter(r => !usedRooms.has(r._id.toString()));
          if (availableRooms.length === 0) continue; // Skip if no rooms
          const room = availableRooms[0];
          
          // Find a subject for this faculty
          let sub = subjects.find(s => fac.subjects.includes(s._id));
          if (!sub) sub = subjects.find(s => s.department === dept);
          if (!sub) continue;
          
          entries.push({
            academicYear: '2025-2026',
            semester: section.semester || 3,
            section: section._id,
            subject: sub._id,
            faculty: fac._id,
            room: room._id,
            day: day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            periodNumber: slot.periodNumber,
            status: 'PUBLISHED'
          });
          
          usedFaculties.add(fac._id.toString());
          usedRooms.add(room._id.toString());
        }
      }
    }
    
    await TimetableEntry.insertMany(entries);
    console.log(`Successfully filled the timetable with ${entries.length} zero-conflict entries!`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error filling timetable:', err);
    process.exit(1);
  }
}

fillTimetable();
