const mongoose = require('mongoose');

const InfluencerContentSchema = new mongoose.Schema({
  influencer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Influencer',
    required: true,
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  media: {
    type: [String], // Changed to an array to support multiple media files
  },
  contentType: {
    type: String, 
    enum: ['image', 'video', 'text', 'audio', 'other'], // Added content type
    default: 'image',
  },
  tags: {
    type: [String], // Added tags to categorize or describe the content
  },
  reach: {
    type: Number, // Number of people reached by the content
    default: 0,
  },
  engagement: {
    type: Number, // Number of interactions (likes, comments, shares)
    default: 0,
  },
  analytics: {
    views: { type: Number, default: 0 }, // Number of views
    likes: { type: Number, default: 0 }, // Number of likes
    comments: { type: Number, default: 0 }, // Number of comments
    shares: { type: Number, default: 0 }, // Number of shares
  }, // Added detailed analytics for content
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to update the `updatedAt` field on each update
InfluencerContentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InfluencerContent', InfluencerContentSchema);
