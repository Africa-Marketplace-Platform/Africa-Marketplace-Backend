const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  logActivity,
  getUserActivityLogs,
} = require('../controllers/activityController');

const router = express.Router();

// Route for fetching user activity logs with filters and pagination
router.get('/logs', protect, getUserActivityLogs);

// Manual route for logging activity (if needed)
router.post('/log', protect, async (req, res) => {
  const { action, additionalData } = req.body;

  try {
    // Call the logActivity function with the user ID and action from the request body
    await logActivity(req.user.id, action, additionalData);

    res.status(201).json({ message: 'Activity logged successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
