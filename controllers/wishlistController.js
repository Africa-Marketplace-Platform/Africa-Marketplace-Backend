const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');

exports.addToWishlist = async (req, res) => {
  const { productId, serviceId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      user.wishlist.push({ product: productId });
    }
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ msg: 'Service not found' });
      }
      user.wishlist.push({ service: serviceId });
    }
    await user.save();
    res.status(200).json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { itemId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(item => item.product.toString() !== itemId && item.service.toString() !== itemId);
    await user.save();
    res.status(200).json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
