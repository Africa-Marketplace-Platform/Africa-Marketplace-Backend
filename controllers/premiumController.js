const stripe = require('../config/stripe');
const User = require('../models/User');

exports.createPremiumSubscription = async (req, res) => {
  const { paymentMethodId } = req.body;

  try {
    // Create a new customer and attach the payment method
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: req.user.email,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user to premium
    req.user.premium = true;
    await req.user.save();

    res.status(200).json({ subscription });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
