const mongoose = require('mongoose');

const InfluencerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  niche: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profilePic: { type: String },
  date: { type: Date, default: Date.now },
});

const Influencer = mongoose.model('Influencer', InfluencerSchema);

module.exports = Influencer;
