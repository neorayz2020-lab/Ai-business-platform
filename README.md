# NovaBuild AI — Business workspace

An early, mobile-responsive prototype for an AI business platform that aims to bring website creation, marketing, ads planning, SEO guidance, ecommerce, lead tracking, and app-publishing guidance into one workspace.

## What's in this first commit

- Responsive SaaS-style dashboard and navigation
- Website project brief builder (rule-based demo, not a live AI generator)
- Marketing copy draft generator (template-based demo)
- Ads campaign planning worksheet with a user-entered budget ceiling (no ads are launched)
- Demo product catalog and lead pipeline
- Google/SEO readiness checklist with progress tracking
- Apple App Store and Google Play publishing guidance

## Run it

This version is static HTML, CSS, and JavaScript. Open `index.html` in a browser, or deploy the repository as a static site with GitHub Pages or another static hosting provider.

## Important limitations

This is a prototype, not a production AI platform. It currently has no backend, user accounts, database, real AI API, payment processing, or integrations with Google Ads, Meta Ads, TikTok Ads, Google Search Console, Apple, or Google Play. Demo product and lead entries are held in page memory and disappear when the page reloads. No ad spend or external publishing action can happen from this version.

Never place private API keys in browser-side JavaScript. Real AI and account integrations should be implemented through secure server-side functions, with user consent, limited permissions, spend caps, audit logs, and approval gates for consequential actions.

## Roadmap

1. Validate the product flow and responsive interface.
2. Add project storage and authentication.
3. Add a secure server-side AI provider integration and real website preview/export.
4. Add SEO checks and guided publishing workflows.
5. Add official marketing-platform connections, conversion tracking, and guarded optimization.
6. Add store, CRM, billing, and team features.

## License

No license has been selected yet. Add a license before accepting contributions or distributing this project.


## AI Agent Command Center (first scaffold)

The AI Agent Command Center is a transparent, local rule-based planner. It maps a user's goal to proposed specialist tasks (coordination, website, marketing, SEO, ads/analytics, store/CRM, or app publishing) and flags actions that must stay approval-gated. It is **not yet an autonomous AI agent system**: there is no model connection, server, scheduler, persistent task queue, connected account, or background execution. It does not publish websites, run campaigns, or spend money.

### Next implementation phase

1. Choose hosting and a managed backend.
2. Add authentication, per-user data isolation, and a server-side task API.
3. Connect an AI provider through server-side secrets only.
4. Add a persistent task queue, logs, retry limits, and a stop/cancel control.
5. Add read-only integrations first; require explicit confirmation for publishing, messages, or ad spend.
