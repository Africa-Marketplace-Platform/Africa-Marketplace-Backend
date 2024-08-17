const ActivityLog = require('../models/ActivityLog');

// Log user activity
/**
 * @swagger
 * /activity/log:
 *   post:
 *     summary: Log user activity
 *     description: Logs an activity performed by a user.
 *     tags:
 *       - Activity Log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user.
 *               action:
 *                 type: string
 *                 description: The action performed by the user.
 *               additionalData:
 *                 type: object
 *                 properties:
 *                   ipAddress:
 *                     type: string
 *                     description: IP address of the user.
 *                   userAgent:
 *                     type: string
 *                     description: User agent details.
 *                   resourceType:
 *                     type: string
 *                     description: The type of resource being interacted with.
 *                   resourceId:
 *                     type: string
 *                     description: The ID of the resource.
 *                   changes:
 *                     type: string
 *                     description: Any changes made to the resource.
 *                   location:
 *                     type: string
 *                     description: Location of the user.
 *     responses:
 *       200:
 *         description: Activity successfully logged.
 *       500:
 *         description: Server error.
 */
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
    console.log('Activity successfully logged.');
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

// Get user activity logs with filters and pagination
/**
 * @swagger
 * /activity/logs:
 *   get:
 *     summary: Get user activity logs
 *     description: Retrieves activity logs for the user, with optional filters and pagination.
 *     tags:
 *       - Activity Log
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs starting from this date.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs ending at this date.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of logs per page.
 *     responses:
 *       200:
 *         description: Successfully retrieved activity logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLogs:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       action:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       ipAddress:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *                       resourceType:
 *                         type: string
 *                       resourceId:
 *                         type: string
 *                       changes:
 *                         type: string
 *                       location:
 *                         type: string
 *       500:
 *         description: Server error.
 */
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
      message: 'Activity logs retrieved successfully.',
      totalLogs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalLogs / limit),
      logs,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error. Failed to retrieve activity logs.' });
  }
};
