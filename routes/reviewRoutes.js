const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addReview,
  getReviews,
  upvoteReview,
  downvoteReview,
} = require('../controllers/reviewController');

router.post('/', protect, addReview);
router.get('/:businessId', getReviews);
router.put('/upvote/:reviewId', protect, upvoteReview);
router.put('/downvote/:reviewId', protect, downvoteReview);

module.exports = router;
