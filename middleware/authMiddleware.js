const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const InfluencerContent = require('../models/InfluencerContent');

// Protect routes - ensures user is authenticated
exports.protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extract token from header
  }

  // If token not found, return unauthorized error
  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }

  try {
    // Verify token and attach user to the request object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password'); // Exclude password from user object
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Not authorized, token failed' });
  }
};

// Middleware for premium access routes with different premium tiers
exports.premium = (requiredTier = "standard") => {
  return (req, res, next) => {
    if (!req.user.premium || req.user.premiumTier !== requiredTier) {
      return res.status(403).json({ msg: `Access denied, ${requiredTier} premium members only` });
    }
    next();
  };
};

// Authorization middleware for specific roles
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'User role not authorized' });
    }
    next();
  };
};

// Check if user is the owner of the business or has admin privileges
exports.checkBusinessOwner = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);

    // If business not found, return 404 error
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    // Check if user is the owner of the business or has admin role
    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Check if user is the influencer for content or has admin privileges
exports.checkInfluencer = async (req, res, next) => {
  try {
    const influencerContent = await InfluencerContent.findById(req.params.id);

    // If influencer content not found, return 404 error
    if (!influencerContent) {
      return res.status(404).json({ msg: 'Influencer content not found' });
    }

    // Check if user is the influencer who created the content or has admin role
    if (influencerContent.influencer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
