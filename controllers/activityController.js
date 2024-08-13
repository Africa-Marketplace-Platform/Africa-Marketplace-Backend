const ActivityLog = require('../models/ActivityLog');

// Log user activity
exports.logActivity = async (userId, action, additionalData = {}) => {
  try {
    const { ipAddress, userAgent, resourceType, resourceId, changes, location } = additionalData;

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

// Get user activity logs
exports.getUserActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ date: -1 })
      .select('-__v'); // Exclude the __v field from the results

    res.json(logs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
