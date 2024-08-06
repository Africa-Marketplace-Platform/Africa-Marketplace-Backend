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
    res.status(201).json(review);
  } catch (error) {
    console.error(error.message);
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
    console.error(error.message);
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

    review.upvotes += 1;
    await review.save();
    res.json(review);
  } catch (error) {
    console.error(error.message);
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

    review.downvotes += 1;
    await review.save();
    res.json(review);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
