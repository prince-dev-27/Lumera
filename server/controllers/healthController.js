const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get API Health Status
// @route   GET /api/health
// @access  Public
const getHealthStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lumera API is healthy and operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getHealthStatus
};
