const mongoose = require('mongoose');

const InfluencerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  niche: { type: String, required: true },
  profilePic: { type: String }, // Profile picture URL
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String },
  followers: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  bio: { type: String }, // Added field for influencer bio
  socialMediaLinks: { type: [String] }, // Added field for social media links
  collaborations: [
    {
      business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
      status: { type: String, enum: ['pending', 'accepted', 'completed', 'declined'], default: 'pending' }, // Added 'declined' status
      terms: { type: String },
      deadline: { type: Date },
      payment: { type: Number },
      outcome: { type: String }, // Added field for collaboration outcome/summary
    },
  ],
  ratings: [
    {
      business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
      rating: { type: Number, required: true },
      review: { type: String, required: true },
      date: { type: Date, default: Date.now }, // Added date for each rating
    },
  ],
  contentPortfolio: [
    {
      title: { type: String, required: true },
      description: { type: String },
      contentUrl: { type: String, required: true }, // URL to the content
      dateCreated: { type: Date, default: Date.now },
    },
  ], // Added content portfolio for influencers to showcase their work
  verified: { type: Boolean, default: false }, // Added field for verification status
  date: { type: Date, default: Date.now },
});

// Pre-save middleware to calculate engagement rate if followers and ratings are available
InfluencerSchema.pre('save', function (next) {
  if (this.followers && this.ratings.length) {
    const totalRating = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.engagementRate = (totalRating / this.ratings.length) / this.followers;
  }
  next();
});

const Influencer = mongoose.model('Influencer', InfluencerSchema);

module.exports = Influencer;
