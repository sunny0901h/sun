// netlify/functions/stripe-webhook.js
const Stripe = require('stripe');

// 必填：在 Netlify 環境變數中已設定
// STRIPE_WEBHOOK_SECRET
// APPS_SCRIPT_URL
// APP_SCRIPT_SHARED_SECRET
// （STRIPE_SECRET_KEY 不是必須，但保留以後擴充用）
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    // 這一步會驗證 Stripe 簽名（非常重要）
    stripeEvent = Stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Signature verification failed:', err.message);
    return { statusCode: 400, body: `Signature verification failed: ${err.message}` };
  }

  // 轉送到你的 Google Apps Script Web App
  const appUrl = process.env.APPS_SCRIPT_URL;              // 你的 /exec URL
  const shared = process.env.APP_SCRIPT_SHARED_SECRET || ''; // 你剛新增的 shared secret

  try {
    // Node 18+ 環境有內建 fetch（Netlify Functions 預設 OK）
    await fetch(appUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shared-secret': shared,
      },
      body: JSON.stringify({
        type: stripeEvent.type,
        object: stripeEvent.data.object,
      }),
    });
  } catch (err) {
    console.error('Forward to Apps Script failed:', err);
    // 即便轉送失敗，仍回 200，避免 Stripe 重試過度；你也可以改成 500 觀察行為
  }

  return { statusCode: 200, body: 'ok' };
};
