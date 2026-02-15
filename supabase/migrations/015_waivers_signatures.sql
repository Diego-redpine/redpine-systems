-- Migration 015: Waivers and digital signatures

-- Waivers table
CREATE TABLE IF NOT EXISTS public.waivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'declined')),
  client TEXT,
  client_email TEXT,
  date_signed TIMESTAMPTZ,
  expiry TIMESTAMPTZ,
  signature_data TEXT,
  signature_image_url TEXT,
  stage_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waivers_user ON public.waivers(user_id);
CREATE INDEX IF NOT EXISTS idx_waivers_status ON public.waivers(user_id, status);
ALTER TABLE public.waivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waivers" ON public.waivers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Signatures table (tracks individual signature events across documents/waivers)
CREATE TABLE IF NOT EXISTS public.signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document TEXT NOT NULL,
  document_id UUID,
  signer TEXT NOT NULL,
  signer_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'declined', 'expired')),
  signature_data TEXT,
  signature_image_url TEXT,
  signed_at TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'digital' CHECK (method IN ('digital', 'in_person', 'email')),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signatures_user ON public.signatures(user_id);
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signatures" ON public.signatures
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow public inserts for remote signing (via email link)
CREATE POLICY "Public can submit signatures" ON public.signatures
  FOR INSERT WITH CHECK (true);

-- Allow public updates for signing completion
CREATE POLICY "Public can update pending signatures" ON public.signatures
  FOR UPDATE USING (status = 'pending') WITH CHECK (status IN ('completed', 'declined'));
