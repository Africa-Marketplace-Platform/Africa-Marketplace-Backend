const Business = require("../models/Business");
const Product = require("../models/Product");
const Service = require("../models/Service");
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

      if (business.owner.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(401).json({ message: "User not authorized" });
      }

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
