-- Migration 006: Record Links / Relationships
-- Allows linking any two records across entity types
-- Created: 2026-02-06

create table if not exists record_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_entity text not null,
  source_id text not null,
  target_entity text not null,
  target_id text not null,
  link_type text not null default 'related',
  created_at timestamptz default now()
);

-- Composite indexes for bidirectional lookups
create index if not exists idx_record_links_source
  on record_links (user_id, source_entity, source_id);

create index if not exists idx_record_links_target
  on record_links (user_id, target_entity, target_id);

-- RLS
alter table record_links enable row level security;

create policy "Users can view own links"
  on record_links for select
  using (auth.uid() = user_id);

create policy "Users can insert own links"
  on record_links for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own links"
  on record_links for delete
  using (auth.uid() = user_id);
