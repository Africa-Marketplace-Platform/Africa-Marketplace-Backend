const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;

      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        premium: updatedUser.premium,
        wishlistProducts: updatedUser.wishlistProducts,
        wishlistServices: updatedUser.wishlistServices,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add product to wishlist
exports.addProductToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.productId);

    if (user && product) {
      if (!user.wishlistProducts.includes(product.id)) {
        user.wishlistProducts.push(product.id);
        await user.save();
        res.status(200).json({ message: 'Product added to wishlist' });
      } else {
        res.status(400).json({ message: 'Product already in wishlist' });
      }
    } else {
      res.status(404).json({ message: 'User or Product not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove product from wishlist
exports.removeProductFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.productId);

    if (user && product) {
      user.wishlistProducts = user.wishlistProducts.filter(
        (prod) => prod.toString() !== product.id
      );
      await user.save();
      res.status(200).json({ message: 'Product removed from wishlist' });
    } else {
      res.status(404).json({ message: 'User or Product not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add service to wishlist
exports.addServiceToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const service = await Service.findById(req.params.serviceId);

    if (user && service) {
      if (!user.wishlistServices.includes(service.id)) {
        user.wishlistServices.push(service.id);
        await user.save();
        res.status(200).json({ message: 'Service added to wishlist' });
      } else {
        res.status(400).json({ message: 'Service already in wishlist' });
      }
    } else {
      res.status(404).json({ message: 'User or Service not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove service from wishlist
exports.removeServiceFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const service = await Service.findById(req.params.serviceId);

    if (user && service) {
      user.wishlistServices = user.wishlistServices.filter(
        (serv) => serv.toString() !== service.id
      );
      await user.save();
      res.status(200).json({ message: 'Service removed from wishlist' });
    } else {
      res.status(404).json({ message: 'User or Service not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
