const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  getAllNotifications, // New method for admin to get all notifications
  createNotification,
  deleteNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route for getting notifications for the authenticated user
router.get('/', protect, authorize(['regular_user', 'admin']), getUserNotifications);

// Route for marking a notification as read
router.patch('/mark-as-read/:notificationId', protect, authorize(['regular_user', 'admin']), markAsRead);

// Route for creating a new notification (admin only)
// router.post('/', protect, authorize(['admin']), createNotification);

// Route for deleting a notification (admin only)
// router.delete('/:id', protect, authorize(['admin']), deleteNotification);

// Route for admin to get all notifications (new route)
router.get('/all', protect, authorize(['admin']), getAllNotifications);

module.exports = router;
