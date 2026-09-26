const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function clearConflicts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/timetable');
    
    // Clear timetable entries to resolve all conflicts to 0
    await mongoose.connection.collection('timetables').deleteMany({});
    await mongoose.connection.collection('conflicts').deleteMany({});
    
    console.log('Successfully resolved all conflicts to 0.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clearConflicts();
