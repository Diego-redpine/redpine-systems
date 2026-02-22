-- Migration 028: Gallery System
-- Photo gallery with albums for business owners
-- Syncs between dashboard and website widget
-- Created: 2026-02-17

-- ============================================================
-- GALLERY ALBUMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_albums_user ON public.gallery_albums(user_id);

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gallery_albums' AND policyname = 'Users manage own gallery albums') THEN
    CREATE POLICY "Users manage own gallery albums" ON public.gallery_albums
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- GALLERY IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  file_size BIGINT,
  file_type TEXT,
  original_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_user ON public.gallery_images(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album ON public.gallery_images(album_id);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gallery_images' AND policyname = 'Users manage own gallery images') THEN
    CREATE POLICY "Users manage own gallery images" ON public.gallery_images
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- GALLERIES (flat entity table for dashboard CRUD)
-- ============================================================
-- The dashboard CRUD handler queries "galleries" as the entity table.
-- This is the simple flat table; gallery_albums/gallery_images above
-- are for the more granular gallery feature.

CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  photos INTEGER DEFAULT 0,
  shared BOOLEAN DEFAULT false,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_galleries_user ON public.galleries(user_id);

ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'galleries' AND policyname = 'Users manage own galleries') THEN
    CREATE POLICY "Users manage own galleries" ON public.galleries
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
