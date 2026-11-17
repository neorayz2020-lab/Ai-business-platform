# NovaBuild AI — Business workspace

An early, mobile-responsive prototype for an AI business platform that aims to bring website creation, marketing, ads planning, SEO guidance, ecommerce, lead tracking, and app-publishing guidance into one workspace.

## Current project status

- GitHub repository: `neorayz2020-lab/Ai-business-platform`
- Supabase project: configured in `config.js` using the public project URL and publishable key.
- Database: `profiles`, `agent_runs`, and `agent_tasks` have been created in Supabase. Row Level Security (RLS) is enabled on all three tables.
- Hosting: Cloudflare Pages deployment has not yet been verified.
- Authentication and saving plans: implemented in the browser code, but still need an end-to-end test on the deployed site.

## What's included

- Responsive SaaS-style dashboard and navigation
- Website project brief builder (rule-based demo, not a live AI generator)
- Marketing copy draft generator (template-based demo)
- Ads campaign planning worksheet (does not launch ads or spend money)
- Demo product catalog and lead pipeline
- Google/SEO readiness checklist with progress tracking
- Apple App Store and Google Play publishing guidance
- Rule-based AI Agent Command Center scaffold
- Supabase email/password auth scaffold and explicit Save plan action

## Deploy

This is a static HTML/CSS/JavaScript site. For Cloudflare Pages, connect the GitHub repository, use `main` as the production branch, set the build command to `exit 0`, and set the build output directory to `/` (the repository root containing `index.html`). Follow `SUPABASE_SETUP.md` to configure authentication URLs and run the post-deployment tests.

## Important limitations

This is not yet a production AI platform. The planner is rule-based and does not call an LLM. Saving a plan stores proposed plan/task rows; it does not enqueue or execute tasks. Real AI, payment processing, and integrations with Google Ads, Meta Ads, TikTok Ads, Google Search Console, Apple, or Google Play are not connected. Demo product and lead entries remain in page memory and disappear when the page reloads. No ad spend or external publishing action can happen from this version.

Never place private API keys, database passwords, Supabase secret keys, or service_role keys in browser-side JavaScript. Real AI and account integrations must use secure server-side functions, user consent, limited permissions, spend caps, audit logs, and approval gates for consequential actions.

## Roadmap

1. Deploy the static site and verify signup/sign-in and plan saving end to end.
2. Add a secure server-side AI provider integration and real website preview/export.
3. Add SEO checks and guided publishing workflows.
4. Add official marketing-platform connections, conversion tracking, and guarded optimization.
5. Add persistent store/CRM data, billing, and team features.

## AI Agent Command Center

The AI Agent Command Center is a transparent, local rule-based planner. It maps a user's goal to proposed specialist tasks and flags actions that must stay approval-gated. It is not an autonomous AI agent system: there is no model connection, server, scheduler, persistent task queue, or background execution. It does not publish websites, run campaigns, or spend money.

## Supabase auth and task-plan storage

- `supabase/schema.sql` defines `profiles`, `agent_runs`, and `agent_tasks` with per-user row-level security.
- `supabase-auth.js` provides email/password signup, sign-in, sign-out, and explicit Save plan.
- `config.js` contains the public Supabase URL and publishable key only. Never place secrets there.
- `SUPABASE_SETUP.md` documents deployment and testing.

## License

No license has been selected yet. Add a license before accepting contributions or distributing this project.
