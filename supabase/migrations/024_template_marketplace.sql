-- Migration 024: Template Marketplace
-- Users share and clone dashboard configurations

CREATE TABLE IF NOT EXISTS public.marketplace_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  business_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  colors JSONB DEFAULT '{}'::jsonb,
  tabs JSONB DEFAULT '[]'::jsonb,
  preview_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  clone_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_templates_category ON public.marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_business_type ON public.marketplace_templates(business_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_author ON public.marketplace_templates(author_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_featured ON public.marketplace_templates(is_featured) WHERE is_featured = TRUE;

-- Published templates are readable by everyone; authors manage their own
ALTER TABLE public.marketplace_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published templates" ON public.marketplace_templates
  FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Authors manage own templates" ON public.marketplace_templates
  FOR ALL USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Template ratings
CREATE TABLE IF NOT EXISTS public.template_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, user_id)
);

ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ratings" ON public.template_ratings
  FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own ratings" ON public.template_ratings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
