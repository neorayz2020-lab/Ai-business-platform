# NovaBuild AI — billing setup

## Initial model
- Billing model: monthly subscription.
- Permanent Free plan: ₪0.
- Pro: proposed ₪79/month.
- Business AI: proposed ₪199/month.
- Selected Israeli provider: Grow (Meshulam).
- Checkout status: **disabled** until merchant onboarding and server integration are complete.

Prices are proposals and should be reviewed before launch. The UI deliberately does not open a checkout, collect card details, or claim a payment succeeded.

## Current implementation
- The Plans & billing screen is available in the app navigation.
- Paid plan buttons are disabled in HTML and again in `billing.js` (fail-closed).
- The provider selection is public configuration only; no credentials or secret keys are stored in the repository.
- A database table is reserved for server-verified subscription state. Browser clients can read only their own subscription rows and cannot insert or update them directly.
- This does not yet create Grow payment sessions or activate subscriptions.

## Required before enabling payments
1. Open a Grow (Meshulam) merchant account and obtain the API details from Grow directly.
2. Store all private credentials only in Supabase Edge Function secrets; never in `config.js`, HTML, CSS, or browser JavaScript.
3. Implement an authenticated server-side checkout function that accepts only known plan IDs and server-defined ILS amounts.
4. Implement a webhook/notification endpoint that verifies the provider's signature/authentication and event status, prevents replay/duplicate processing, and updates subscription state server-side only.
5. Confirm payment status from the server/provider before marking a subscription active. Never trust a browser redirect as proof of payment.
6. Add cancellation/renewal handling, failure states, invoices/receipts, and terms/privacy/refund disclosures as required.
7. Test sandbox/test transactions and webhook retries before enabling checkout in production.

Do not enable the buttons until the end-to-end flow has been verified.
