// models/BusinessComparison.js
const mongoose = require('mongoose');

const businessComparisonSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User ID (optional for persistence)
  businesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }], // Array of businesses selected for comparison
  createdAt: { type: Date, default: Date.now }, // Date of comparison
});

const BusinessComparison = mongoose.model('BusinessComparison', businessComparisonSchema);
module.exports = BusinessComparison;
