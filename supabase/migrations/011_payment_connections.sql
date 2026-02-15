-- Migration 011: Payment processor connections
-- Stores OAuth connections for Stripe Connect and Square

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

-- Each user can have one connection per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_connections_user_provider
  ON public.payment_connections(user_id, provider);

-- RLS
ALTER TABLE public.payment_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own payment connections" ON public.payment_connections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
