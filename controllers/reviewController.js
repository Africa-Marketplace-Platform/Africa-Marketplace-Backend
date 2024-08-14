const Review = require('../models/Review');
const Business = require('../models/Business');
const Order = require('../models/Order'); // Assuming you have an Order model

// Add a review
exports.addReview = async (req, res) => {
  const { businessId, rating, comment } = req.body;

  try {
    const user = req.user.id;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if the user already left a review for this business
    const existingReview = await Review.findOne({ user, business: businessId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this business.' });
    }

    // Check if the user has purchased from this business
    const orders = await Order.find({ user, business: businessId });
    const verifiedPurchase = orders.length > 0;

    const review = new Review({
      user,
      business: businessId,
      rating,
      comment,
      verifiedPurchase,
    });

    await review.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Add review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reviews for a business
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ business: req.params.businessId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upvote a review
exports.upvoteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user already upvoted this review
    if (review.upvoters && review.upvoters.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already upvoted this review.' });
    }

    // Add the user's ID to the upvoters array
    review.upvotes += 1;
    review.upvoters.push(req.user.id);

    await review.save();
    res.json({ message: 'Review upvoted successfully', review });
  } catch (error) {
    console.error('Upvote review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Downvote a review
exports.downvoteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user already downvoted this review
    if (review.downvoters && review.downvoters.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already downvoted this review.' });
    }

    // Add the user's ID to the downvoters array
    review.downvotes += 1;
    review.downvoters.push(req.user.id);

    await review.save();
    res.json({ message: 'Review downvoted successfully', review });
  } catch (error) {
    console.error('Downvote review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
