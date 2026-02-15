-- Migration 013: Forms and form submissions
-- Forms builder: custom intake forms, surveys, contact forms

-- Forms table — stores form definitions with JSON fields
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'intake' CHECK (type IN ('intake', 'survey', 'contact', 'lead_capture', 'medical', 'feedback', 'booking', 'custom')),
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  submissions INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forms_user ON public.forms(user_id);
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own forms" ON public.forms
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Form submissions table — stores filled-out responses
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- the form owner (for RLS)
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user ON public.form_submissions(user_id);
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own form submissions" ON public.form_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow public inserts (unauthenticated form submissions)
CREATE POLICY "Public can submit forms" ON public.form_submissions
  FOR INSERT WITH CHECK (true);
