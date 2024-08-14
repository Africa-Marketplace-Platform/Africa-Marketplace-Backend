// routes/recommendationRoutes.js
const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const auth = require("../middleware/auth");

const router = express.Router();

// Route to get personalized business recommendations
router.get("/recommendations", auth, getRecommendations);

module.exports = router;
