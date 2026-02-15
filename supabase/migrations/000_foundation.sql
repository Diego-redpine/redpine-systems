-- RED PINE OS - Supabase Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/gjnureojhgspblvmqvzx/sql)

-- ============================================
-- PART 1: PROFILES TABLE
-- ============================================

-- PROFILES TABLE (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  business_name text,
  subdomain text unique,
  plan text default 'free',  -- 'free' | 'active' | 'cancelled'
  stripe_customer_id text,
  stripe_subscription_id text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AUTO-CREATE PROFILE ON SIGNUP
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Users see own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- PART 2: CONFIGS TABLE
-- ============================================

-- CONFIGS TABLE (replaces JSON files)
create table public.configs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  business_name text,
  business_type text,
  tabs jsonb not null default '[]',
  colors jsonb default '{}',
  nav_style text default 'sidebar',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for configs
alter table public.configs enable row level security;

create policy "Users see own configs"
  on public.configs for select
  using (auth.uid() = user_id);

create policy "Users update own configs"
  on public.configs for update
  using (auth.uid() = user_id);

create policy "Users insert own configs"
  on public.configs for insert
  with check (auth.uid() = user_id);

create policy "Anon configs readable"
  on public.configs for select
  using (user_id is null);

-- Allow anonymous inserts (for onboarding before signup)
create policy "Anon configs insertable"
  on public.configs for insert
  with check (user_id is null);

-- ============================================
-- PART 3: CONFIG VERSIONS TABLE (F6 - Undo Safety Net)
-- ============================================

-- CONFIG_VERSIONS TABLE (stores snapshots for undo functionality)
create table public.config_versions (
  id uuid default gen_random_uuid() primary key,
  config_id uuid references public.configs(id) on delete cascade not null,
  version_number integer not null,
  tabs_snapshot jsonb not null,
  colors_snapshot jsonb,
  created_at timestamptz default now()
);

-- Index for fast version lookups (newest first)
create index idx_config_versions_lookup
  on public.config_versions (config_id, version_number desc);

-- RLS for config_versions
alter table public.config_versions enable row level security;

-- SELECT: users can read versions for configs they own
create policy "Users read own config versions"
  on public.config_versions for select
  using (
    exists (
      select 1 from public.configs
      where configs.id = config_versions.config_id
      and configs.user_id = auth.uid()
    )
  );

-- INSERT: users can create versions for configs they own
create policy "Users insert own config versions"
  on public.config_versions for insert
  with check (
    exists (
      select 1 from public.configs
      where configs.id = config_versions.config_id
      and configs.user_id = auth.uid()
    )
  );

-- DELETE: users can delete versions for configs they own
create policy "Users delete own config versions"
  on public.config_versions for delete
  using (
    exists (
      select 1 from public.configs
      where configs.id = config_versions.config_id
      and configs.user_id = auth.uid()
    )
  );

-- No UPDATE policy - versions are immutable snapshots

-- ============================================
-- PART 4: F4 TABLE EXTENSIONS
-- ============================================
-- Add missing columns to B5 tables for F4 CRUD API

-- Clients: add type and status columns
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'client';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Appointments: add all_day column
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT FALSE;

-- Tasks: update status default and add cancelled option
-- (status column exists, just document the valid values: pending, in_progress, completed, cancelled)

-- Messages: add subject column for email-style messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS subject TEXT;

-- Documents: ensure updated_at exists
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
