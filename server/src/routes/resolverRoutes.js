const express = require('express');
const router = express.Router();
const {
  getConflicts,
  checkConflicts,
  suggestAlternatives,
  evaluateImpact,
  applyResolution,
} = require('../controllers/resolverController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getConflicts);
router.post('/check', checkConflicts);
router.post('/impact', evaluateImpact);
router.post('/suggest', authorize('ADMIN'), suggestAlternatives);
router.post('/apply', authorize('ADMIN'), applyResolution);

module.exports = router;
