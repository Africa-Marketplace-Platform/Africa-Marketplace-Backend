const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/adminController');

// Only admins can manage users
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/user/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
