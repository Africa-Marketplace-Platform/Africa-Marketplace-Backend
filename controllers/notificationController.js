const Notification = require('../models/Notification');

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found' });
    }

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications,
    });
  } catch (error) {
    console.error(`Error fetching notifications: ${error.message}`);
    res.status(500).json({ message: 'Server error. Unable to retrieve notifications.' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if the notification belongs to the user or if the user is an admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. You cannot mark this notification as read.' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read successfully',
      notification,
    });
  } catch (error) {
    console.error(`Error marking notification as read: ${error.message}`);
    res.status(500).json({ message: 'Server error. Unable to mark notification as read.' });
  }
};

// Admin-only: Get all notifications for all users
exports.getAllNotifications = async (req, res) => {
  try {
    // Ensure only admins can access this route
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Admin access required.' });
    }

    const notifications = await Notification.find().sort({ createdAt: -1 });

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found for any user' });
    }

    res.status(200).json({
      message: 'All notifications retrieved successfully',
      notifications,
    });
  } catch (error) {
    console.error(`Error fetching all notifications: ${error.message}`);
    res.status(500).json({ message: 'Server error. Unable to retrieve notifications.' });
  }
};
