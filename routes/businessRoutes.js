const express = require('express');
const router = express.Router();
const { protect, authorize, checkBusinessOwner, premium } = require('../middleware/authMiddleware');
const { createBusiness, getBusinesses, getBusinessById, updateBusiness, deleteBusiness } = require('../controllers/businessController');

// Only business owners and admins can create and manage businesses
router.post('/', protect, authorize(['business_owner', 'admin']), createBusiness);
router.get('/', getBusinesses);
router.get('/:id', getBusinessById);
router.put('/:id', protect, authorize(['business_owner', 'admin']), checkBusinessOwner, updateBusiness);
router.delete('/:id', protect, authorize(['business_owner', 'admin']), checkBusinessOwner, deleteBusiness);

module.exports = router;
