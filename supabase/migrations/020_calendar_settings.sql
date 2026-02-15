-- Migration 020: Calendar Settings + Staff Scheduling
-- Stores per-calendar configuration for booking types, durations, assignment modes

CREATE TABLE IF NOT EXISTS public.calendar_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Calendar',
  calendar_type TEXT NOT NULL DEFAULT 'one_on_one' CHECK (calendar_type IN ('one_on_one', 'group', 'shift')),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  max_per_day INTEGER DEFAULT NULL,
  max_group_size INTEGER DEFAULT NULL,
  assignment_mode TEXT NOT NULL DEFAULT 'manual' CHECK (assignment_mode IN ('round_robin', 'manual', 'direct_booking')),
  availability JSONB DEFAULT '{}'::jsonb,
  staff_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_settings_user ON public.calendar_settings(user_id);
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calendar settings" ON public.calendar_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add staff_id to appointments for staff assignment tracking
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS calendar_type TEXT DEFAULT 'one_on_one';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS color_primary TEXT;

CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id);

-- Round-robin tracking: stores the last assigned staff index per calendar
ALTER TABLE public.calendar_settings ADD COLUMN IF NOT EXISTS last_assigned_index INTEGER DEFAULT 0;
