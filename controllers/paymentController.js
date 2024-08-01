const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
