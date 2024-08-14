// controllers/businessVerificationController.js
const BusinessVerification = require('../models/BusinessVerification');
const Business = require('../models/Business');
const upload = require('../middleware/multerConfig');

// Submit verification documents for a business
exports.submitVerificationDocuments = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { businessId } = req.body;
    const documents = req.files.map((file) => `/uploads/documents/${file.filename}`);

    try {
      const business = await Business.findById(businessId);

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      // Create a new verification request
      const verificationRequest = new BusinessVerification({
        business: businessId,
        documents,
      });

      await verificationRequest.save();
      res.status(201).json({ message: 'Verification documents submitted successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Review verification request (admin only)
exports.reviewVerificationRequest = async (req, res) => {
  const { verificationId, status, reviewComments } = req.body;

  try {
    const verificationRequest = await BusinessVerification.findById(verificationId).populate('business');

    if (!verificationRequest) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    // Update the verification status and comments
    verificationRequest.status = status;
    verificationRequest.reviewComments = reviewComments;
    if (status === 'approved') {
      verificationRequest.verifiedAt = Date.now();
      verificationRequest.business.verified = true; // Mark the business as verified
      await verificationRequest.business.save(); // Save business verification status
    }

    await verificationRequest.save();
    res.json({ message: 'Verification request reviewed successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all pending verification requests (admin only)
exports.getPendingVerifications = async (req, res) => {
  try {
    const pendingVerifications = await BusinessVerification.find({ status: 'pending' })
      .populate('business', 'name owner')
      .populate('business.owner', 'name email');

    res.json(pendingVerifications);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
