const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required'], // e.g. "CSE-A", "ECE-B"
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'], // 1, 2, 3, 4
      min: 1,
      max: 5,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'], // 1 to 8
      min: 1,
      max: 10,
    },
    studentCount: {
      type: Number,
      required: [true, 'Student count is required'],
      min: [1, 'Section must have at least 1 student'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'], // e.g. "2025-2026"
      trim: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ name: 1, department: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
