const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

module.exports = router;
