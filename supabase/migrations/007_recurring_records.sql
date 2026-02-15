-- Migration 007: Recurring Records
-- Supports recurring invoices and appointments
-- Created: 2026-02-06

-- Add recurrence columns to invoices
alter table invoices add column if not exists recurrence text default 'none';
alter table invoices add column if not exists recurrence_end_date date;
alter table invoices add column if not exists recurring_template_id uuid;
alter table invoices add column if not exists is_recurring_template boolean default false;

-- Add recurrence columns to appointments
alter table appointments add column if not exists recurrence text default 'none';
alter table appointments add column if not exists recurrence_end_date date;
alter table appointments add column if not exists recurring_template_id uuid;
alter table appointments add column if not exists is_recurring_template boolean default false;

-- Recurring generation log — tracks what was generated and when
create table if not exists recurring_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  template_id uuid not null,
  generated_id uuid not null,
  generated_at timestamptz default now()
);

create index if not exists idx_recurring_log_template
  on recurring_log (user_id, entity_type, template_id);

-- RLS
alter table recurring_log enable row level security;

create policy "Users can view own recurring log"
  on recurring_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurring log"
  on recurring_log for insert
  with check (auth.uid() = user_id);

-- Comment: Recurrence values: 'none', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
-- A cron job or API endpoint should call /api/data/recurring/generate periodically
-- to create new instances from templates where is_recurring_template = true
