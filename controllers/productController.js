const Product = require("../models/Product");
const upload = require("../middleware/multerConfig"); // Import the multer configuration
const { logActivity } = require("./activityController"); // Import the activity logger
const Notification = require("../models/Notification");
// Create a new product

//TODO: update the product controller using the updated models
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
      const product = new Product({
        name,
        description,
        price,
        dynamicPrice,
        flashSale,
        saleEndTime,
        business,
        images,
        stock,
        category,
        tags,
        discount,
        variants,
        attributes,
        seo,
      });

      await product.save();
      await logActivity(req.user.id, `Created a new product: ${product.name}`); // Log the activity

      // Notify users who have selected this category in their preferences
      const interestedUsers = await User.find({
        "notificationPreferences.categories": category,
        "notificationPreferences.newProducts": true,
      });

      for (const user of interestedUsers) {
        const notification = new Notification({
          user: user._id,
          type: "new_product",
          message: `A new product in the ${category} category: ${name}`,
        });
        await notification.save();
      }

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
    const products = await Product.find().populate(
      "business",
      "name description"
    );
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "business",
      "name description"
    );
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
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
        return res.status(404).json({ msg: "Product not found" });
      }

      // Update product fields
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.dynamicPrice =
        dynamicPrice !== undefined ? dynamicPrice : product.dynamicPrice;
      product.flashSale =
        flashSale !== undefined ? flashSale : product.flashSale;
      product.saleEndTime = saleEndTime || product.saleEndTime;
      product.images = images;
      product.stock = stock !== undefined ? stock : product.stock;
      product.category = category || product.category;
      product.tags = tags || product.tags;
      product.discount = discount || product.discount;
      product.variants = variants || product.variants;
      product.attributes = attributes || product.attributes;
      product.seo = seo || product.seo;

      await product.save();
      await logActivity(req.user.id, `Updated product: ${product.name}`); // Log the activity
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
      return res.status(404).json({ msg: "Product not found" });
    }

    await product.remove();
    await logActivity(req.user.id, `Deleted product: ${product.name}`); // Log the activity
    res.json({ msg: "Product removed" });
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
      return res.status(404).json({ msg: "Product not found" });
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
    await logActivity(
      req.user.id,
      `Added a review for product ${product.name}`
    );

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
      return res.status(404).json({ msg: "Product not found" });
    }

    const review = product.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (voteType === "upvote") {
      review.upvotes += 1;
    } else if (voteType === "downvote") {
      review.downvotes += 1;
    } else {
      return res.status(400).json({ msg: "Invalid vote type" });
    }

    await product.save();
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
