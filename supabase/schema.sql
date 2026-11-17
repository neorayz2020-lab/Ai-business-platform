-- NovaBuild AI starter schema for Supabase PostgreSQL.
-- Apply in the Supabase SQL Editor after creating a new project.
begin;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null check (char_length(goal) between 1 and 1200),
  priority text not null default 'balanced' check (priority in ('balanced','speed','quality','budget')),
  execution_policy text not null default 'approval' check (execution_policy in ('approval','drafts')),
  plan jsonb not null default '{}'::jsonb,
  status text not null default 'planned' check (status in ('planned','queued','running','paused','completed','failed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null check (position > 0),
  agent_name text not null check (char_length(agent_name) between 1 and 120),
  title text not null check (char_length(title) between 1 and 240),
  detail text not null default '' check (char_length(detail) <= 4000),
  risk_label text not null default 'Draft only' check (char_length(risk_label) <= 160),
  status text not null default 'proposed' check (status in ('proposed','queued','running','needs_approval','completed','failed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, position)
);
create index if not exists agent_runs_user_created_idx on public.agent_runs(user_id, created_at desc);
create index if not exists agent_tasks_user_run_idx on public.agent_tasks(user_id, run_id, position);
alter table public.profiles enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_tasks enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Users manage own agent runs" on public.agent_runs;
create policy "Users manage own agent runs" on public.agent_runs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own agent tasks" on public.agent_tasks;
create policy "Users manage own agent tasks" on public.agent_tasks for all to authenticated
using ((select auth.uid()) = user_id and exists (select 1 from public.agent_runs r where r.id = run_id and r.user_id = (select auth.uid())))
with check ((select auth.uid()) = user_id and exists (select 1 from public.agent_runs r where r.id = run_id and r.user_id = (select auth.uid())));
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.agent_runs to authenticated;
grant select, insert, update, delete on public.agent_tasks to authenticated;
revoke all on public.profiles from anon;
revoke all on public.agent_runs from anon;
revoke all on public.agent_tasks from anon;
create or replace function public.handle_new_user_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute procedure public.handle_new_user_profile();
commit;
