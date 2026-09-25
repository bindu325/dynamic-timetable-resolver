const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(authorize('ADMIN'), createSubject);

router.route('/:id')
  .put(authorize('ADMIN'), updateSubject)
  .delete(authorize('ADMIN'), deleteSubject);

module.exports = router;
