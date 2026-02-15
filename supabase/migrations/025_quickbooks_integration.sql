-- Migration 025: QuickBooks Online Integration
-- OAuth tokens, sync state, and entity mappings

CREATE TABLE IF NOT EXISTS public.quickbooks_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  realm_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  company_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'success')),
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_connections_user ON public.quickbooks_connections(user_id);

ALTER TABLE public.quickbooks_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own QB connections" ON public.quickbooks_connections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sync log for tracking individual sync operations
CREATE TABLE IF NOT EXISTS public.quickbooks_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('push', 'pull')),
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_qb_sync_log_user ON public.quickbooks_sync_log(user_id);

ALTER TABLE public.quickbooks_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sync logs" ON public.quickbooks_sync_log
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Entity ID mappings (Red Pine ID <-> QuickBooks ID)
CREATE TABLE IF NOT EXISTS public.quickbooks_entity_map (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  local_id UUID NOT NULL,
  qb_id TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, local_id)
);

CREATE INDEX IF NOT EXISTS idx_qb_entity_map_lookup ON public.quickbooks_entity_map(user_id, entity_type, qb_id);

ALTER TABLE public.quickbooks_entity_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entity mappings" ON public.quickbooks_entity_map
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
