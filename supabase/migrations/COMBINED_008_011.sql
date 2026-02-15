-- ============================================================
-- COMBINED MIGRATION: 008 through 011
-- Copy this entire script and run it in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================================

-- ============================================================
-- 008: Staff Wizard Fields
-- Adds work model, pay structure, and availability to staff table
-- Adds staff_id FK to invoices for attribution
-- ============================================================

ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS staff_model TEXT CHECK (staff_model IN ('independent', 'employee', 'instructor')),
  ADD COLUMN IF NOT EXISTS pay_type TEXT CHECK (pay_type IN ('commission', 'booth_rental', 'hourly', 'salary', 'per_class')),
  ADD COLUMN IF NOT EXISTS pay_rate_cents INTEGER,
  ADD COLUMN IF NOT EXISTS commission_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id);

CREATE INDEX IF NOT EXISTS idx_staff_model ON public.staff(staff_model);

-- ============================================================
-- 009: Settings Fields
-- Adds profile columns for the Settings tab
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hours JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT TRUE;

-- ============================================================
-- 010: Site Pages (ChaiBuilder Website Builder)
-- Stores page blocks as JSONB for the drag-and-drop site builder
-- ============================================================

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_site_pages_user_slug ON public.site_pages(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_site_pages_published ON public.site_pages(user_id, published) WHERE published = true;

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pages" ON public.site_pages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public reads published pages" ON public.site_pages
  FOR SELECT
  USING (published = true);

-- ============================================================
-- 011: Payment Connections (Stripe Connect + Square OAuth)
-- Stores encrypted OAuth tokens for payment processors
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe_connect', 'square')),
  account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_connections_user_provider
  ON public.payment_connections(user_id, provider);

ALTER TABLE public.payment_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own payment connections" ON public.payment_connections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Done! All 4 migrations applied.
-- ============================================================
