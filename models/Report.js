const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentModel',
  },
  contentModel: {
    type: String,
    required: true,
    enum: ['Post', 'Comment', 'Message'], // Example content types
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Spam',
      'Harassment',
      'Inappropriate Content',
      'Misinformation',
      'Other',
    ], // Predefined reasons
  },
  description: {
    type: String,
    maxlength: 500, // Optional detailed description from the reporter
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
  },
  adminNote: {
    type: String,
    maxlength: 500, // Optional note by admin after reviewing the report
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ReportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', ReportSchema);
