-- Migration 018: Custom Fields system

-- Field definitions table — stores user-defined field schemas per entity
CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN (
    'text', 'number', 'date', 'email', 'phone', 'url',
    'dropdown', 'checkbox', 'textarea', 'currency'
  )),
  is_required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,  -- for dropdown options
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, field_key)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_user_entity
  ON public.custom_field_definitions(user_id, entity_type);
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own field definitions" ON public.custom_field_definitions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add custom_fields JSONB to all entity tables that don't already have it
-- (clients already has it from migration 001)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.waivers ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
