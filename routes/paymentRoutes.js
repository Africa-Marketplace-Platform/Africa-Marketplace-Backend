const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { payForWishlist } = require('../controllers/paymentController');

router.post('/wishlist', protect, payForWishlist);

module.exports = router;
