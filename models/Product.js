const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  images: [{ type: String }], // Array of image URLs
  stock: { type: Number, required: true, default: 0 }, // Stock quantity
  category: { type: String, required: true }, // Category of the product
  tags: [{ type: String }], // Array of tags for search and categorization
  discount: { 
    amount: { type: Number, default: 0 }, // Discount amount
    isPercentage: { type: Boolean, default: false }, // True if discount is in percentage
  },
  dynamicPrice: {
    type: Number,
  },
  flashSale: {
    type: Boolean,
    default: false,
  },
  saleEndTime: {
    type: Date,
  },
  variants: [
    {
      name: { type: String },
      attributes: [{ key: String, value: String }],
      additionalPrice: { type: Number, default: 0 }
    }
  ],
  attributes: [{ key: String, value: String }], // Custom attributes for specifications
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      verifiedPurchase: { type: Boolean, default: false }, // New field for verified purchase
      upvotes: { type: Number, default: 0 }, // New field for upvotes on reviews
      downvotes: { type: Number, default: 0 }, // New field for downvotes on reviews
      date: { type: Date, default: Date.now }
    },
  ],
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] }
  },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Related products
  isFeatured: { type: Boolean, default: false }, // Featured product
  views: { type: Number, default: 0 }, // Number of views for the product
  salesCount: { type: Number, default: 0 }, // Number of times the product has been sold
  createdAt: { type: Date, default: Date.now }, // Product creation date
  updatedAt: { type: Date, default: Date.now }, // Last update date
});

// Middleware to update the `updatedAt` field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate final price considering discount and dynamic pricing
ProductSchema.methods.calculateFinalPrice = function() {
  let finalPrice = this.dynamicPrice || this.price;
  if (this.discount.amount > 0) {
    if (this.discount.isPercentage) {
      finalPrice -= (finalPrice * this.discount.amount) / 100;
    } else {
      finalPrice -= this.discount.amount;
    }
  }
  return finalPrice;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
