const Business = require("../models/Business");
const Product = require("../models/Product");
const Service = require("../models/Service");
const User = require("../models/User");
const InfluencerContent = require("../models/InfluencerContent");
const upload = require("../middleware/multerConfig");

// Create a new business
exports.createBusiness = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, contactInfo, socialMediaLinks, categories, website, operatingHours, location } = req.body;
    const logo = req.file ? `/uploads/logos/${req.file.filename}` : '';

    try {
      const business = new Business({
        name,
        description,
        contactInfo,
        socialMediaLinks,
        categories,
        website,
        operatingHours,
        location,
        logo,
        owner: req.user.id,
      });

      const createdBusiness = await business.save();
      res.status(201).json(createdBusiness);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  });
};

exports.searchBusinesses = async (req, res) => {
  try {
    const { keyword, location, categories, rating, sortBy, services } = req.query;

    // Create a query object to dynamically add filters
    let query = {};

    // Keyword search
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') },
      ];
    }

    // Location filter
    if (location) {
      query["location.city"] = new RegExp(location, 'i');
    }

    // Categories filter
    if (categories) {
      const categoryList = categories.split(',');
      query.categories = { $in: categoryList };
    }

    // Rating filter
    if (rating) {
      query.averageRating = { $gte: parseFloat(rating) };
    }

    // Services filter
    if (services) {
      const serviceList = services.split(',');
      query.servicesOffered = { $in: serviceList };
    }

    // Find businesses based on filters
    let businesses = Business.find(query);

    // Sorting options
    if (sortBy === "rating") {
      businesses = businesses.sort({ averageRating: -1 });
    } else if (sortBy === "popularity") {
      businesses = businesses.sort({ stars: -1 });  // Assuming `stars` reflects popularity
    } else if (sortBy === "proximity") {
      // Handle proximity logic based on user's location if provided
      // Requires geolocation and distance calculations
    }

    const results = await businesses
      .populate("owner", "name email")
      .populate("servicesOffered", "name")
      .populate("productsOffered", "name");

    res.json(results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all businesses
exports.getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("owner", "name email")
      .populate("productsOffered", "name price")
      .populate("servicesOffered", "name price")
      .populate("ratings.user", "name");

    res.json(businesses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get business by ID
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate("owner", "name email")
      .populate("productsOffered", "name price")
      .populate("servicesOffered", "name price")
      .populate("ratings.user", "name");

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }
    res.json(business);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update a business
exports.updateBusiness = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, contactInfo, socialMediaLinks, categories, website, operatingHours, location } = req.body;
    const logo = req.file ? `/uploads/logos/${req.file.filename}` : '';

    try {
      let business = await Business.findById(req.params.id);

      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      // Authorization check: Only the owner or admin can update the business
      if (business.owner.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(401).json({ message: "User not authorized" });
      }

      // Updating business details
      business.name = name || business.name;
      business.description = description || business.description;
      business.contactInfo = contactInfo || business.contactInfo;
      business.socialMediaLinks = socialMediaLinks || business.socialMediaLinks;
      business.categories = categories || business.categories;
      business.website = website || business.website;
      business.operatingHours = operatingHours || business.operatingHours;
      business.location = location || business.location;
      if (logo) {
        business.logo = logo;
      }

      const updatedBusiness = await business.save();
      res.json(updatedBusiness);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  });
};

// Delete a business
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    await business.remove();
    res.json({ msg: "Business removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get products under a business
exports.getProductsByBusiness = async (req, res) => {
  try {
    const products = await Product.find({ business: req.params.businessId })
      .populate("business", "name");
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get services under a business
exports.getServicesByBusiness = async (req, res) => {
  try {
    const services = await Service.find({ business: req.params.businessId })
      .populate("business", "name");
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get influencers associated with a business
exports.getInfluencersByBusiness = async (req, res) => {
  try {
    const influencerContent = await InfluencerContent.find({ business: req.params.businessId })
      .populate("influencer", "name");

    const influencers = influencerContent.map(content => content.influencer);

    res.json(influencers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get business analytics
exports.getBusinessAnalytics = async (req, res) => {
  try {
    const businessId = req.params.businessId;
    const productCount = await Product.countDocuments({ business: businessId });
    const serviceCount = await Service.countDocuments({ business: businessId });
    const influencerCount = await InfluencerContent.countDocuments({ business: businessId });
    const averageRating = await Business.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(businessId) } },
      { $unwind: "$ratings" },
      { $group: { _id: "$_id", averageRating: { $avg: "$ratings.rating" } } }
    ]);

    res.json({ productCount, serviceCount, influencerCount, averageRating: averageRating[0]?.averageRating || 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.favoriteBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const businessId = req.params.businessId;

    // Find the user
    const user = await User.findById(userId);

    // Check if the business is already favorited
    if (user.favorites.includes(businessId)) {
      return res.status(400).json({ message: "Business already in favorites" });
    }

    // Add business to the user's favorites
    user.favorites.push(businessId);
    await user.save();

    res.status(200).json({ message: "Business added to favorites", favorites: user.favorites });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a business from favorites
exports.unfavoriteBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const businessId = req.params.businessId;

    // Find the user
    const user = await User.findById(userId);

    // Check if the business is in favorites
    if (!user.favorites.includes(businessId)) {
      return res.status(400).json({ message: "Business not in favorites" });
    }

    // Remove business from the user's favorites
    user.favorites = user.favorites.filter((fav) => fav.toString() !== businessId);
    await user.save();

    res.status(200).json({ message: "Business removed from favorites", favorites: user.favorites });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getFavoriteBusinesses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user and populate their favorite businesses
    const user = await User.findById(userId).populate("favorites");

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};