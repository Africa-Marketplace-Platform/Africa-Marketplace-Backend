const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');

// Add items to wishlist
exports.addToWishlist = async (req, res) => {
  const { itemId, itemType } = req.body;

  if (!['product', 'service'].includes(itemType)) {
    return res.status(400).json({ message: 'Invalid item type' });
  }

  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (wishlist) {
      // Check if item already exists in wishlist
      if (wishlist.items.some(item => item.itemId.toString() === itemId && item.itemType === itemType)) {
        return res.status(400).json({ message: 'Item already in wishlist' });
      }

      wishlist.items.push({ itemType, itemId });
      await wishlist.save();
      res.json(wishlist);
    } else {
      const newWishlist = new Wishlist({
        user: req.user.id,
        items: [{ itemType, itemId }],
      });

      await newWishlist.save();
      res.status(201).json(newWishlist);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove items from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { itemId, itemType } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(item => !(item.itemId.toString() === itemId && item.itemType === itemType));
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get wishlist items
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: 'items.itemId',
      select: 'name price',
      populate: { path: 'owner', select: 'name' },
    });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.json(wishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create order from wishlist
exports.createOrderFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.itemId');

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(400).json({ message: 'Wishlist is empty' });
    }

    // Calculate total price
    const items = await Promise.all(
      wishlist.items.map(async item => {
        let productOrService;
        if (item.itemType === 'product') {
          productOrService = await Product.findById(item.itemId._id);
        } else if (item.itemType === 'service') {
          productOrService = await Service.findById(item.itemId._id);
        }

        return {
          itemType: item.itemType,
          itemId: productOrService._id,
          quantity: 1,
          price: productOrService.price,
        };
      })
    );

    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Create order
    const order = new Order({
      user: req.user.id,
      items,
      totalPrice,
    });

    const savedOrder = await order.save();

    // Clear wishlist
    wishlist.items = [];
    await wishlist.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
