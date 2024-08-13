const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  updateUserProfile,
  reportContent,
  handleReport
} = require('../controllers/userController');

// Protect all routes below
router.use(protect);

// Update user profile
router.put('/profile', updateUserProfile);
router.post('/report', protect, reportContent);

// Wishlist routes
// router.post('/wishlist/products/:productId', addProductToWishlist);
// router.delete('/wishlist/products/:productId', removeProductFromWishlist);
// router.post('/wishlist/services/:serviceId', addServiceToWishlist);
// router.delete('/wishlist/services/:serviceId', removeServiceFromWishlist);

module.exports = router;
