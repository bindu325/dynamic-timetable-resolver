const ChangeHistory = require('../models/ChangeHistory');

// @desc    Get change history with filters and pagination
// @route   GET /api/history
// @access  Authenticated
exports.getHistory = async (req, res, next) => {
  try {
    const { changeType, limit = 50 } = req.query;
    let query = {};

    if (changeType && changeType !== 'ALL') {
      query.changeType = changeType;
    }

    const history = await ChangeHistory.find(query)
      .populate('changedBy', 'name email role')
      .populate('timetableEntry')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
