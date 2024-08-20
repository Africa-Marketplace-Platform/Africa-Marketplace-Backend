const express = require('express');
const {
  updateUserProfile,
  reportContent,
  followBusiness,
  followInfluencer,
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const {
  protect,
  authorize,
  checkBusinessOwner,
  premium,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Route to update user profile
router.put('/profile', protect, authorize, updateUserProfile);

// Route to report content
router.post('/report', protect, authorize, reportContent);

// Route to follow or unfollow a business
router.post('/follow-business', protect, authorize, followBusiness);

// Route to follow or unfollow an influencer
router.post('/follow-influencer', protect, authorize, followInfluencer);

// Route to get all users (Admin only)
router.get('/all-users', protect, authorize('admin'), getAllUsers);

// Route to update any user's role or info (Admin only)
router.put('/update-user/:id', protect, authorize('admin'), updateUser);

// Route to delete any user (Admin only)
router.delete('/delete-user/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
