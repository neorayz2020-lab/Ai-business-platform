-- NovaBuild AI monthly billing foundation.
-- No payment credentials are stored here. Only trusted server-side code should write subscription state.
create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_key text not null check (plan_key in ('pro', 'business_ai')),
  provider text not null default 'grow_meshulam' check (provider in ('grow_meshulam')),
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'pending' check (status in ('pending', 'active', 'past_due', 'canceled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index if not exists billing_subscriptions_user_status_idx
  on public.billing_subscriptions (user_id, status);

alter table public.billing_subscriptions enable row level security;

drop policy if exists "Users can read their own billing subscriptions" on public.billing_subscriptions;
create policy "Users can read their own billing subscriptions"
  on public.billing_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Intentionally no INSERT/UPDATE/DELETE policies for browser roles.
-- Subscription state must be written only by trusted server-side functions.

create table if not exists public.billing_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('grow_meshulam')),
  provider_event_id text not null,
  event_type text not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

alter table public.billing_webhook_events enable row level security;
-- Intentionally no policies: webhook event records are server-side only.
