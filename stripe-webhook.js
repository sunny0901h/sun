// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

exports.handler = async (event) => {
  try {
    // Stripe may send base64-encoded body, handle both
    const sig = event.headers['stripe-signature'];
    let payload = event.body;
    if (event.isBase64Encoded) {
      payload = Buffer.from(event.body, 'base64').toString('utf8');
    }

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(payload, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

      const payloadToSheet = {
        session_id: session.id,
        payment_intent: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email || session.customer_email || '',
        customer_name: session.customer_details?.name || '',
        shipping: session.shipping_details || null,
        metadata: session.metadata || {},
        line_items: lineItems.data.map(li => ({
          description: li.description,
          quantity: li.quantity,
          amount_subtotal: li.amount_subtotal,
          amount_total: li.amount_total
        })),
        created: session.created
      };

      // Use global fetch (Node 18+) to forward to Apps Script
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSheet)
      });
    }

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('stripe-webhook handler error:', err);
    return { statusCode: 500, body: 'Server Error' };
  }
};
