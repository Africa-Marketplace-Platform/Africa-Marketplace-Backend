const mongoose = require('mongoose');

const verificationHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    required: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The admin or reviewer who changed the status
  },
  comments: {
    type: String,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
});

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
    enum: ['pending', 'approved', 'rejected', 'expired'], // Added 'expired' as a new status
    default: 'pending',
  },
  reviewComments: {
    type: String, // Admin comments after review
  },
  verifiedAt: {
    type: Date, // Date of verification
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin or user who verified the business
  },
  verificationExpiresAt: {
    type: Date, // Expiration date of the verification, can be set for yearly renewals, etc.
  },
  verificationHistory: [verificationHistorySchema], // Tracking history of verification changes
});

// Pre-save hook to automatically set verification expiration
businessVerificationSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'approved') {
    // Example: Set verification expiration to 1 year from approval
    this.verificationExpiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  }
  next();
});

const BusinessVerification = mongoose.model('BusinessVerification', businessVerificationSchema);

module.exports = BusinessVerification;
