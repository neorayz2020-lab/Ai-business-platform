# NovaBuild AI — Business workspace

NovaBuild AI is a mobile-responsive prototype for a business platform combining AI-assisted website creation, creative assets, marketing planning, lead workflows, SEO guidance, and app-publishing guidance.

## Current status

- GitHub repository: `neorayz2020-lab/Ai-business-platform`, branch `main`.
- Supabase project: `cpluijlgsuaamaycwojm`.
- Browser configuration uses the public Supabase URL and publishable key in `config.js`; never put server secrets in browser files.
- Active Edge Functions: `ai-assistant`, `business-agent`, `generate-website`, and `generate-creative`.
- Cloudflare Workers deployment is configured in `wrangler.toml` and `.github/workflows/deploy-cloudflare.yml`. The workflow validates JavaScript, copies only the browser assets into `public/`, and deploys when GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured.
- Deployment, browser sign-in, and successful Gemini image/site generation must still be verified end to end. A successful Edge Function deployment does not by itself prove that the provider key, model access, quotas, or browser flow work.

## Features in the current prototype

- Responsive Hebrew-first workspace with English language switching.
- Website brief builder, starter website preview/export, and server-side AI-generated website copy.
- Conversational NovaBuild AI assistant through the `ai-assistant` Edge Function.
- AI Creative Studio for logo concepts and advertising images. The browser composes editable brand/post text over the generated image and can download a PNG.
- Marketing plan and copy drafts; planning is not the same as publishing.
- Ads planning worksheet; it does not launch ads or spend money.
- Demo product catalog and lead pipeline; those sample entries are not persistent.
- Leads/WhatsApp reply drafting, SEO readiness checklist, and app-store publishing guidance.
- Supabase email/password auth, business profile, and saved website drafts.

## AI provider setup

The Edge Functions use the server-side Supabase secret `gemini_api_key`.

1. Create or select a Gemini API key in Google AI Studio.
2. In Supabase Dashboard → Edge Functions → Secrets, set `gemini_api_key`.
3. Sign in to NovaBuild AI and test the website builder, assistant, and AI Creative Studio.
4. Confirm the selected Gemini image model is available to the key and check quotas/billing if image generation returns a provider error.

Never commit the key to GitHub or put it in `config.js`. The Creative Studio requires a signed-in user. Generated images are composed in the browser and downloaded locally; they are not automatically published or saved to a cloud media library.

## Cloudflare deployment

The GitHub Actions workflow prepares a clean `public/` directory from the site files and deploys it using Wrangler configuration in `wrangler.toml`. Required GitHub repository Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

If either secret is absent, the workflow deliberately skips deployment and emits a warning. Check the latest GitHub Actions run before assuming a commit is live. The known Worker URL is https://ai-business-platform.neorayz2020.workers.dev/.

## Important limitations

This remains a prototype, not a fully autonomous production platform. Official OAuth/API connections for Meta, Google Ads, TikTok, WhatsApp Business, Google Search Console, Apple App Store, and Google Play are not configured. The Ads Autopilot does not adjust budgets, launch campaigns, or access live performance. Billing is not active. The agent command center still has limited planning/scaffolding rather than a persistent autonomous task queue. Demo store and lead entries disappear on page reload. Saved website drafts do not yet have a full browser library view. Generated creative assets are not yet saved to a persistent media library.

Before public launch, verify signup/sign-in, reset password, website generation, creative generation, download behavior, mobile layouts, RLS policies, error handling, model quotas, privacy disclosures, and Cloudflare deployment. Production integrations need least-privilege credentials, user consent, audit logs, spend limits, and approval gates for consequential actions.

## Security

- Never put private API keys, database passwords, Supabase secret keys, or service-role keys in browser-side JavaScript.
- AI generation runs server-side and should remain behind authenticated functions where appropriate.
- Public AI chat has a best-effort in-memory rate limit; add a durable rate-limit/challenge layer before broad public marketing.
- Do not claim an external action has happened until its official connection is configured and the result is verified.

## License

No license has been selected yet. Add a license before accepting contributions or distributing this project.
