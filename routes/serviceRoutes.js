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
  deleteServiceReview
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

module.exports = router;
