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
      date: { type: Date, default: Date.now }
    },
  ],
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] }
  },
  createdAt: { type: Date, default: Date.now }, // Product creation date
  updatedAt: { type: Date, default: Date.now }, // Last update date
});

ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
