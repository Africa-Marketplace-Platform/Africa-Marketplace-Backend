// routes/businessVerificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  submitVerificationDocuments,
  reviewVerificationRequest,
  getPendingVerifications,
  getVerificationDetails,
  expireVerification
} = require('../controllers/businessVerificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route to submit verification documents (business owner only)
router.post('/submit', protect, authorize(['business_owner']), submitVerificationDocuments);

// Route to review a verification request (admin only)
router.put('/review/:verificationId', protect, authorize(['admin']), reviewVerificationRequest);

// Route to get all pending verification requests (admin only)
router.get('/pending', protect, authorize(['admin']), getPendingVerifications);

// Route to get verification details by ID (admin or business owner)
router.get('/:verificationId', protect, authorize(['admin', 'business_owner']), getVerificationDetails);

// Route to expire a verification request (admin only)
router.put('/expire/:verificationId', protect, authorize(['admin']), expireVerification);

module.exports = router;
