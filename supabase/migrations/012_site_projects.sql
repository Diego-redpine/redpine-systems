-- Migration 012: Site projects for grouping pages into website/link-tree projects
-- Each user can have multiple projects, each containing multiple pages

CREATE TABLE IF NOT EXISTS public.site_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('website', 'link_tree')),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_projects_user ON public.site_projects(user_id);

ALTER TABLE public.site_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projects" ON public.site_projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Link pages to projects (nullable — existing pages stay unlinked)
ALTER TABLE public.site_pages ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.site_projects(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_site_pages_project ON public.site_pages(project_id);
