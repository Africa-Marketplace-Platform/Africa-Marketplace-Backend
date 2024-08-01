const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createService, getServices, getServiceById, updateService, deleteService } = require('../controllers/serviceController');

// Only business owners and admins can create and manage services
router.post('/', protect, authorize(['business_owner', 'admin']), createService);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.put('/:id', protect, authorize(['business_owner', 'admin']), updateService);
router.delete('/:id', protect, authorize(['business_owner', 'admin']), deleteService);

module.exports = router;
