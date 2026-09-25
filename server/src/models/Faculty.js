const mongoose = require('mongoose');

const timeSlotAvailabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true, // "09:00"
    },
    endTime: {
      type: String,
      required: true, // "10:00"
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'UNAVAILABLE', 'PREFERRED'],
      default: 'AVAILABLE',
    },
  },
  { _id: false }
);

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    availability: [timeSlotAvailabilitySchema],
    preferredTimeSlots: [String], // e.g. ["Monday 09:00-10:00", "Tuesday 11:00-12:00"]
    unavailableTimeSlots: [String], // e.g. ["Wednesday 14:00-15:00"]
    maxWeeklyHours: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);
