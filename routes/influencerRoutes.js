const express = require('express');
const router = express.Router();
const { createInfluencer, getInfluencers } = require('../controllers/influencerController');
const { protect, premium } = require('../middleware/authMiddleware');

router.route('/')
  .get(getInfluencers)
  .post(protect, premium, createInfluencer);

module.exports = router;
