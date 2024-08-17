const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Service = require('../models/Service');
const { logActivity } = require('./activityController'); // Import the activity logger

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount, isPercentage, business, startDate, endDate, usageLimit, products, services } = req.body;

    // Check for existing coupon with the same code
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ msg: 'Coupon code already exists' });
    }

    // Create new coupon
    const coupon = new Coupon({
      code,
      discount: { amount: discount, isPercentage },
      business,
      startDate,
      endDate,
      usageLimit,
      applicableTo: { products, services }
    });

    await coupon.save();
    await logActivity(req.user.id, `Created a new coupon: ${coupon.code}`);

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });
  } catch (err) {
    console.error(`Error creating coupon: ${err.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('business', 'name');
    res.status(200).json(coupons);
  } catch (err) {
    console.error(`Error fetching coupons: ${err.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get a coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('business', 'name');
    if (!coupon) {
      return res.status(404).json({ msg: 'Coupon not found' });
    }
    res.status(200).json(coupon);
  } catch (err) {
    console.error(`Error fetching coupon by ID: ${err.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { code, discount, isPercentage, startDate, endDate, usageLimit, products, services } = req.body;

    let coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ msg: 'Coupon not found' });
    }

    // Update coupon fields
    coupon.code = code || coupon.code;
    coupon.discount.amount = discount !== undefined ? discount : coupon.discount.amount;
    coupon.discount.isPercentage = isPercentage !== undefined ? isPercentage : coupon.discount.isPercentage;
    coupon.startDate = startDate || coupon.startDate;
    coupon.endDate = endDate || coupon.endDate;
    coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
    coupon.applicableTo.products = products || coupon.applicableTo.products;
    coupon.applicableTo.services = services || coupon.applicableTo.services;

    await coupon.save();
    await logActivity(req.user.id, `Updated coupon: ${coupon.code}`);

    res.status(200).json({
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (err) {
    console.error(`Error updating coupon: ${err.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ msg: 'Coupon not found' });
    }

    await coupon.remove();
    await logActivity(req.user.id, `Deleted coupon: ${coupon.code}`);

    res.status(200).json({ msg: 'Coupon removed successfully' });
  } catch (err) {
    console.error(`Error deleting coupon: ${err.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Apply a coupon to a product or service
exports.applyCoupon = async (req, res) => {
  try {
    const { code, productId, serviceId } = req.body;

    // Check for the coupon
    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.active) {
      return res.status(400).json({ msg: 'Invalid or inactive coupon' });
    }

    // Validate coupon dates
    const now = new Date();
    if ((coupon.startDate && now < coupon.startDate) || (coupon.endDate && now > coupon.endDate)) {
      return res.status(400).json({ msg: 'Coupon is not valid at this time' });
    }

    // Check if coupon usage limit has been reached
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ msg: 'Coupon usage limit has been reached' });
    }

    let finalPrice;
    let itemType;

    // Apply coupon to product
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      if (!coupon.applicableTo.products.includes(productId)) {
        return res.status(400).json({ msg: 'Coupon not applicable to this product' });
      }

      finalPrice = product.calculateFinalPrice();
      finalPrice = coupon.applyCoupon(finalPrice); // Apply coupon discount
      itemType = 'product';

    // Apply coupon to service
    } else if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ msg: 'Service not found' });
      }

      if (!coupon.applicableTo.services.includes(serviceId)) {
        return res.status(400).json({ msg: 'Coupon not applicable to this service' });
      }

      finalPrice = service.price;
      finalPrice = coupon.applyCoupon(finalPrice); // Apply coupon discount
      itemType = 'service';
    } else {
      return res.status(400).json({ msg: 'Either productId or serviceId is required' });
    }

    // Update coupon usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({
      message: `Coupon applied successfully to the ${itemType}`,
      itemType,
      finalPrice,
      coupon: coupon.code
    });
  } catch (err) {
    console.error(`Error applying coupon: ${err.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};
