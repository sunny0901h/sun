// netlify/functions/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Expects POST with JSON:
 * { items: [{price: 'price_XXX', quantity: 1}, ...], metadata?: {}, customer_email?: '' }
 */
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { items, metadata, customer_email } = JSON.parse(event.body || '{}');
    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: 'Missing items' };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: items,
      success_url: 'https://sunnysugarart.com/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://sunnysugarart.com/cancel.html',
      customer_email,
      shipping_address_collection: { allowed_countries: ['AU'] },
      allow_promotion_codes: true,
      metadata: metadata || {}
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return { statusCode: 500, body: err.message };
  }
};
