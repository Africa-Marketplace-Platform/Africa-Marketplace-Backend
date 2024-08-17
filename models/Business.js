const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  contactInfo: { type: String, required: true },
  socialMediaLinks: { type: [String], required: true },
  verified: { type: Boolean, default: false },
  stars: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dashboardConfig: {
    type: Array, // Store the layout configuration as an array of widgets or settings
    default: [],
  },
  logo: { type: String },
  bannerImage: { type: String }, // New field for a banner image
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
  },
  categories: { type: [String], required: true }, // New field for business categories
  servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }], // New field to link services offered
  productsOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // New field to link products offered
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
      comment: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 }, // New field for average rating
  website: { type: String }, // New field for business website
  operatingHours: {
    monday: { open: { type: String }, close: { type: String } },
    tuesday: { open: { type: String }, close: { type: String } },
    wednesday: { open: { type: String }, close: { type: String } },
    thursday: { open: { type: String }, close: { type: String } },
    friday: { open: { type: String }, close: { type: String } },
    saturday: { open: { type: String }, close: { type: String } },
    sunday: { open: { type: String }, close: { type: String } },
  }, // New field for operating hours
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
      comment: { type: String },
      date: { type: Date, default: Date.now },
    },
  ], // New field for business reviews
  createdAt: { type: Date, default: Date.now }, // Renamed for consistency
  updatedAt: { type: Date, default: Date.now }, // New field for tracking updates
});

// Pre-save hook to update the updatedAt field on every save
BusinessSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Business = mongoose.model("Business", BusinessSchema);

module.exports = Business;
