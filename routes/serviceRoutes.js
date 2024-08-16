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
  applyCouponOrPromotionToService,  // Added route to apply a coupon
  createFlashSaleCampaign,  // Added route to create a flash sale
  endFlashSaleCampaign      // Added route to end a flash sale
} = require('../controllers/serviceController');

// Only business owners and admins can create and manage services
router.post('/', protect, authorize(['business_owner', 'admin']), createService);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.put('/:id', protect, authorize(['business_owner', 'admin']), updateService);
router.delete('/:id', protect, authorize(['business_owner', 'admin']), deleteService);

// Routes for managing service reviews
router.post('/:id/reviews', protect, addServiceReview); // Users can add reviews
router.get('/:id/reviews', getServiceReviews); // View all reviews for a service
router.put('/:id/reviews', protect, updateServiceReview); // Users can update their reviews
router.delete('/:id/reviews', protect, deleteServiceReview); // Users can delete their reviews

// Promotional Campaigns
router.post('/:id/apply-coupon', protect, applyCouponOrPromotionToService);  // Apply coupon to a service
router.post('/:id/flash-sale', protect, authorize(['business_owner', 'admin']), createFlashSaleCampaign);  // Start flash sale campaign
router.post('/:id/end-flash-sale', protect, authorize(['business_owner', 'admin']), endFlashSaleCampaign);  // End flash sale campaign

module.exports = router;
