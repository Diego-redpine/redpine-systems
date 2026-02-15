-- Migration 005: Record Attachments
-- Generic file attachment system for any entity type
-- Created: 2026-02-06

create table if not exists record_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  record_id text not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz default now()
);

-- Composite index for fast lookups by user + entity + record
create index if not exists idx_record_attachments_lookup
  on record_attachments (user_id, entity_type, record_id);

-- RLS
alter table record_attachments enable row level security;

create policy "Users can view own attachments"
  on record_attachments for select
  using (auth.uid() = user_id);

create policy "Users can insert own attachments"
  on record_attachments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own attachments"
  on record_attachments for delete
  using (auth.uid() = user_id);
