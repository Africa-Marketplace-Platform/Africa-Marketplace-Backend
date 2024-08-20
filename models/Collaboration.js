const mongoose = require('mongoose');

const CollaborationSchema = new mongoose.Schema({
  entity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Entity', 
    required: true 
  }, // The primary business or influencer initiating the collaboration

  collaborator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Entity', 
    required: true 
  }, // The collaborating business or influencer

  collaborationType: { 
    type: String, 
    enum: ['joint_promotion', 'content_collaboration', 'service_partnership', 'event_sponsorship'], 
    required: true 
  }, // Different types of collaborations

  details: { 
    type: String 
  }, // Additional details about the collaboration

  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'ended'], 
    default: 'pending' 
  }, // Collaboration status lifecycle

  startDate: { 
    type: Date 
  }, // Start date for the collaboration

  endDate: { 
    type: Date 
  }, // End date for the collaboration

  renewalOption: { 
    type: Boolean, 
    default: false 
  }, // Option to renew the collaboration after it ends

  performanceMetrics: { 
    type: Map, 
    of: Number 
  }, // Track metrics like engagement, reach, sales impact, etc.

  terms: { 
    type: String 
  }, // Terms and conditions of the collaboration

  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp of when the collaboration was created

  updatedAt: { 
    type: Date, 
    default: Date.now 
  } // Timestamp of when the collaboration was last updated
});

// Middleware to update the `updatedAt` field before saving
CollaborationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Collaboration', CollaborationSchema);
