-- Migration 014: Reviews and reputation management

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('direct', 'google', 'yelp', 'facebook', 'email_request')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'published', 'hidden', 'replied')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  google_review_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(user_id, rating);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON public.reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow public inserts for customer-submitted reviews
CREATE POLICY "Public can submit reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);
