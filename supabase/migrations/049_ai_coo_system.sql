-- ============================================================
-- 049: AI COO — Memory, Personality, Autonomy, Agent Events
-- ============================================================

-- COO Memory Journal
CREATE TABLE IF NOT EXISTS coo_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('goal', 'preference', 'client_note', 'milestone', 'decision', 'concern', 'idea')),
  content TEXT NOT NULL,
  confidence FLOAT DEFAULT 1.0,
  superseded_by UUID REFERENCES coo_memories(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coo_memories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "owner_coo_memories" ON coo_memories
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_coo_memories_user_active
  ON coo_memories(user_id, created_at DESC)
  WHERE superseded_by IS NULL;

-- COO personality + autonomy toggles on configs
ALTER TABLE configs ADD COLUMN IF NOT EXISTS coo_personality TEXT DEFAULT 'friendly';
ALTER TABLE configs ADD COLUMN IF NOT EXISTS coo_permissions JSONB DEFAULT '{
  "cancellation_rebooking": "asks_first",
  "review_requests": "asks_first",
  "appointment_reminders": "handles_it",
  "client_reminders": "asks_first",
  "invoice_generation": "asks_first",
  "waitlist_offers": "asks_first"
}'::jsonb;

-- Agent Activity Log
CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL DEFAULT 'coo',
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'awaiting_approval')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "owner_agent_activity" ON agent_activity
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_agent_activity_user
  ON agent_activity(user_id, created_at DESC);

-- Agent subscriptions
CREATE TABLE IF NOT EXISTS agent_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  stripe_subscription_item_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  created_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(user_id, agent_id)
);

ALTER TABLE agent_subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "owner_agent_subs" ON agent_subscriptions
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
