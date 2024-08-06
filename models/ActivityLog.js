const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = ActivityLog;
