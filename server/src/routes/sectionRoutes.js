const express = require('express');
const router = express.Router();
const {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSections)
  .post(authorize('ADMIN'), createSection);

router.route('/:id')
  .put(authorize('ADMIN'), updateSection)
  .delete(authorize('ADMIN'), deleteSection);

module.exports = router;
