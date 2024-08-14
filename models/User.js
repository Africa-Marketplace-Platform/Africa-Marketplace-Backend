const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  role: {
    type: String,
    enum: ['regular_user', 'business_owner', 'influencer', 'admin'],
    default: 'regular_user'
  },
  googleId: { type: String },
  facebookId: { type: String },
  twitterId: { type: String },
  premium: { type: Boolean, default: false },
  premiumTier: { type: String, enum: ['standard', 'gold', 'platinum'], default: 'standard' },
  date: { type: Date, default: Date.now },
  wishlist: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    },
  ],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Business" }],
  notificationPreferences: {
    categories: [String], // Categories of interest (e.g., "electronics", "food")
    offers: { type: Boolean, default: true },
    newProducts: { type: Boolean, default: true },
    newServices: { type: Boolean, default: true },
    newBusinesses: { type: Boolean, default: true },
  },
  // theme: { type: String, default: 'default' }, // Theme customization
  // layout: { type: String, default: 'default' },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
