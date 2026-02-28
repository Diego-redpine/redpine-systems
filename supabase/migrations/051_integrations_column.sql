-- Migration 051: Add integrations JSONB column to configs
-- Stores per-business integration credentials (Twilio, etc.)

ALTER TABLE public.configs
  ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.configs.integrations IS 'JSONB storage for integration credentials (twilio, etc.)';
