const express = require('express');
const router = express.Router();
const {
  compareBusinesses,
  getComparisonHistory,
  deleteComparison
} = require('../controllers/businessComparisonController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route to compare businesses by metrics
router.post('/', protect, authorize(['regular_user', 'business_owner', 'admin']), compareBusinesses);

// Route to get user's comparison history
router.get('/history', protect, authorize(['regular_user', 'business_owner', 'admin']), getComparisonHistory);

// Route to delete a comparison record (admin or user who created it)
router.delete('/:id', protect, authorize(['regular_user', 'business_owner', 'admin']), deleteComparison);

module.exports = router;
