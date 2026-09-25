const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRooms)
  .post(authorize('ADMIN'), createRoom);

router.route('/:id')
  .put(authorize('ADMIN'), updateRoom)
  .delete(authorize('ADMIN'), deleteRoom);

module.exports = router;
