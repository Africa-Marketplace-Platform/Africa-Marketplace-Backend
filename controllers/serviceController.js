const Service = require('../models/Service');
const upload = require('../middleware/multerConfig'); // Import the multer configuration
const { logActivity } = require('./activityController'); // Import the activity logger

// TODO: service update about  - Create promotional campaigns such as discounts, coupons, and flash sales.

// Create a new service
exports.createService = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, price, business, isAvailable, categories, bookingInfo, dynamicPrice, flashSale, saleEndTime, additionalDetails, seo } = req.body;
    let images = [];

    if (req.files) {
      images = req.files.map(file => file.path);
    }

    try {
      const service = new Service({
        name,
        description,
        price,
        business,
        images,
        isAvailable,
        categories,
        bookingInfo,
        dynamicPrice,
        flashSale,
        saleEndTime,
        additionalDetails,
        seo,
      });

      const createdService = await service.save();
      await logActivity(req.user.id, `Created a new service: ${service.name}`); // Log the activity
      res.status(201).json(createdService);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  });
};

// Get all services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate("business", "name contactInfo");
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("business", "name contactInfo");
    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update a service
exports.updateService = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, price, isAvailable, categories, bookingInfo, dynamicPrice, flashSale, saleEndTime, additionalDetails, seo } = req.body;
    let images = req.body.images || [];

    if (req.files) {
      images = req.files.map(file => file.path);
    }

    try {
      let service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      if (service.business.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(401).json({ message: "User not authorized" });
      }

      service.name = name || service.name;
      service.description = description || service.description;
      service.price = price || service.price;
      service.images = images;
      service.isAvailable = isAvailable !== undefined ? isAvailable : service.isAvailable;
      service.categories = categories || service.categories;
      service.bookingInfo = bookingInfo || service.bookingInfo;
      service.dynamicPrice = dynamicPrice || service.dynamicPrice;
      service.flashSale = flashSale !== undefined ? flashSale : service.flashSale;
      service.saleEndTime = saleEndTime || service.saleEndTime;
      service.additionalDetails = additionalDetails || service.additionalDetails;
      service.seo = seo || service.seo;

      const updatedService = await service.save();
      await logActivity(req.user.id, `Updated service: ${service.name}`); // Log the activity
      res.json(updatedService);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  });
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    await service.remove();
    await logActivity(req.user.id, `Deleted service: ${service.name}`); // Log the activity
    res.json({ msg: "Service removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Add a review to a service
exports.addServiceReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const review = {
      user: req.user.id,
      rating,
      comment,
    };

    service.reviews.push(review);
    await service.save();

    await logActivity(req.user.id, `Added a review for service: ${service.name}`);

    res.status(201).json(service);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get reviews for a specific service
exports.getServiceReviews = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('reviews.user', 'name');

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service.reviews);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a review for a service
exports.updateServiceReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const review = service.reviews.find(review => review.user.toString() === req.user.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await service.save();

    await logActivity(req.user.id, `Updated review for service: ${service.name}`);

    res.json(service);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a review for a service
exports.deleteServiceReview = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const reviewIndex = service.reviews.findIndex(review => review.user.toString() === req.user.id);

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    service.reviews.splice(reviewIndex, 1);

    await service.save();

    await logActivity(req.user.id, `Deleted review for service: ${service.name}`);

    res.json(service);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
