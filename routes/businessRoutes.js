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
  searchBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  getProductsByBusiness,
  favoriteBusiness,
  unfavoriteBusiness,
  getFavoriteBusinesses,
  getServicesByBusiness,
  getInfluencersByBusiness,
  getBusinessAnalytics,
  getBusinessFollowers, // Newly added function
} = require('../controllers/businessController');

// Route for creating a business (only accessible to business owners and admins)
router.post('/', protect, authorize(['business_owner', 'admin']), createBusiness);

// Route for getting all businesses (public)
router.get('/', getBusinesses);

// Route for searching businesses (public)
router.get('/search', searchBusinesses);

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

// Route for getting analytics for a specific business (accessible to premium users and business owners)
router.get(
  '/:businessId/analytics',
  protect,
  authorize(['business_owner', 'admin', 'premium_user']),
  getBusinessAnalytics
);

// Route to favorite a business (only for registered users)
router.post('/favorite/:businessId', protect, favoriteBusiness);

// Route to unfavorite a business (only for registered users)
router.delete('/favorite/:businessId', protect, unfavoriteBusiness);

// Route to get user's favorite businesses (only for registered users)
router.get('/favorites', protect, getFavoriteBusinesses);

// Route to get all followers of a specific business (public)
router.get('/:businessId/followers', getBusinessFollowers); // Newly added route

module.exports = router;
