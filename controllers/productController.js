const Product = require("../models/Product");
const upload = require("../middleware/multerConfig"); // Import multer configuration
const { logActivity } = require("./activityController"); // Import activity logger
const Notification = require("../models/Notification");
const User = require("../models/User");

// Create a new product
exports.createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const {
      name,
      description,
      price,
      business,
      stock,
      category,
      tags,
      discount,
      dynamicPrice,
      flashSale,
      saleEndTime,
      variants,
      attributes,
      seo,
    } = req.body;
    let images = [];

    if (req.files) {
      images = req.files.map((file) => file.path);
    }

    try {
      // Validate sale end time for flash sales
      if (flashSale && !saleEndTime) {
        return res.status(400).json({ message: "Flash sale requires a sale end time." });
      }

      const product = new Product({
        name,
        description,
        price,
        business,
        stock,
        category,
        tags,
        discount,
        dynamicPrice,
        flashSale,
        saleEndTime,
        images,
        variants,
        attributes,
        seo,
      });

      await product.save();
      await logActivity(req.user.id, `Created a new product: ${product.name}`);

      // Notify users who are interested in this product category
      const interestedUsers = await User.find({
        "notificationPreferences.categories": category,
        "notificationPreferences.newProducts": true,
      });

      const notifications = interestedUsers.map(user => ({
        user: user._id,
        type: "new_product",
        message: `A new product in the ${category} category: ${name}`,
      }));

      await Notification.insertMany(notifications);

      res.status(201).json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("business", "name description");
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("business", "name description");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const {
      name,
      description,
      price,
      stock,
      category,
      tags,
      discount,
      dynamicPrice,
      flashSale,
      saleEndTime,
      variants,
      attributes,
      seo,
    } = req.body;
    let images = req.body.images || [];

    if (req.files) {
      images = req.files.map((file) => file.path);
    }

    try {
      let product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Validate flash sale end time
      if (flashSale && !saleEndTime) {
        return res.status(400).json({ message: "Flash sale requires a sale end time." });
      }

      // Update product fields
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.dynamicPrice = dynamicPrice !== undefined ? dynamicPrice : product.dynamicPrice;
      product.flashSale = flashSale !== undefined ? flashSale : product.flashSale;
      product.saleEndTime = saleEndTime || product.saleEndTime;
      product.images = images.length ? images : product.images;
      product.stock = stock !== undefined ? stock : product.stock;
      product.category = category || product.category;
      product.tags = tags || product.tags;
      product.discount = discount || product.discount;
      product.variants = variants || product.variants;
      product.attributes = attributes || product.attributes;
      product.seo = seo || product.seo;

      await product.save();
      await logActivity(req.user.id, `Updated product: ${product.name}`);

      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.remove();
    await logActivity(req.user.id, `Deleted product: ${product.name}`);

    res.json({ message: "Product removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Add a review to a product
exports.addProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      user: req.user.id,
      rating,
      comment,
      verifiedPurchase: true, // Assuming this is after a purchase
    };

    product.reviews.push(review);
    await product.save();

    // Log the activity
    await logActivity(req.user.id, `Added a review for product ${product.name}`);

    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Upvote or downvote a review
exports.voteReview = async (req, res) => {
  const { reviewId, voteType } = req.body;

  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (voteType === "upvote") {
      review.upvotes += 1;
    } else if (voteType === "downvote") {
      review.downvotes += 1;
    } else {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    await product.save();
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.applyCouponToProduct = async (req, res) => {
  const { productId, couponCode } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const coupon = await Coupon.findOne({ code: couponCode, active: true });
    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    // Check if the coupon is applicable to the product
    if (!coupon.applicableTo.products.includes(productId)) {
      return res.status(400).json({ message: "Coupon not applicable to this product" });
    }

    // Check if the coupon has a minimum purchase requirement
    if (coupon.minPurchaseAmount && product.price < coupon.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase amount for this coupon is ${coupon.minPurchaseAmount}` });
    }

    // Apply the coupon to the product price
    const discountedPrice = coupon.applyCoupon(product.price);

    res.status(200).json({
      product: product.name,
      originalPrice: product.price,
      discountedPrice,
      message: `Coupon applied successfully. Final price: ${discountedPrice}`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};