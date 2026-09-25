const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 10,
    },
    weeklyHours: {
      type: Number,
      required: [true, 'Weekly hours are required'],
      min: 1,
      max: 20,
    },
    type: {
      type: String,
      enum: ['THEORY', 'LAB', 'PRACTICAL'],
      default: 'THEORY',
    },
    preferredRoomType: {
      type: String,
      enum: ['CLASSROOM', 'LAB', 'SEMINAR_HALL'],
      default: 'CLASSROOM',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
