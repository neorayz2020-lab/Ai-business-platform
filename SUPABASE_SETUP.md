# Supabase setup for NovaBuild AI

## Current status

The Supabase project is already configured in `config.js`, and the database migration has been applied. These tables were verified in the project: `public.profiles`, `public.agent_runs`, and `public.agent_tasks`. Row Level Security (RLS) is enabled on all three.

The remaining steps are to deploy the website, set the deployed URL in Supabase Auth settings, and test the full flow. Do not run the initial schema again unless you intentionally need to reconcile the database.

## 1. Deploy to Cloudflare Pages

1. Open https://dash.cloudflare.com/ and sign in.
2. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Connect GitHub and select `neorayz2020-lab/Ai-business-platform`.
4. Use production branch `main`, build command `exit 0`, and build output directory `/` (the repository root where `index.html` lives).
5. Deploy and copy the resulting Pages URL.

## 2. Configure Supabase Auth URLs

1. Open the Supabase project at https://supabase.com/dashboard/project/cpluijlgsuaamaycwojm.
2. Open **Authentication** → **URL Configuration**.
3. Set **Site URL** to the exact deployed Cloudflare Pages URL.
4. Add the same URL to **Redirect URLs** and save.

If email confirmation is enabled, signup may require a confirmation email. Do not disable security settings just to avoid an email problem; use a mailbox you can access.

## 3. Test the website

1. Open the deployed URL.
2. In **AI Agent Command Center**, create a test account or sign in.
3. Generate a sample plan and click **Save plan to account**.
4. Sign out and sign back in; confirm the account state persists.
5. If possible, test with a second test account and confirm it cannot see the first account's rows.
6. If a step fails, capture the exact error and check Supabase Auth/database logs.

Do not enter real customer information until privacy, retention, recovery, and security controls have been reviewed.

## Security notes

- `config.js` is browser-visible and may contain only the public project URL and publishable key.
- Never put database passwords, Supabase secret keys, service_role keys, or AI-provider keys in browser code.
- RLS must remain enabled. The database policies scope data to the signed-in user's ID, and task policies verify ownership of the linked run.

## Current limits

- The planner is rule-based, not a connected LLM.
- Saving stores a proposed plan and task rows; it does not enqueue or execute them.
- No server-side AI key, background worker, external integration, billing, or autonomous action is active.
