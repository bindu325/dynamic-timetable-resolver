const mongoose = require('mongoose');

const changeHistorySchema = new mongoose.Schema(
  {
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedByName: {
      type: String,
      default: 'Administrator',
    },
    changeType: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESOLVE_CONFLICT', 'AUTO_RESOLVE', 'BULK_RESOLVE', 'STATUS_CHANGE'],
      required: true,
    },
    timetableEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimetableEntry',
      default: null,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      required: true,
    },
    impactSummary: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChangeHistory', changeHistorySchema);
