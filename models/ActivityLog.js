const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who performed the action
  action: { type: String, required: true }, // Description of the action performed
  date: { type: Date, default: Date.now }, // Timestamp of when the action occurred
  ipAddress: { type: String }, // IP address from which the action was performed
  userAgent: { type: String }, // User agent string to identify the browser/device
  resourceType: { type: String }, // Type of resource involved (e.g., 'product', 'order', 'business')
  resourceId: { type: mongoose.Schema.Types.ObjectId }, // Reference to the resource involved
  changes: { type: mongoose.Schema.Types.Mixed }, // Record of changes made, if applicable (e.g., old vs. new values)
  location: { 
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  }, // Geolocation data if available (e.g., for mobile app)
});

ActivityLogSchema.index({ location: '2dsphere' }); // Create geospatial index if location is used

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = ActivityLog;
