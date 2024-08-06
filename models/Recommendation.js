// models/Recommendation.js
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to Product, Service, or Business
  type: { type: String, enum: ['product', 'service', 'business'], required: true },
  interactionType: { type: String, enum: ['click', 'view', 'purchase'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
