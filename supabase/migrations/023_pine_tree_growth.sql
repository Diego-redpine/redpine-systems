-- Migration 023: Pine Tree Growth System
-- Gamification — tree grows as the business grows on the platform

CREATE TABLE IF NOT EXISTS public.growth_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 4),
  points INTEGER NOT NULL DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  reviews_collected INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  milestones_reached TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_tracking_user ON public.growth_tracking(user_id);

ALTER TABLE public.growth_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own growth tracking" ON public.growth_tracking
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
