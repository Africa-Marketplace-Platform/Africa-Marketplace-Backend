const express = require('express');
const { updateUserProfile, reportContent } = require('../controllers/userController');
const {
  protect,
  authorize,
  checkBusinessOwner,
  premium,
} = require('../middleware/authMiddleware');// Middleware to protect routes

const router = express.Router();

// Route to update user profile
router.put('/profile', protect, authorize,  updateUserProfile);

// Route to report content
router.post('/report', protect, authorize, reportContent);

module.exports = router;
