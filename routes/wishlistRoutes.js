const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  createOrderFromWishlist,
} = require('../controllers/wishlistController');

router.post('/', protect, addToWishlist);
router.delete('/', protect, removeFromWishlist);
router.get('/', protect, getWishlist);
router.post('/order', protect, createOrderFromWishlist);

module.exports = router;
