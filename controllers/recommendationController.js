const Product = require('../models/Product');
const Service = require('../models/Service');

exports.getRecommendations = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);
    const services = await Service.find().sort({ createdAt: -1 }).limit(10);
    res.json({ products, services });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
