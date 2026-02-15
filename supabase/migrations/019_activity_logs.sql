-- Migration 019: Activity Logs / Audit Trail
-- Tracks all CRUD operations across entities for team accountability

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'move_stage')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  changes JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- user_id = business owner (for RLS scoping)
-- actor_id = who performed the action (owner or staff)
-- actor_name = cached display name for fast rendering

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Business owner and their staff can view activity logs
CREATE POLICY "Users view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = actor_id);

-- Only the system (service role) inserts logs — no direct user inserts
CREATE POLICY "Service role inserts activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);
