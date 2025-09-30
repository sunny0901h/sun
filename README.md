# Sunny Sugar Art — Netlify Starter (Stripe Checkout + Google Sheet)

This repo is a minimal working template to deploy on Netlify and accept payments via Stripe Checkout.
A Netlify Function creates sessions; a Stripe webhook forwards paid orders to your Google Sheet via Apps Script.

## 1) What you need
- A Stripe account (Live mode enabled)
- Price IDs for your products (e.g. price_12345)
- A Google Apps Script Web App URL that writes to your Google Sheet

## 2) Replace placeholders
- In `index.html`, replace `price_XXXX_...` with your real Price IDs.
- Keep success URL `/success.html` and cancel URL `/cancel.html` or change them to your own domain paths.

## 3) Deploy to Netlify (from Git)
1. Push this folder to GitHub.
2. On Netlify: **Add new site → Import from Git** and select this repo.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.`
4. After first deploy, the Functions will be available at:
   - `/.netlify/functions/create-checkout-session`
   - `/.netlify/functions/stripe-webhook`

## 4) Environment variables (Netlify → Site settings → Environment variables)
- `STRIPE_SECRET_KEY` → `sk_live_...` (or `sk_test_...` while testing)
- `APPS_SCRIPT_URL` → your Apps Script Web App endpoint
- `STRIPE_WEBHOOK_SECRET` → after you add the live webhook in Stripe (step 5)

## 5) Stripe Webhook (Live mode)
- Developers → Webhooks → Add endpoint
- URL: `https://YOUR_NETLIFY_DOMAIN/.netlify/functions/stripe-webhook`
- Events: `checkout.session.completed`
- Copy the Signing secret → paste into Netlify env var `STRIPE_WEBHOOK_SECRET` → redeploy.

## 6) Test
- Open the site, choose a product, click "Buy".
- In test mode, use Stripe test cards (`4242 4242 4242 4242`).
- After success, check Netlify logs (Functions), Stripe Dashboard → Payments, and your Google Sheet.

## Notes
- Node 18+ is assumed (Netlify default). Fetch is global in the function runtime.
- Webhook verifies the Stripe signature and supports base64-encoded bodies.
