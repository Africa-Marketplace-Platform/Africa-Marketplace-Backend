const Coupon = require('../models/Coupon');
const { logActivity } = require('./activityController'); // Import the activity logger

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount, isPercentage, business, startDate, endDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ msg: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code,
      discount: { amount: discount, isPercentage },
      business,
      startDate,
      endDate,
      usageLimit,
    });

    await coupon.save();
    await logActivity(req.user.id, `Created a new coupon: ${coupon.code}`);

    res.status(201).json(coupon);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('business', 'name');
    res.json(coupons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get a coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('business', 'name');
    if (!coupon) {
      return res.status(404).json({ msg: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { code, discount, isPercentage, startDate, endDate, usageLimit } = req.body;

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

    await coupon.save();
    await logActivity(req.user.id, `Updated coupon: ${coupon.code}`);

    res.json(coupon);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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

    res.json({ msg: 'Coupon removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Apply a coupon to a product (during checkout)
exports.applyCoupon = async (req, res) => {
  try {
    const { code, productId } = req.body;

    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.active) {
      return res.status(400).json({ msg: 'Invalid or inactive coupon' });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate || coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({ msg: 'Coupon is not valid at this time' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ msg: 'Coupon usage limit has been reached' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    let finalPrice = product.calculateFinalPrice(); // Apply any existing product discounts

    // Apply coupon discount
    if (coupon.discount.isPercentage) {
      finalPrice -= (finalPrice * coupon.discount.amount) / 100;
    } else {
      finalPrice -= coupon.discount.amount;
    }

    // Update coupon usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.json({ finalPrice, coupon: coupon.code });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
