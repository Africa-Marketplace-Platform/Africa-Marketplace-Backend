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
  applicableTo: {
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // List of applicable products
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }], // List of applicable services
  },
  minPurchaseAmount: { type: Number, default: 0 }, // Minimum purchase amount for the coupon to be valid
  maxDiscountAmount: { type: Number }, // Maximum discount amount for percentage-based discounts
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` field before saving
CouponSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

CouponSchema.methods.isValid = function () {
  const now = new Date();
  return this.active && (!this.startDate || this.startDate <= now) && (!this.endDate || this.endDate >= now);
};

CouponSchema.methods.applyCoupon = function (price) {
  let discountAmount = this.discount.amount;

  if (this.discount.isPercentage) {
    discountAmount = (price * discountAmount) / 100;
    if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
      discountAmount = this.maxDiscountAmount;
    }
  }

  return Math.max(price - discountAmount, 0);
};

const Coupon = mongoose.model('Coupon', CouponSchema);
module.exports = Coupon;
