const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// Set subscription fees (in Naira, converted to kobo)
const INFLUENCER_FEE = 10000 * 100;
const BUSINESS_OWNER_FEE = 10000 * 100;

// Controller to handle influencer subscription
exports.subscribeInfluencer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'influencer' || user.role === 'business_owner') {
      return res.status(400).json({ msg: 'You are already subscribed as an influencer or business owner.' });
    }

    // Create a Stripe payment session
    const session = await stripe.paymentIntents.create({
      amount: INFLUENCER_FEE,
      currency: 'ngn',
      payment_method_types: ['card'],
      description: `Subscription for Influencer role by ${user.email}`,
    });

    res.status(200).json({
      msg: 'Payment initiated, please complete the payment',
      clientSecret: session.client_secret,
      paymentIntentId: session.id,
    });
  } catch (error) {
    console.error('Error initiating influencer subscription:', error.message);
    res.status(500).json({ msg: 'Server error. Could not initiate payment.' });
  }
};

// Controller to handle business owner subscription
exports.subscribeBusinessOwner = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'business_owner' || user.role === 'influencer') {
      return res.status(400).json({ msg: 'You are already subscribed as an influencer or business owner.' });
    }

    // Create a Stripe payment session
    const session = await stripe.paymentIntents.create({
      amount: BUSINESS_OWNER_FEE,
      currency: 'ngn',
      payment_method_types: ['card'],
      description: `Subscription for Business Owner role by ${user.email}`,
    });

    res.status(200).json({
      msg: 'Payment initiated, please complete the payment',
      clientSecret: session.client_secret,
      paymentIntentId: session.id,
    });
  } catch (error) {
    console.error('Error initiating business owner subscription:', error.message);
    res.status(500).json({ msg: 'Server error. Could not initiate payment.' });
  }
};

// Webhook to handle successful payment and update user role
exports.handleWebhook = async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment intent success event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userEmail = paymentIntent.description.split(' by ')[1];

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.error('User not found for email:', userEmail);
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user role based on the description
    if (paymentIntent.description.startsWith('Subscription for Influencer')) {
      user.role = 'influencer';
    } else if (paymentIntent.description.startsWith('Subscription for Business Owner')) {
      user.role = 'business_owner';
    }

    await user.save();
    res.status(200).json({ msg: 'User role updated successfully after payment' });
  } else {
    res.status(400).json({ msg: 'Unhandled event type' });
  }
};
