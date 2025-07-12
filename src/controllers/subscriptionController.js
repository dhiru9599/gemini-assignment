const stripe = require('../config/stripe');
const { User, Subscription } = require('../models');

// Replace with your actual Stripe price ID for Pro subscription (from Stripe dashboard)
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || 'price_1Nxxxxxxx';

// POST /subscribe/pro
async function subscribePro(req, res) {
  const userId = req.user.userId;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: user.mobile + '@example.com', // Use mobile as email for demo
      metadata: { userId },
      success_url: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5000/success',
      cancel_url: process.env.STRIPE_CANCEL_URL || 'http://localhost:5000/cancel',
    });

    // Optionally, save session/customer info to Subscription
    await Subscription.upsert({
      userId,
      tier: 'pro',
      status: 'pending',
      stripeCustomerId: session.customer || null,
    });

    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: 'Stripe error', details: err.message });
  }
}

// POST /webhook/stripe
async function webhookStripe(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle event types
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    // Update subscription to active
    await Subscription.upsert({
      userId,
      tier: 'pro',
      status: 'active',
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
    });
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    // Find by stripeSubscriptionId and set to basic/inactive
    await Subscription.update(
      { tier: 'basic', status: 'inactive' },
      { where: { stripeSubscriptionId: subscription.id } }
    );
  }
  // Add more event types as needed

  res.json({ received: true });
}

// GET /subscription/status
async function getStatus(req, res) {
  const userId = req.user.userId;
  try {
    const sub = await Subscription.findOne({ where: { userId } });
    if (!sub) return res.json({ tier: 'basic', status: 'inactive' });
    return res.json({ tier: sub.tier, status: sub.status });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = { subscribePro, webhookStripe, getStatus }; 