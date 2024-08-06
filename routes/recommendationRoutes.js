const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Destructure to get 'protect' middleware
const { getRecommendations } = require('../controllers/recommendationController');

router.get('/', protect, getRecommendations); // Use 'protect' middleware

module.exports = router;
