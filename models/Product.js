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
    active: { type: Boolean, default: false }, // Track if discount is active
    startDate: { type: Date }, // Optional discount start date
    endDate: { type: Date }, // Optional discount end date
  },
  dynamicPrice: { type: Number }, // Dynamic pricing for the product
  flashSale: { 
    active: { type: Boolean, default: false }, 
    startTime: { type: Date }, // Flash sale start time
    endTime: { type: Date }, // Flash sale end time
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
      verifiedPurchase: { type: Boolean, default: false }, // Verified purchase field
      upvotes: { type: Number, default: 0 }, // Upvotes on reviews
      downvotes: { type: Number, default: 0 }, // Downvotes on reviews
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
  
  // Check if the product has an active discount
  const now = new Date();
  if (this.discount.active && (!this.discount.startDate || now >= this.discount.startDate) && (!this.discount.endDate || now <= this.discount.endDate)) {
    if (this.discount.isPercentage) {
      finalPrice -= (finalPrice * this.discount.amount) / 100;
    } else {
      finalPrice -= this.discount.amount;
    }
  }

  // Check if there is an active flash sale
  if (this.flashSale.active && now >= this.flashSale.startTime && now <= this.flashSale.endTime) {
    finalPrice *= 0.8; // Example flash sale discount (20% off)
  }

  return finalPrice;
};

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
