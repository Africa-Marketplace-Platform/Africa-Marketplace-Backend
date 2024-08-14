// routes/businessVerificationRoutes.js
const express = require('express');
const router = express.Router();
const businessVerificationController = require('../controllers/businessVerificationController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware for auth

// User submits verification documents
router.post('/submit', protect, businessVerificationController.submitVerificationDocuments);

// Admin reviews the verification request
router.put('/review', protect, authorize(['admin']), businessVerificationController.reviewVerificationRequest);

// Get all pending verification requests (admin only)
router.get('/pending', protect, authorize(['admin']), businessVerificationController.getPendingVerifications);

module.exports = router;
