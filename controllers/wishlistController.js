const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');

// Add items to wishlist
exports.addToWishlist = async (req, res) => {
  const { itemId, itemType } = req.body;

  if (!['product', 'service'].includes(itemType)) {
    return res.status(400).json({ message: 'Invalid item type. Must be "product" or "service".' });
  }

  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (wishlist) {
      // Check if item already exists in wishlist
      if (wishlist.items.some(item => item.itemId.toString() === itemId && item.itemType === itemType)) {
        return res.status(400).json({ message: 'Item already in wishlist.' });
      }

      wishlist.items.push({ itemType, itemId });
      await wishlist.save();
      res.status(200).json({ message: 'Item added to wishlist successfully.', wishlist });
    } else {
      const newWishlist = new Wishlist({
        user: req.user.id,
        items: [{ itemType, itemId }],
      });

      await newWishlist.save();
      res.status(201).json({ message: 'Wishlist created and item added successfully.', wishlist: newWishlist });
    }
  } catch (error) {
    console.error('Error adding item to wishlist:', error.message);
    res.status(500).json({ message: 'Server error. Could not add item to wishlist.' });
  }
};

// Remove items from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { itemId, itemType } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(item => !(item.itemId.toString() === itemId && item.itemType === itemType));
    
    if (wishlist.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in wishlist.' });
    }

    await wishlist.save();
    res.status(200).json({ message: 'Item removed from wishlist successfully.', wishlist });
  } catch (error) {
    console.error('Error removing item from wishlist:', error.message);
    res.status(500).json({ message: 'Server error. Could not remove item from wishlist.' });
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
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    res.status(200).json({ message: 'Wishlist retrieved successfully.', wishlist });
  } catch (error) {
    console.error('Error retrieving wishlist:', error.message);
    res.status(500).json({ message: 'Server error. Could not retrieve wishlist.' });
  }
};

// Create order from wishlist
exports.createOrderFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.itemId');

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(400).json({ message: 'Wishlist is empty. Cannot create an order.' });
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

        if (!productOrService) {
          throw new Error(`Item not found: ${item.itemId}`);
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

    res.status(201).json({ message: 'Order created successfully from wishlist.', order: savedOrder });
  } catch (error) {
    console.error('Error creating order from wishlist:', error.message);
    res.status(500).json({ message: 'Server error. Could not create order from wishlist.' });
  }
};
