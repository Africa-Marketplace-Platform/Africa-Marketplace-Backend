const mongoose = require('mongoose');

const CollaborationSchema = new mongoose.Schema({
  entity: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true }, // Could be a business or an influencer
  collaborator: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true }, // Another business or influencer
  collaborationType: { type: String, enum: ['joint_promotion', 'collaboration', 'service_partnership'], required: true },
  details: { type: String }, // Additional details about the collaboration
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'ended'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Collaboration', CollaborationSchema);
