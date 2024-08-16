const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authorize, protect, admin } = require('../middleware/authMiddleware'); // Assuming you have an authentication middleware

// Create a new coupon (Admin only)
router.post('/', authorize([ 'admin']), protect, couponController.createCoupon);

// Get all coupons (Admin only)
router.get('/', authorize([ 'admin']), protect, couponController.getCoupons);

// Get a coupon by ID (Admin only)
router.get('/:id', authorize([ 'admin']), protect,  couponController.getCouponById);

// Update a coupon (Admin only)
router.put('/:id', authorize([ 'admin']), protect,  couponController.updateCoupon);

// Delete a coupon (Admin only)
router.delete('/:id', authorize([ 'admin']), protect, couponController.deleteCoupon);

// Apply a coupon to a product (User)
router.post('/apply', authorize([ 'regular-user']), protect, couponController.applyCoupon);

module.exports = router;



// chartjs