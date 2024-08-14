// routes/businessComparisonRoutes.js
const express = require('express');
const router = express.Router();
const { compareBusinesses } = require('../controllers/businessComparisonController'); // Update to match the controller function name

const {
    protect,
    authorize,
    checkBusinessOwner,
    premium,
} = require('../middleware/authMiddleware'); // Middleware for authentication (if required)

// POST route to compare businesses by their IDs
router.post('/', protect, authorize(['admin']), compareBusinesses); // Update to use the correct function

module.exports = router;
