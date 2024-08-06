// models/InfluencerContent.js
const mongoose = require('mongoose');

const InfluencerContentSchema = new mongoose.Schema({
  influencer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Influencer',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  media: {
    type: String // URL to media file, if any
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InfluencerContent', InfluencerContentSchema);
