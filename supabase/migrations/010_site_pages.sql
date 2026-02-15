-- Migration 010: Site pages for ChaiBuilder website builder
-- Stores page blocks as JSONB for the site builder

CREATE TABLE IF NOT EXISTS public.site_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  blocks JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Each user can have one page per slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_pages_user_slug ON public.site_pages(user_id, slug);

-- Fast lookup for published pages
CREATE INDEX IF NOT EXISTS idx_site_pages_published ON public.site_pages(user_id, published) WHERE published = true;

-- RLS
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own pages
CREATE POLICY "Users manage own pages" ON public.site_pages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can read published pages (for site rendering)
CREATE POLICY "Public reads published pages" ON public.site_pages
  FOR SELECT
  USING (published = true);
