-- Migration 026: AI Agents Marketplace
-- Agent catalog, user subscriptions, and activity logs

CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL,
  icon TEXT DEFAULT 'bot',
  capabilities TEXT[] DEFAULT '{}',
  configuration_schema JSONB DEFAULT '{}'::jsonb,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  install_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the initial 5 agents
INSERT INTO public.ai_agents (slug, name, description, long_description, category, icon, capabilities, monthly_price_cents, is_featured, tags) VALUES
('receptionist', 'AI Receptionist', 'Auto-responds to booking requests and manages your schedule 24/7.', 'Never miss a booking again. The AI Receptionist monitors incoming booking requests, checks your availability in real-time, confirms appointments, sends reminders, and handles rescheduling — all without any manual intervention. Works with your existing calendar and notification settings.', 'communication', 'phone', ARRAY['auto_booking', 'availability_check', 'send_reminders', 'handle_reschedule', 'after_hours_response'], 1500, true, ARRAY['booking', 'scheduling', 'communication']),
('content_writer', 'Content Writer', 'Generates social media posts, blog articles, and marketing copy tailored to your brand.', 'Keep your social media fresh without the effort. The Content Writer learns your brand voice, generates platform-specific posts (Instagram, Facebook, Twitter, LinkedIn), writes blog articles, creates email campaigns, and suggests trending hashtags. Schedule a week of content in minutes.', 'marketing', 'edit', ARRAY['social_posts', 'blog_articles', 'email_campaigns', 'hashtag_suggestions', 'brand_voice_learning'], 2000, true, ARRAY['marketing', 'social media', 'content']),
('review_manager', 'Review Manager', 'Monitors reviews across platforms and crafts professional responses automatically.', 'Stay on top of your online reputation. The Review Manager watches Google, Yelp, and Facebook for new reviews, drafts personalized responses (warm for positives, empathetic for negatives), flags critical issues for your attention, and tracks sentiment trends over time. Respond to reviews in seconds, not hours.', 'reputation', 'star', ARRAY['review_monitoring', 'auto_responses', 'sentiment_analysis', 'platform_sync', 'alert_critical'], 1000, true, ARRAY['reviews', 'reputation', 'customer service']),
('bookkeeper', 'AI Bookkeeper', 'Categorizes expenses, reconciles invoices, and prepares financial summaries.', 'Stop drowning in receipts. The AI Bookkeeper automatically categorizes transactions, matches invoices to payments, flags discrepancies, generates monthly P&L summaries, and prepares data for tax time. Syncs with QuickBooks for seamless accounting.', 'finance', 'dollar', ARRAY['expense_categorization', 'invoice_matching', 'monthly_reports', 'tax_prep', 'quickbooks_sync'], 2500, false, ARRAY['accounting', 'invoices', 'finance']),
('route_planner', 'Route Planner', 'Optimizes delivery routes and service schedules for field teams.', 'Save hours and fuel costs every week. The Route Planner takes your daily appointments and delivery stops, optimizes the order for minimum travel time, accounts for time windows and priority stops, and sends turn-by-turn directions to your team. Handles last-minute changes and re-routes automatically.', 'operations', 'map', ARRAY['route_optimization', 'time_windows', 'team_dispatch', 'real_time_reroute', 'fuel_tracking'], 3000, false, ARRAY['delivery', 'logistics', 'field service'])
ON CONFLICT (slug) DO NOTHING;

-- User agent subscriptions
CREATE TABLE IF NOT EXISTS public.agent_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  stripe_subscription_item_id TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_subs_user ON public.agent_subscriptions(user_id);

ALTER TABLE public.agent_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent subscriptions" ON public.agent_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Agent activity log
CREATE TABLE IF NOT EXISTS public.agent_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_activity_user ON public.agent_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent ON public.agent_activity(agent_id);

ALTER TABLE public.agent_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own agent activity" ON public.agent_activity
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
