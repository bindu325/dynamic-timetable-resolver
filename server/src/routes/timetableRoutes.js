const express = require('express');
const router = express.Router();
const {
  getTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  setPublishStatus,
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

const { generateTimetable } = require('../controllers/generateController');

router.get('/', getTimetableEntries);
router.post('/generate', generateTimetable);
router.get('/:id', getTimetableEntryById);

// Admin-only modifying operations
router.post('/', protect, authorize('ADMIN'), createTimetableEntry);
router.put('/:id', protect, authorize('ADMIN'), updateTimetableEntry);
router.delete('/:id', protect, authorize('ADMIN'), deleteTimetableEntry);
router.post('/status/bulk', protect, authorize('ADMIN'), setPublishStatus);

module.exports = router;
