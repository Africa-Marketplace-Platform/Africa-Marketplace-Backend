const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.post('/add', protect, addToWishlist);
router.delete('/remove/:itemId', protect, removeFromWishlist);

module.exports = router;
