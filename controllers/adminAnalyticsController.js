const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Service = require('../models/Service');

exports.getAdminAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const businessCount = await Business.countDocuments();
    const productCount = await Product.countDocuments();
    const serviceCount = await Service.countDocuments();

    res.json({
      users: userCount,
      businesses: businessCount,
      products: productCount,
      services: serviceCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
