# Supabase setup for NovaBuild AI

The repository includes a starter browser-auth flow and database schema. It is not active until you create a Supabase project, apply the SQL, and configure the public project URL/key.

## 1. Create the free backend project
1. Open https://supabase.com/dashboard and sign in.
2. Create a new project. Save the database password somewhere safe; never put it in this repository.
3. In Project Settings / API, copy the Project URL and the publishable key (or legacy anon key). Do not copy a secret key or service_role key.

Supabase lists a free tier with quotas and inactivity pausing. Verify current limits at https://supabase.com/pricing before relying on it.

## 2. Create tables and access policies
1. Open SQL Editor in your Supabase project.
2. Open supabase/schema.sql in this repository and copy its full contents into a new SQL query.
3. Run the query.
4. Verify profiles, agent_runs, and agent_tasks exist and Row Level Security (RLS) is enabled on all three.

The SQL scopes rows to the authenticated user's ID. agent_tasks also checks that the linked run belongs to the same user. Never disable RLS to make it work.

## 3. Configure the website
1. Open config.js in GitHub.
2. Set supabaseUrl to the project's HTTPS URL and supabaseAnonKey to its publishable/anon key.
3. Save. The public anon/publishable key is intended for browser use only when RLS is correctly configured. Never put database passwords, Supabase secret/service-role keys, or AI provider keys in config.js.
4. In Supabase Authentication URL Configuration, add your deployed Cloudflare Pages URL to Site URL and Redirect URLs. For local testing, add the exact local origin you use.

## 4. Deploy to Cloudflare Pages
1. Sign in at https://dash.cloudflare.com/.
2. Go to Workers & Pages → Create application → Pages → Connect to Git.
3. Connect GitHub and select neorayz2020-lab/Ai-business-platform.
4. Use production branch main, build command exit 0, and build output directory / (the repository root, where index.html lives).
5. Deploy. Subsequent commits to the connected branch can trigger deployments.

Cloudflare only applies _headers when deployed on a compatible Cloudflare Pages setup. Verify response headers on the deployed URL; the file alone does not prove they are active.

## 5. Test before real data
- Create a test user, sign out, and sign in again.
- Generate a sample plan and click Save plan to account.
- Test with a second test account and confirm it cannot see the first account's rows.
- Review RLS and logs if anything fails.
- Do not enter real customer information until privacy, retention, recovery, and security controls have been reviewed.

## Current limits
- Email/password signup and login call Supabase Auth only after configuration.
- The planner is still rule-based, not a connected LLM.
- Saving stores a proposed plan and task rows; it does not enqueue or execute them.
- No server-side AI key, background worker, external integration, billing, or autonomous action is active.
