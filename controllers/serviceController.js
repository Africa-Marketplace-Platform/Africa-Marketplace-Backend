const Service = require('../models/Service');
const upload = require('../middleware/multerConfig');
const { logActivity } = require('./activityController');
const Coupon = require("../models/Coupon");

// Create a new service
exports.createService = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { 
      name, description, price, business, isAvailable, categories, bookingInfo, dynamicPrice, 
      flashSale, saleEndTime, additionalDetails, seo, promotionType, discountAmount, 
      promotionStartDate, promotionEndDate 
    } = req.body;
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
        promotionType,
        discountAmount,
        promotionStartDate,
        promotionEndDate
      });

      const createdService = await service.save();
      await logActivity(req.user.id, `Created a new service: ${service.name}`);
      res.status(201).json(createdService);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  });
};

// Update a service
exports.updateService = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { 
      name, description, price, isAvailable, categories, bookingInfo, dynamicPrice, flashSale, 
      saleEndTime, additionalDetails, seo, promotionType, discountAmount, 
      promotionStartDate, promotionEndDate 
    } = req.body;
    let images = req.body.images || [];

    if (req.files) {
      images = req.files.map(file => file.path);
    }

    try {
      let service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Check if user is authorized to update the service
      if (service.business.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(401).json({ message: "User not authorized" });
      }

      // Update service fields
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
      service.promotionType = promotionType || service.promotionType;
      service.discountAmount = discountAmount || service.discountAmount;
      service.promotionStartDate = promotionStartDate || service.promotionStartDate;
      service.promotionEndDate = promotionEndDate || service.promotionEndDate;

      const updatedService = await service.save();
      await logActivity(req.user.id, `Updated service: ${service.name}`);
      res.json(updatedService);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  });
};

// Apply Coupon or Promotional Discount to Service
exports.applyCouponOrPromotionToService = async (req, res) => {
  const { serviceId, couponCode } = req.body;

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    let finalPrice = service.price;

    // Check if a valid coupon is applied
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, active: true });
      if (!coupon || !coupon.isValid()) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }

      if (!coupon.applicableTo.services.includes(serviceId)) {
        return res.status(400).json({ message: "Coupon not applicable to this service" });
      }

      if (coupon.minPurchaseAmount && service.price < coupon.minPurchaseAmount) {
        return res.status(400).json({ message: `Minimum purchase amount for this coupon is ${coupon.minPurchaseAmount}` });
      }

      finalPrice = coupon.applyCoupon(service.price);
    }

    // Check if a flash sale or promotion is active
    const now = new Date();
    if (service.flashSale && service.saleEndTime > now) {
      finalPrice = finalPrice * (1 - service.discountAmount / 100);
    } else if (service.promotionType && service.promotionStartDate <= now && service.promotionEndDate >= now) {
      finalPrice = finalPrice * (1 - service.discountAmount / 100);
    }

    res.status(200).json({
      service: service.name,
      originalPrice: service.price,
      finalPrice,
      message: `Final price after applying applicable promotions: ${finalPrice}`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
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

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    await service.remove();
    await logActivity(req.user.id, `Deleted service: ${service.name}`);
    res.json({ msg: "Service removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


// Get all reviews for a specific service
exports.getServiceReviews = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('reviews.user', 'name email'); // Populating the user's name and email in reviews
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Return the reviews for the service
    res.status(200).json(service.reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};



// Add a review to a specific service
exports.addServiceReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const serviceId = req.params.id;

    // Validate review input
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if the user already reviewed the service
    const alreadyReviewed = service.reviews.find(
      (review) => review.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this service' });
    }

    // Create a new review object
    const newReview = {
      user: req.user.id, // Assuming you have user authentication middleware
      rating: Number(rating),
      comment,
      date: Date.now(),
    };

    // Add the new review to the service's reviews array
    service.reviews.push(newReview);

    // Recalculate the average rating of the service
    service.averageRating =
      service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length;

    // Save the updated service with the new review
    await service.save();

    // Log activity if needed
    await logActivity(req.user.id, `Added a review for service: ${service.name}`);

    res.status(201).json({ message: 'Review added successfully', reviews: service.reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};



// Update a review for a specific service
exports.updateServiceReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const serviceId = req.params.id;

    // Validate review input
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Find the review to update
    const review = service.reviews.find(
      (review) => review.user.toString() === req.user.id.toString()
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update the review fields
    review.rating = Number(rating);
    review.comment = comment;
    review.date = Date.now();

    // Recalculate the average rating
    service.averageRating =
      service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length;

    // Save the updated service
    await service.save();

    // Log activity if needed
    await logActivity(req.user.id, `Updated review for service: ${service.name}`);

    res.status(200).json({ message: 'Review updated successfully', reviews: service.reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete a review for a specific service
exports.deleteServiceReview = async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Find the review to delete
    const reviewIndex = service.reviews.findIndex(
      (review) => review.user.toString() === req.user.id.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Remove the review from the reviews array
    service.reviews.splice(reviewIndex, 1);

    // Recalculate the average rating
    service.averageRating =
      service.reviews.length > 0
        ? service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length
        : 0;

    // Save the updated service
    await service.save();

    // Log activity if needed
    await logActivity(req.user.id, `Deleted review for service: ${service.name}`);

    res.status(200).json({ message: 'Review deleted successfully', reviews: service.reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};





// Create a Flash Sale Campaign for a service
exports.createFlashSaleCampaign = async (req, res) => {
  try {
    const { discountAmount, saleEndTime } = req.body;
    const serviceId = req.params.id;

    // Validate input
    if (!discountAmount || !saleEndTime) {
      return res.status(400).json({ message: 'Discount amount and sale end time are required' });
    }

    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Ensure the user is authorized (business owner or admin)
    if (service.business.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Set flash sale properties
    service.flashSale = true;
    service.discountAmount = discountAmount;
    service.saleEndTime = new Date(saleEndTime);

    // Save the updated service
    await service.save();

    // Log activity if needed
    await logActivity(req.user.id, `Created flash sale campaign for service: ${service.name}`);

    res.status(200).json({
      message: `Flash sale created for service: ${service.name}`,
      flashSaleDetails: {
        discountAmount: service.discountAmount,
        saleEndTime: service.saleEndTime,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};



// End Flash Sale Campaign for a service
exports.endFlashSaleCampaign = async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Ensure the user is authorized (business owner or admin)
    if (service.business.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // End the flash sale by resetting the fields
    service.flashSale = false;
    service.discountAmount = 0;
    service.saleEndTime = null;

    // Save the updated service
    await service.save();

    // Log activity if needed
    await logActivity(req.user.id, `Ended flash sale campaign for service: ${service.name}`);

    res.status(200).json({
      message: `Flash sale ended for service: ${service.name}`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
