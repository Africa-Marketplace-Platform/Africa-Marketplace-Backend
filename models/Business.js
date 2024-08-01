const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  contactInfo: { type: String, required: true },
  socialMediaLinks: { type: [String], required: true },
  verified: { type: Boolean, default: false },
  stars: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  logo: { type: String },
  date: { type: Date, default: Date.now },
});

const Business = mongoose.model('Business', BusinessSchema);

module.exports = Business;
