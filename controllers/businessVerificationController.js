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

    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

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

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  try {
    const verificationRequest = await BusinessVerification.findById(verificationId).populate('business');

    if (!verificationRequest) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    // Update the verification status and comments
    verificationRequest.status = status;
    verificationRequest.reviewComments = reviewComments;

    // Log the review in history
    verificationRequest.verificationHistory.push({
      status,
      reviewedBy: req.user.id, // Assuming req.user contains the admin's information
      comments: reviewComments,
    });

    // Handle approved status
    if (status === 'approved') {
      verificationRequest.verifiedAt = Date.now();
      verificationRequest.business.verified = true; // Mark the business as verified

      // Automatically set the verification expiration date (1 year from now)
      verificationRequest.verificationExpiresAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

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

// Get verification details by ID
exports.getVerificationDetails = async (req, res) => {
  try {
    const verificationRequest = await BusinessVerification.findById(req.params.verificationId)
      .populate('business', 'name owner')
      .populate('verificationHistory.reviewedBy', 'name email');

    if (!verificationRequest) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    res.json(verificationRequest);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Expire verification (automated or admin action)
exports.expireVerification = async (req, res) => {
  try {
    const verificationRequest = await BusinessVerification.findById(req.params.verificationId).populate('business');

    if (!verificationRequest) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    if (verificationRequest.verificationExpiresAt && verificationRequest.verificationExpiresAt < new Date()) {
      verificationRequest.status = 'expired';
      verificationRequest.business.verified = false; // Mark business as no longer verified

      await verificationRequest.business.save();
      await verificationRequest.save();

      res.json({ message: 'Verification expired successfully' });
    } else {
      res.status(400).json({ message: 'Verification is still valid or cannot be expired at this time' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
