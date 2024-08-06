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

// Only business owners and admins can create and manage businesses
router.post('/', protect, authorize(['business_owner', 'admin']), createBusiness);
router.get('/', getBusinesses);
router.get('/:id', getBusinessById);
router.put('/:id', protect, authorize(['business_owner', 'admin']), checkBusinessOwner, updateBusiness);
router.delete('/:id', protect, authorize(['business_owner', 'admin']), checkBusinessOwner, deleteBusiness);

// New routes to get products, services, and influencers associated with a business
router.get('/:businessId/products', getProductsByBusiness);
router.get('/:businessId/services', getServicesByBusiness);
router.get('/:businessId/influencers', getInfluencersByBusiness);

// Route to get business analytics
router.get('/:businessId/analytics', getBusinessAnalytics);

module.exports = router;
