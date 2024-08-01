const express = require('express');
const router = express.Router();
const { createPremiumSubscription } = require('../controllers/premiumController');
const { protect } = require('../middleware/authMiddleware');

router.route('/subscribe')
  .post(protect, createPremiumSubscription);

module.exports = router;
