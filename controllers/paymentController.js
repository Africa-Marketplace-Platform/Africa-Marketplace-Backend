const stripe = require('../config/stripe');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Service = require('../models/Service');

// Create a payment intent from wishlist
exports.createPaymentIntentFromWishlist = async (req, res) => {
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

        if (!productOrService) {
          throw new Error(`Item not found: ${item.itemType}`);
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

    if (totalPrice <= 0) {
      return res.status(400).json({ message: 'Invalid total price' });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items,
      totalPrice,
      paymentMethod: 'stripe',
    });

    const savedOrder = await order.save();

    // Clear wishlist
    wishlist.items = [];
    await wishlist.save();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Amount in cents
      currency: 'usd',
      metadata: { orderId: savedOrder._id.toString() },
    });

    res.status(201).json({
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error(`Error creating payment intent: ${error.message}`);
    res.status(500).json({ message: 'Server error. Failed to create payment intent.' });
  }
};

// Webhook to handle Stripe events
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      try {
        const order = await Order.findById(orderId);

        if (order) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: paymentIntent.created,
            email_address: paymentIntent.receipt_email,
          };
          await order.save();
          console.log(`Order ${orderId} marked as paid.`);
        } else {
          console.error(`Order not found for ID: ${orderId}`);
        }
      } catch (err) {
        console.error(`Error updating order after payment: ${err.message}`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  res.json({ message: 'Webhook event processed successfully', received: true });
};
