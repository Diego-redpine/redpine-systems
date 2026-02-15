-- Migration 021: Social Media Posts
-- Stores scheduled social media posts with platform targeting and analytics

CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_title TEXT NOT NULL,
  content TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'google_business', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  image_urls JSONB DEFAULT '[]'::jsonb,
  hashtags TEXT[] DEFAULT '{}',
  engagement JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "reach": 0}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_media_posts_user ON public.social_media_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON public.social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled ON public.social_media_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON public.social_media_posts(platform);

ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own social media posts" ON public.social_media_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
