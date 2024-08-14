// routes/recommendationRoutes.js
const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const {
    protect,
    authorize,
    checkBusinessOwner,
    premium,
  } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get personalized business recommendations
router.get("/recommendations", authorize, protect, getRecommendations);

module.exports = router;
