const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserActivityLogs } = require('../controllers/activityController');

router.get('/activity/logs', protect, getUserActivityLogs);

module.exports = router;
