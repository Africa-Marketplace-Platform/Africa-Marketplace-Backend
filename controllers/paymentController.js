const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');

exports.payForWishlist = async (req, res) => {
  const { items } = req.body; // Array of item IDs from the wishlist

  try {
    const user = await User.findById(req.user.id).populate('wishlist.product wishlist.service');
    const itemsToPurchase = user.wishlist.filter(item => items.includes(item.product._id.toString()) || items.includes(item.service._id.toString()));
    
    let totalAmount = 0;
    const lineItems = [];

    itemsToPurchase.forEach(item => {
      if (item.product) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.product.name,
              description: item.product.description,
            },
            unit_amount: item.product.price * 100,
          },
          quantity: 1,
        });
        totalAmount += item.product.price;
      }
      if (item.service) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.service.name,
              description: item.service.description,
            },
            unit_amount: item.service.price * 100,
          },
          quantity: 1,
        });
        totalAmount += item.service.price;
      }
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      customer_email: req.user.email,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
