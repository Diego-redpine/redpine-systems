-- 030: Packages / Service Catalog + Service-Aware Booking
-- Creates packages table for services/products and adds service_id to appointments

CREATE TABLE IF NOT EXISTS public.packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  category TEXT,
  item_type TEXT NOT NULL DEFAULT 'service' CHECK (item_type IN ('service', 'product', 'package')),
  sku TEXT,
  quantity INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  sort_order INTEGER DEFAULT 0,
  buffer_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_packages_user ON public.packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_type ON public.packages(item_type);
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages(is_active);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'packages' AND policyname = 'Users manage own packages') THEN
    CREATE POLICY "Users manage own packages" ON public.packages
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add service_id on appointments for booking → service link
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.packages(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_service ON public.appointments(service_id);
