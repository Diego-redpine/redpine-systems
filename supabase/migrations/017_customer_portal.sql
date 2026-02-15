-- Migration 017: Customer Portal sessions

CREATE TABLE IF NOT EXISTS public.portal_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON public.portal_sessions(token);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_client ON public.portal_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON public.portal_sessions(expires_at);

-- No RLS — accessed via service role key from API routes only
-- (portal sessions are managed server-side, never queried client-side)
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.portal_sessions
  FOR ALL USING (true) WITH CHECK (true);
