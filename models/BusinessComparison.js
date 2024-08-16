// models/BusinessComparison.js
const mongoose = require('mongoose');

const businessComparisonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Ensure a user is associated with the comparison
  },
  businesses: [
    {
      business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
      metrics: {
        averageRating: { type: Number },
        reviewCount: { type: Number },
        priceRange: [Number], // Array to store min and max prices
        services: [{ type: String }], // Array of services offered by the business
        verified: { type: Boolean, default: false },
        location: { type: String }, // Store the location of the business
      },
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Date of comparison
  comparisonType: {
    type: String,
    enum: ['detailed', 'basic'], // Type of comparison (e.g., detailed vs. basic comparison)
    default: 'basic',
  },
  comments: { type: String }, // Optional comments from the user about the comparison
});

const BusinessComparison = mongoose.model('BusinessComparison', businessComparisonSchema);
module.exports = BusinessComparison;
