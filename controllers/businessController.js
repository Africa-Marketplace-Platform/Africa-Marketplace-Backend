const Business = require("../models/Business");
const upload = require("../config/multerConfig");

// Create a new business
exports.createBusiness = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, contactInfo, socialMediaLinks } = req.body;
    const logo = req.file ? `/uploads/logos/${req.file.filename}` : '';

    try {
      const business = new Business({
        name,
        description,
        contactInfo,
        socialMediaLinks,
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

exports.getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate("owner", "name email");
    res.json(businesses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("owner", "name email");
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

    const { name, description, contactInfo, socialMediaLinks } = req.body;
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
