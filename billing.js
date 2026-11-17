/* NovaBuild billing bootstrap.
 * Grow (Meshulam) is the selected provider, but checkout remains disabled until
 * merchant credentials, server-side checkout creation, and signed webhook verification are deployed.
 * Never add provider secrets to this file or any browser-delivered asset.
 */
(() => {
  const billingConfig = Object.freeze({
    provider: 'grow_meshulam',
    checkoutEnabled: false,
    currency: 'ILS',
    model: 'monthly_subscription'
  });
  document.documentElement.dataset.billingProvider = billingConfig.provider;
  document.documentElement.dataset.billingCheckout = 'disabled';

  // Fail closed: paid-plan controls must never look actionable without a verified backend.
  document.querySelectorAll('.billing-button').forEach((button) => {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  });

  window.NovaBuildBilling = Object.freeze({
    getStatus() {
      return {
        provider: billingConfig.provider,
        checkoutEnabled: billingConfig.checkoutEnabled,
        model: billingConfig.model,
        currency: billingConfig.currency
      };
    }
  });
})();
