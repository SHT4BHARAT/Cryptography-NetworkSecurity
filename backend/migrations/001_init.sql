-- backend/migrations/001_init.sql
-- Full schema + Row-Level Security for Smart Expense Analyzer.
-- Run in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  monthly_income numeric(12,2) default null,
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'checking',
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  date date not null,
  amount numeric(12,2) not null,
  description text not null,
  category text not null default 'Uncategorized',
  dedupe_hash text,
  raw text,
  created_at timestamptz not null default now()
);
create index trx_user_date_idx on public.transactions(user_id, date desc);
create unique index trx_dedupe_idx on public.transactions(user_id, dedupe_hash) where dedupe_hash is not null;

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  month date not null,
  amount numeric(12,2) not null,
  unique (user_id, category, month)
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  saved_amount numeric(12,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant text not null,
  amount numeric(12,2) not null,
  cadence text not null default 'monthly',
  last_detected date not null,
  active boolean not null default true,
  notes text,
  unique (user_id, merchant, amount)
);

create table public.health_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  score int not null,
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, month)
);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.subscriptions enable row level security;
alter table public.health_snapshots enable row level security;

create policy "profiles own" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "accounts own" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions own" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets own" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals own" on public.savings_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions own" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "snapshots own" on public.health_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row for every new signup so the income fallback
-- (profiles.monthly_income) is always reachable before any transaction exists.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'fullName', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: the trigger only fires for signups from here on. Any account created
-- before this migration ran has no profiles row yet — cover it once, idempotently.
insert into public.profiles (user_id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'fullName', '')
from auth.users
on conflict (user_id) do nothing;
