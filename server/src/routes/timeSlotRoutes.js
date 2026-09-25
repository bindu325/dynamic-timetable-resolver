const express = require('express');
const router = express.Router();
const {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} = require('../controllers/timeSlotController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTimeSlots)
  .post(authorize('ADMIN'), createTimeSlot);

router.route('/:id')
  .put(authorize('ADMIN'), updateTimeSlot)
  .delete(authorize('ADMIN'), deleteTimeSlot);

module.exports = router;
