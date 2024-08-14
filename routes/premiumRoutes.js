const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  subscribeInfluencer,
  subscribeBusinessOwner,
  handleWebhook,
} = require('../controllers/premiumController');

// Routes for subscribing to influencer and business owner roles
router.post('/subscribe/influencer', protect, subscribeInfluencer);
router.post('/subscribe/business-owner', protect, subscribeBusinessOwner);

// Stripe Webhook route
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
