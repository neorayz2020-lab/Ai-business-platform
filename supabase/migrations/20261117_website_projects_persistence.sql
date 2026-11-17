-- Persist each user's generated website drafts. Additive migration; no existing data is changed.
create table if not exists public.website_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled website' check (char_length(name) between 1 and 120),
  site_type text not null default 'Business website' check (char_length(site_type) <= 60),
  brief text not null default '' check (char_length(brief) <= 1800),
  contact_url text not null default '' check (char_length(contact_url) <= 500),
  settings jsonb not null default '{}'::jsonb,
  html text not null default '' check (char_length(html) <= 500000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists website_projects_user_updated_idx on public.website_projects (user_id, updated_at desc);
alter table public.website_projects enable row level security;
drop policy if exists "Users can read their own website projects" on public.website_projects;
create policy "Users can read their own website projects" on public.website_projects for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create their own website projects" on public.website_projects;
create policy "Users can create their own website projects" on public.website_projects for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their own website projects" on public.website_projects;
create policy "Users can update their own website projects" on public.website_projects for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own website projects" on public.website_projects;
create policy "Users can delete their own website projects" on public.website_projects for delete to authenticated using (auth.uid() = user_id);
