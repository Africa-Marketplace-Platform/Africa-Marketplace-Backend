const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPaymentIntentFromWishlist, stripeWebhook } = require('../controllers/paymentController');

// Create payment intent from wishlist
router.post('/create-payment-intent-from-wishlist', protect, createPaymentIntentFromWishlist);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
