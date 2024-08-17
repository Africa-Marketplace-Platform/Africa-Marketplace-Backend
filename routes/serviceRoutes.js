const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  addServiceReview,
  getServiceReviews,
  updateServiceReview,
  deleteServiceReview,
  applyCouponOrPromotionToService,  // Apply a coupon or promotion to service
  createFlashSaleCampaign,  // Create a flash sale campaign
  endFlashSaleCampaign      // End a flash sale campaign
} = require('../controllers/serviceController');

// Routes for services
router.post('/', protect, authorize(['business_owner', 'admin']), createService);  // Create a service
router.get('/', getServices);  // Get all services
router.get('/:id', getServiceById);  // Get a single service by ID
router.put('/:id', protect, authorize(['business_owner', 'admin']), updateService);  // Update a service
router.delete('/:id', protect, authorize(['business_owner', 'admin']), deleteService);  // Delete a service

// Routes for managing reviews on services
router.post('/:id/reviews', protect, addServiceReview);  // Add a review to a service
router.get('/:id/reviews', getServiceReviews);  // Get all reviews for a service
router.put('/:id/reviews/:reviewId', protect, updateServiceReview);  // Update a review on a service
// router.delete('/:id/reviews/:reviewId', protect, deleteServiceReview);  // Delete a review on a service

// Routes for promotional campaigns on services
router.post('/:id/apply-coupon', protect, applyCouponOrPromotionToService);  // Apply a coupon or promotion to a service
router.post('/:id/flash-sale', protect, authorize(['business_owner', 'admin']), createFlashSaleCampaign);  // Start a flash sale campaign
router.post('/:id/end-flash-sale', protect, authorize(['business_owner', 'admin']), endFlashSaleCampaign);  // End a flash sale campaign

module.exports = router;
