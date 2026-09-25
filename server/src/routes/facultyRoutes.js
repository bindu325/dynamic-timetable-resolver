const express = require('express');
const router = express.Router();
const {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFaculties)
  .post(authorize('ADMIN'), createFaculty);

router.route('/:id')
  .get(getFacultyById)
  .put(authorize('ADMIN', 'FACULTY'), updateFaculty)
  .delete(authorize('ADMIN'), deleteFaculty);

module.exports = router;
