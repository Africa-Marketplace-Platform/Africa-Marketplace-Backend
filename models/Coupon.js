const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // Coupon code
    discount: { 
      amount: { type: Number, required: true }, // Discount amount
      isPercentage: { type: Boolean, default: false }, // True if discount is percentage
    },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }, // Business that owns the coupon
    active: { type: Boolean, default: true }, // Whether the coupon is active
    startDate: { type: Date }, // Optional start date
    endDate: { type: Date }, // Optional end date
    usageLimit: { type: Number }, // Optional usage limit
    usedCount: { type: Number, default: 0 }, // Track how many times the coupon has been used
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  // Middleware to update `updatedAt` field before saving
  CouponSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });
  
  const Coupon = mongoose.model('Coupon', CouponSchema);
  module.exports = Coupon;
  