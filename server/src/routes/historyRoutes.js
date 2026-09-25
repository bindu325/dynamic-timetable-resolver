const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getHistory);

module.exports = router;
