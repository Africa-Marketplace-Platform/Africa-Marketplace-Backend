const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Not authorized, token failed' });
  }
};

exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied, insufficient role' });
    }
    next();
  };
};

exports.checkBusinessOwner = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'User is not the owner of the business' });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
