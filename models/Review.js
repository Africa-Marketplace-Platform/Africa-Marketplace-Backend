const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: {
    type: Number,
    default: 0,
  },
  downvoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
