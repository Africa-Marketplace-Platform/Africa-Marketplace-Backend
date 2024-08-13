const express = require('express');
const router = express.Router();
const {
  protect,
  authorize,
  checkBusinessOwner,
  premium,
} = require('../middleware/authMiddleware');
const {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  getProductsByBusiness,
  getServicesByBusiness,
  getInfluencersByBusiness,
  getBusinessAnalytics,
} = require('../controllers/businessController');

// Route for creating a business (only accessible to business owners and admins)
router.post('/', protect, authorize(['business_owner', 'admin']), createBusiness);

// Route for getting all businesses (public)
router.get('/', getBusinesses);

// Route for getting a specific business by ID (public)
router.get('/:id', getBusinessById);

// Route for updating a business (only accessible to business owners and admins, checks ownership)
router.put(
  '/:id',
  protect,
  authorize(['business_owner', 'admin']),
  checkBusinessOwner,
  updateBusiness
);

// Route for deleting a business (only accessible to business owners and admins, checks ownership)
router.delete(
  '/:id',
  protect,
  authorize(['business_owner', 'admin']),
  checkBusinessOwner,
  deleteBusiness
);

// Route for getting all products associated with a specific business (public)
router.get('/:businessId/products', getProductsByBusiness);

// Route for getting all services associated with a specific business (public)
router.get('/:businessId/services', getServicesByBusiness);

// Route for getting all influencers associated with a specific business (public)
router.get('/:businessId/influencers', getInfluencersByBusiness);

// Route for getting analytics for a specific business (public or restricted, depending on implementation)
router.get('/:businessId/analytics', getBusinessAnalytics);

module.exports = router;
