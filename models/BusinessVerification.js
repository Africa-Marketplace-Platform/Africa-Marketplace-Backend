// models/BusinessVerification.js
const mongoose = require('mongoose');

const businessVerificationSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  documents: [
    {
      type: String, // Store paths to uploaded document files
      required: true,
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewComments: {
    type: String, // Admin comments after review
  },
  verifiedAt: {
    type: Date, // Date of verification
  },
});

const BusinessVerification = mongoose.model('BusinessVerification', businessVerificationSchema);
module.exports = BusinessVerification;
