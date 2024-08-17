const express = require('express');
const router = express.Router();
const {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    applyCoupon,
    deleteCoupon,
} = require('../controllers/couponController');
const { authorize, protect, admin } = require('../middleware/authMiddleware'); // Assuming you have an authentication middleware

// Create a new coupon (Admin only)
router.post('/', protect, authorize(['business_owner', 'admin']), createCoupon); // Create a coupon
router.get('/', protect, authorize(['business_owner', 'admin']), getCoupons); // Get all coupons
router.get('/:id', protect, authorize(['business_owner', 'admin']), getCouponById); // Get a single coupon by ID
router.put('/:id', protect, authorize(['business_owner', 'admin']), updateCoupon); // Update a coupon
router.delete('/:id', protect, authorize(['business_owner', 'admin']), deleteCoupon); // Delete a coupon
router.post('/apply', protect, applyCoupon); // Apply coupon to a product or service during checkout


module.exports = router;



// chartjs