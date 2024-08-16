const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  dynamicPrice: {
    type: Number,
    required: false,
  },
  flashSale: {
    type: Boolean,
    default: false,
  },
  saleEndTime: {
    type: Date,
    required: function() { return this.flashSale; },
  },
  promotionType: {
    type: String,
    enum: ['flash_sale', 'seasonal_discount', 'clearance_sale'],
    default: null,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  promotionStartDate: {
    type: Date,
    required: function() { return this.promotionType !== null; },
  },
  promotionEndDate: {
    type: Date,
    required: function() { return this.promotionType !== null; },
  },
  images: { type: [String], required: false },
  isAvailable: { type: Boolean, default: true },
  categories: { type: [String], required: true },
  bookingInfo: {
    bookingRequired: { type: Boolean, default: false },
    bookingLink: { type: String, required: function() { return this.bookingRequired; } },
    availableSlots: { type: Number, required: false },
    bookingDates: [
      {
        date: { type: Date, required: true },
        slotsAvailable: { type: Number, required: true },
      },
    ],
  },
  additionalDetails: [
    {
      key: { type: String },
      value: { type: String },
    },
  ],
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] },
  },
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
});

// Middleware to set dateUpdated before each save
ServiceSchema.pre('save', function(next) {
  this.dateUpdated = Date.now();
  next();
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;
