-- Migration 038: Portal Skeleton + Review Management
-- New tables: review_gate_config, review_requests, review_widgets, portal_notification_preferences
-- Extended: reviews, chat_conversations, portal_sessions

-- ============================================================
-- NEW TABLE: review_gate_config (one per business)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_gate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  star_threshold INTEGER NOT NULL DEFAULT 4 CHECK (star_threshold BETWEEN 1 AND 5),
  positive_platforms JSONB NOT NULL DEFAULT '["google"]'::jsonb,
  negative_message TEXT NOT NULL DEFAULT 'We''re sorry to hear that. Please tell us how we can improve.',
  notify_team BOOLEAN NOT NULL DEFAULT true,
  notify_channels JSONB NOT NULL DEFAULT '["in_app"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE review_gate_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own review gate config"
  ON review_gate_config FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- NEW TABLE: review_requests (outbound review request tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  trigger_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (trigger_type IN ('manual', 'appointment_completed', 'invoice_paid', 'bulk_campaign')),
  channel TEXT NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'sms', 'both')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  review_id UUID,
  drip_step INTEGER NOT NULL DEFAULT 1,
  tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_requests_user ON review_requests(user_id);
CREATE INDEX idx_review_requests_client ON review_requests(client_id);
CREATE INDEX idx_review_requests_token ON review_requests(tracking_token);

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own review requests"
  ON review_requests FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- NEW TABLE: review_widgets (widget display configs)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Review Widget',
  layout_type TEXT NOT NULL DEFAULT 'carousel'
    CHECK (layout_type IN ('list', 'grid', 'carousel', 'badge')),
  min_rating INTEGER NOT NULL DEFAULT 4 CHECK (min_rating BETWEEN 1 AND 5),
  max_reviews INTEGER NOT NULL DEFAULT 10,
  platforms JSONB NOT NULL DEFAULT '["direct", "google", "facebook"]'::jsonb,
  show_ai_summary BOOLEAN NOT NULL DEFAULT false,
  style_overrides JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE review_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own review widgets"
  ON review_widgets FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- NEW TABLE: portal_notification_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS portal_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_reminders BOOLEAN NOT NULL DEFAULT true,
  payment_receipts BOOLEAN NOT NULL DEFAULT true,
  loyalty_updates BOOLEAN NOT NULL DEFAULT true,
  promotions BOOLEAN NOT NULL DEFAULT false,
  messages BOOLEAN NOT NULL DEFAULT true,
  channel_email BOOLEAN NOT NULL DEFAULT true,
  channel_sms BOOLEAN NOT NULL DEFAULT false,
  channel_push BOOLEAN NOT NULL DEFAULT false,
  digest_promotions BOOLEAN NOT NULL DEFAULT true,
  pause_all BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, user_id)
);

ALTER TABLE portal_notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification prefs"
  ON portal_notification_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- EXTEND: reviews table (contact matching + gate + attribution)
-- ============================================================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS platform_review_id TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_gated BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS request_id UUID;

CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);

-- ============================================================
-- EXTEND: chat_conversations (widget source + cookie tracking)
-- ============================================================
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS visitor_cookie_id TEXT;
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'widget_anonymous'
  CHECK (source IN ('widget_anonymous', 'widget_returning', 'portal', 'sms', 'email'));
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_cookie ON chat_conversations(visitor_cookie_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_client ON chat_conversations(client_id);

-- ============================================================
-- EXTEND: portal_sessions (cookie linking for chat merge)
-- ============================================================
ALTER TABLE portal_sessions ADD COLUMN IF NOT EXISTS cookie_id TEXT;
