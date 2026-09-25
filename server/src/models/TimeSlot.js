const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: [true, 'Day is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'], // e.g. "09:00"
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:mm 24-hr format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'], // e.g. "10:00"
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:mm 24-hr format'],
    },
    periodNumber: {
      type: Number,
      required: [true, 'Period number is required'],
      min: 1,
      max: 12,
    },
    isBreak: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

timeSlotSchema.index({ day: 1, periodNumber: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
