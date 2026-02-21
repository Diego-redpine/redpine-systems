-- Migration 028: Integration connections table + appointment sync fields
-- Safe to re-run (all IF NOT EXISTS / IF EXISTS)

-- Integration connections for Google, Notion, Outlook
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,  -- 'google', 'notion', 'outlook'
  access_token TEXT NOT NULL,  -- AES-256-GCM encrypted
  refresh_token TEXT,  -- encrypted, nullable
  token_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',  -- workspace_name, email, etc.
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own integrations"
    ON integration_connections FOR ALL
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Appointments: add external sync fields for calendar sync dedup
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_external
  ON appointments (user_id, external_id)
  WHERE external_id IS NOT NULL;
