const ActivityLog = require('../models/ActivityLog');

// Log user activity
exports.logActivity = async (userId, action, additionalData = {}) => {
  try {
    const {
      ipAddress = null,
      userAgent = null,
      resourceType = null,
      resourceId = null,
      changes = null,
      location = null,
    } = additionalData;

    const log = new ActivityLog({
      user: userId,
      action,
      ipAddress,
      userAgent,
      resourceType,
      resourceId,
      changes,
      location,
    });

    await log.save();
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

// Get user activity logs with filters and pagination
exports.getUserActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build query filters
    const query = { user: userId };
    if (action) {
      query.action = action;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination options
    const skip = (page - 1) * limit;

    // Fetch logs with applied filters
    const logs = await ActivityLog.find(query)
      .sort({ date: -1 }) // Sort by most recent
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'); // Exclude __v field

    // Count total logs for pagination info
    const totalLogs = await ActivityLog.countDocuments(query);

    res.json({
      totalLogs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalLogs / limit),
      logs,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

