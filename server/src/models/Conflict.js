const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'FACULTY_CONFLICT',
        'ROOM_CONFLICT',
        'SECTION_CONFLICT',
        'CAPACITY_CONFLICT',
        'FACULTY_AVAILABILITY_CONFLICT',
        'ROOM_AVAILABILITY_CONFLICT',
        'INVALID_TIME_SLOT',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['ERROR', 'WARNING'],
      default: 'ERROR',
    },
    message: {
      type: String,
      required: true,
    },
    affectedEntries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimetableEntry',
      },
    ],
    relatedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    relatedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    relatedSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    day: {
      type: String,
      default: null,
    },
    timeSlot: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'IGNORED'],
      default: 'ACTIVE',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conflict', conflictSchema);
