const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getSalesPerformance,
  getCustomerDemographics,
  getTrendingProducts,
  saveDashboardPreferences,
} = require('../controllers/analyticsController');

const router = express.Router();

// Sales performance data route
router.get('/sales', protect, authorize(['business_owner']), getSalesPerformance);

// Customer demographics data route
router.get('/customer-demographics', protect, authorize(['business_owner']), getCustomerDemographics);

// Trending products/services data route
router.get('/trending-products', protect, authorize(['business_owner']), getTrendingProducts);

// Save dashboard preferences route
router.post('/dashboard/preferences', protect, authorize(['business_owner']), saveDashboardPreferences);

module.exports = router;
