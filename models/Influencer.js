const mongoose = require('mongoose');

const InfluencerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  niche: { type: String, required: true },
  profilePic: { type: String }, // Profile picture URL
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String },
  followers: { type: Number },
  engagementRate: { type: Number },
  collaborations: [
    {
      business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
      status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' },
      terms: { type: String },
      deadline: { type: Date },
      payment: { type: Number },
    },
  ],
  ratings: [
    {
      business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
      rating: { type: Number, required: true },
      review: { type: String, required: true },
    },
  ],
  date: { type: Date, default: Date.now },
});

const Influencer = mongoose.model('Influencer', InfluencerSchema);

module.exports = Influencer;
