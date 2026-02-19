-- ============================================================
-- RED PINE OS — CONSOLIDATED MIGRATIONS (012-027 + Portal)
-- ============================================================
-- SAFE TO RE-RUN: All statements use IF NOT EXISTS / IF EXISTS
-- LAST APPLIED BY DIEGO: COMBINED_008_011.sql (migrations 1-11)
-- THIS FILE: Everything from migration 012 onward
--
-- HOW TO USE:
-- 1. Open Supabase SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- 4. If you run it again later (after new features), it won't break
-- ============================================================


-- ============================================================
-- 012: SITE PROJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('website', 'link_tree', 'portal')),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_projects_user ON public.site_projects(user_id);

ALTER TABLE public.site_projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_projects' AND policyname = 'Users manage own projects') THEN
    CREATE POLICY "Users manage own projects" ON public.site_projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Link pages to projects
ALTER TABLE public.site_pages ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.site_projects(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_site_pages_project ON public.site_pages(project_id);

-- Ensure portal project type is allowed (in case table was created with old constraint)
ALTER TABLE public.site_projects DROP CONSTRAINT IF EXISTS site_projects_project_type_check;
ALTER TABLE public.site_projects ADD CONSTRAINT site_projects_project_type_check
  CHECK (project_type IN ('website', 'link_tree', 'portal'));


-- ============================================================
-- 013: FORMS + FORM SUBMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'intake' CHECK (type IN ('intake', 'survey', 'contact', 'lead_capture', 'medical', 'feedback', 'booking', 'custom')),
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  submissions INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forms_user ON public.forms(user_id);
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forms' AND policyname = 'Users manage own forms') THEN
    CREATE POLICY "Users manage own forms" ON public.forms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user ON public.form_submissions(user_id);
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_submissions' AND policyname = 'Users view own form submissions') THEN
    CREATE POLICY "Users view own form submissions" ON public.form_submissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_submissions' AND policyname = 'Public can submit forms') THEN
    CREATE POLICY "Public can submit forms" ON public.form_submissions FOR INSERT WITH CHECK (true);
  END IF;
END $$;


-- ============================================================
-- 013b: PORTAL SUPPORT (parent_email on clients)
-- ============================================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS parent_email TEXT;
CREATE INDEX IF NOT EXISTS idx_clients_parent_email ON public.clients(parent_email);


-- ============================================================
-- 014: REVIEWS
-- ============================================================

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users manage own reviews') THEN
    CREATE POLICY "Users manage own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Public can submit reviews') THEN
    CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);
  END IF;
END $$;


-- ============================================================
-- 015: WAIVERS + SIGNATURES
-- ============================================================

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waivers' AND policyname = 'Users manage own waivers') THEN
    CREATE POLICY "Users manage own waivers" ON public.waivers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'signatures' AND policyname = 'Users manage own signatures') THEN
    CREATE POLICY "Users manage own signatures" ON public.signatures FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'signatures' AND policyname = 'Public can submit signatures') THEN
    CREATE POLICY "Public can submit signatures" ON public.signatures FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'signatures' AND policyname = 'Public can update pending signatures') THEN
    CREATE POLICY "Public can update pending signatures" ON public.signatures FOR UPDATE USING (status = 'pending') WITH CHECK (status IN ('completed', 'declined'));
  END IF;
END $$;


-- ============================================================
-- 016: AUTOMATIONS / WORKFLOWS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN (
    'manual', 'record_created', 'record_updated', 'record_deleted',
    'field_changed', 'status_changed', 'schedule', 'form_submitted'
  )),
  trigger_config JSONB DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'draft')),
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  stage_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflows_user ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON public.workflows(user_id, trigger_type);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'Users manage own workflows') THEN
    CREATE POLICY "Users manage own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_event TEXT,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  actions_completed INTEGER DEFAULT 0,
  actions_total INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON public.workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user ON public.workflow_runs(user_id);
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_runs' AND policyname = 'Users view own workflow runs') THEN
    CREATE POLICY "Users view own workflow runs" ON public.workflow_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 017: CUSTOMER PORTAL SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portal_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  config_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON public.portal_sessions(token);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_client ON public.portal_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON public.portal_sessions(expires_at);

ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portal_sessions' AND policyname = 'Service role full access') THEN
    CREATE POLICY "Service role full access" ON public.portal_sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- In case table was created without metadata/config_id columns
ALTER TABLE public.portal_sessions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.portal_sessions ADD COLUMN IF NOT EXISTS config_id UUID;


-- ============================================================
-- 018: CUSTOM FIELDS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN (
    'text', 'number', 'date', 'email', 'phone', 'url',
    'dropdown', 'checkbox', 'textarea', 'currency'
  )),
  is_required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, field_key)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_user_entity ON public.custom_field_definitions(user_id, entity_type);
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_field_definitions' AND policyname = 'Users manage own field definitions') THEN
    CREATE POLICY "Users manage own field definitions" ON public.custom_field_definitions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add custom_fields JSONB to entity tables
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.waivers ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;


-- ============================================================
-- 019: ACTIVITY LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'move_stage')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  changes JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Users view own activity logs') THEN
    CREATE POLICY "Users view own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id OR auth.uid() = actor_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Service role inserts activity logs') THEN
    CREATE POLICY "Service role inserts activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
  END IF;
END $$;


-- ============================================================
-- 020: CALENDAR SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendar_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Calendar',
  calendar_type TEXT NOT NULL DEFAULT 'one_on_one' CHECK (calendar_type IN ('one_on_one', 'group', 'shift')),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  max_per_day INTEGER DEFAULT NULL,
  max_group_size INTEGER DEFAULT NULL,
  assignment_mode TEXT NOT NULL DEFAULT 'manual' CHECK (assignment_mode IN ('round_robin', 'manual', 'direct_booking')),
  availability JSONB DEFAULT '{}'::jsonb,
  staff_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_assigned_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_settings_user ON public.calendar_settings(user_id);
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_settings' AND policyname = 'Users manage own calendar settings') THEN
    CREATE POLICY "Users manage own calendar settings" ON public.calendar_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS staff_id UUID;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS calendar_type TEXT DEFAULT 'one_on_one';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS color_primary TEXT;
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id);


-- ============================================================
-- 021: SOCIAL MEDIA POSTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_title TEXT NOT NULL,
  content TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'google_business', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  image_urls JSONB DEFAULT '[]'::jsonb,
  hashtags TEXT[] DEFAULT '{}',
  engagement JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "reach": 0}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_media_posts_user ON public.social_media_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON public.social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled ON public.social_media_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON public.social_media_posts(platform);
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_media_posts' AND policyname = 'Users manage own social media posts') THEN
    CREATE POLICY "Users manage own social media posts" ON public.social_media_posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 022: LIVE CHAT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_name TEXT DEFAULT 'Visitor',
  visitor_email TEXT,
  visitor_page TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'missed')),
  assigned_staff_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users manage own chat conversations') THEN
    CREATE POLICY "Users manage own chat conversations" ON public.chat_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'staff', 'system')),
  sender_name TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users manage own chat messages') THEN
    CREATE POLICY "Users manage own chat messages" ON public.chat_messages FOR ALL
      USING (EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = chat_messages.conversation_id AND user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = chat_messages.conversation_id AND user_id = auth.uid()));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.chat_canned_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  shortcut TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_canned_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_canned_responses' AND policyname = 'Users manage own canned responses') THEN
    CREATE POLICY "Users manage own canned responses" ON public.chat_canned_responses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 023: PINE TREE GROWTH GAMIFICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.growth_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 4),
  points INTEGER NOT NULL DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  reviews_collected INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  milestones_reached TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_tracking_user ON public.growth_tracking(user_id);
ALTER TABLE public.growth_tracking ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_tracking' AND policyname = 'Users manage own growth tracking') THEN
    CREATE POLICY "Users manage own growth tracking" ON public.growth_tracking FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 024: TEMPLATE MARKETPLACE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.marketplace_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  business_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  colors JSONB DEFAULT '{}'::jsonb,
  tabs JSONB DEFAULT '[]'::jsonb,
  preview_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  clone_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_templates_category ON public.marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_business_type ON public.marketplace_templates(business_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_author ON public.marketplace_templates(author_id);
ALTER TABLE public.marketplace_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_templates' AND policyname = 'Anyone can view published templates') THEN
    CREATE POLICY "Anyone can view published templates" ON public.marketplace_templates FOR SELECT USING (is_published = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_templates' AND policyname = 'Authors manage own templates') THEN
    CREATE POLICY "Authors manage own templates" ON public.marketplace_templates FOR ALL USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.template_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, user_id)
);

ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_ratings' AND policyname = 'Anyone can view ratings') THEN
    CREATE POLICY "Anyone can view ratings" ON public.template_ratings FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_ratings' AND policyname = 'Users manage own ratings') THEN
    CREATE POLICY "Users manage own ratings" ON public.template_ratings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 025: QUICKBOOKS INTEGRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quickbooks_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  realm_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  company_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'success')),
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qb_connections_user ON public.quickbooks_connections(user_id);
ALTER TABLE public.quickbooks_connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quickbooks_connections' AND policyname = 'Users manage own QB connections') THEN
    CREATE POLICY "Users manage own QB connections" ON public.quickbooks_connections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.quickbooks_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('push', 'pull')),
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_qb_sync_log_user ON public.quickbooks_sync_log(user_id);
ALTER TABLE public.quickbooks_sync_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quickbooks_sync_log' AND policyname = 'Users view own sync logs') THEN
    CREATE POLICY "Users view own sync logs" ON public.quickbooks_sync_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.quickbooks_entity_map (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  local_id UUID NOT NULL,
  qb_id TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, local_id)
);

CREATE INDEX IF NOT EXISTS idx_qb_entity_map_lookup ON public.quickbooks_entity_map(user_id, entity_type, qb_id);
ALTER TABLE public.quickbooks_entity_map ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quickbooks_entity_map' AND policyname = 'Users manage own entity mappings') THEN
    CREATE POLICY "Users manage own entity mappings" ON public.quickbooks_entity_map FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 026: AI AGENTS
-- ============================================================

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

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_agents' AND policyname = 'Anyone can view active agents') THEN
    CREATE POLICY "Anyone can view active agents" ON public.ai_agents FOR SELECT USING (is_active = TRUE);
  END IF;
END $$;

-- Seed initial agents
INSERT INTO public.ai_agents (slug, name, description, long_description, category, icon, capabilities, monthly_price_cents, is_featured, tags) VALUES
('receptionist', 'AI Receptionist', 'Auto-responds to booking requests and manages your schedule 24/7.', 'Never miss a booking again. The AI Receptionist monitors incoming booking requests, checks your availability in real-time, confirms appointments, sends reminders, and handles rescheduling.', 'communication', 'phone', ARRAY['auto_booking', 'availability_check', 'send_reminders', 'handle_reschedule', 'after_hours_response'], 1500, true, ARRAY['booking', 'scheduling', 'communication']),
('content_writer', 'Content Writer', 'Generates social media posts, blog articles, and marketing copy tailored to your brand.', 'Keep your social media fresh without the effort. The Content Writer learns your brand voice, generates platform-specific posts, writes blog articles, creates email campaigns, and suggests trending hashtags.', 'marketing', 'edit', ARRAY['social_posts', 'blog_articles', 'email_campaigns', 'hashtag_suggestions', 'brand_voice_learning'], 2000, true, ARRAY['marketing', 'social media', 'content']),
('review_manager', 'Review Manager', 'Monitors reviews across platforms and crafts professional responses automatically.', 'Stay on top of your online reputation. The Review Manager watches Google, Yelp, and Facebook for new reviews, drafts personalized responses, flags critical issues, and tracks sentiment trends.', 'reputation', 'star', ARRAY['review_monitoring', 'auto_responses', 'sentiment_analysis', 'platform_sync', 'alert_critical'], 1000, true, ARRAY['reviews', 'reputation', 'customer service']),
('bookkeeper', 'AI Bookkeeper', 'Categorizes expenses, reconciles invoices, and prepares financial summaries.', 'Stop drowning in receipts. The AI Bookkeeper automatically categorizes transactions, matches invoices to payments, flags discrepancies, and generates monthly P&L summaries.', 'finance', 'dollar', ARRAY['expense_categorization', 'invoice_matching', 'monthly_reports', 'tax_prep', 'quickbooks_sync'], 2500, false, ARRAY['accounting', 'invoices', 'finance']),
('route_planner', 'Route Planner', 'Optimizes delivery routes and service schedules for field teams.', 'Save hours and fuel costs every week. The Route Planner takes your daily appointments and delivery stops, optimizes the order for minimum travel time, accounts for time windows and priority stops.', 'operations', 'map', ARRAY['route_optimization', 'time_windows', 'team_dispatch', 'real_time_reroute', 'fuel_tracking'], 3000, false, ARRAY['delivery', 'logistics', 'field service'])
ON CONFLICT (slug) DO NOTHING;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agent_subscriptions' AND policyname = 'Users manage own agent subscriptions') THEN
    CREATE POLICY "Users manage own agent subscriptions" ON public.agent_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agent_activity' AND policyname = 'Users view own agent activity') THEN
    CREATE POLICY "Users view own agent activity" ON public.agent_activity FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 027: FREELANCER MARKETPLACE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  hourly_rate_cents INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  skills TEXT[] DEFAULT '{}',
  portfolio JSONB DEFAULT '[]',
  location TEXT DEFAULT '',
  languages TEXT[] DEFAULT '{English}',
  response_time_hours INTEGER DEFAULT 24,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_earnings_cents INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  subcategory TEXT DEFAULT '',
  pricing_tiers JSONB NOT NULL DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  order_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.freelancer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  freelancer_id UUID NOT NULL REFERENCES public.freelancer_profiles(id),
  gig_id UUID NOT NULL REFERENCES public.gigs(id),
  tier TEXT NOT NULL DEFAULT 'basic',
  requirements TEXT DEFAULT '',
  total_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  freelancer_payout_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  revision_count INTEGER DEFAULT 0,
  max_revisions INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.freelancer_orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount_cents INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.freelancer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.freelancer_orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  freelancer_id UUID NOT NULL REFERENCES public.freelancer_profiles(id),
  gig_id UUID NOT NULL REFERENCES public.gigs(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id)
);

CREATE TABLE IF NOT EXISTS public.freelancer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.freelancer_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user ON public.freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gigs_freelancer ON public.gigs(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_orders_buyer ON public.freelancer_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_orders_freelancer ON public.freelancer_orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_messages_order ON public.freelancer_messages(order_id);

-- RLS
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Freelancer profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_profiles' AND policyname = 'Anyone can view active profiles') THEN
    CREATE POLICY "Anyone can view active profiles" ON public.freelancer_profiles FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_profiles' AND policyname = 'Users manage own profile') THEN
    CREATE POLICY "Users manage own profile" ON public.freelancer_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;
  -- Gigs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gigs' AND policyname = 'Anyone can view active gigs') THEN
    CREATE POLICY "Anyone can view active gigs" ON public.gigs FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gigs' AND policyname = 'Freelancers manage own gigs') THEN
    CREATE POLICY "Freelancers manage own gigs" ON public.gigs FOR ALL USING (freelancer_id IN (SELECT id FROM public.freelancer_profiles WHERE user_id = auth.uid()));
  END IF;
  -- Orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_orders' AND policyname = 'Buyers see own orders') THEN
    CREATE POLICY "Buyers see own orders" ON public.freelancer_orders FOR SELECT USING (auth.uid() = buyer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_orders' AND policyname = 'Freelancers see own orders') THEN
    CREATE POLICY "Freelancers see own orders" ON public.freelancer_orders FOR SELECT USING (freelancer_id IN (SELECT id FROM public.freelancer_profiles WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_orders' AND policyname = 'Buyers create orders') THEN
    CREATE POLICY "Buyers create orders" ON public.freelancer_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_orders' AND policyname = 'Order parties can update') THEN
    CREATE POLICY "Order parties can update" ON public.freelancer_orders FOR UPDATE USING (auth.uid() = buyer_id OR freelancer_id IN (SELECT id FROM public.freelancer_profiles WHERE user_id = auth.uid()));
  END IF;
  -- Milestones
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_milestones' AND policyname = 'Order parties see milestones') THEN
    CREATE POLICY "Order parties see milestones" ON public.order_milestones FOR SELECT USING (order_id IN (SELECT id FROM public.freelancer_orders WHERE buyer_id = auth.uid() OR freelancer_id IN (SELECT id FROM public.freelancer_profiles WHERE user_id = auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_milestones' AND policyname = 'Order parties manage milestones') THEN
    CREATE POLICY "Order parties manage milestones" ON public.order_milestones FOR ALL USING (order_id IN (SELECT id FROM public.freelancer_orders WHERE buyer_id = auth.uid() OR freelancer_id IN (SELECT id FROM public.freelancer_profiles WHERE user_id = auth.uid())));
  END IF;
  -- Reviews
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_reviews' AND policyname = 'Anyone can read reviews') THEN
    CREATE POLICY "Anyone can read reviews" ON public.freelancer_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_reviews' AND policyname = 'Buyers write reviews') THEN
    CREATE POLICY "Buyers write reviews" ON public.freelancer_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
  -- Messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_messages' AND policyname = 'Order parties see messages') THEN
    CREATE POLICY "Order parties see messages" ON public.freelancer_messages FOR SELECT USING (order_id IN (SELECT id FROM public.freelancer_orders WHERE buyer_id = auth.uid() OR freelancer_id IN (SELECT id FROM public.freelancer_profiles WHERE user_id = auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'freelancer_messages' AND policyname = 'Order parties send messages') THEN
    CREATE POLICY "Order parties send messages" ON public.freelancer_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND order_id IN (SELECT id FROM public.freelancer_orders WHERE buyer_id = auth.uid() OR freelancer_id IN (SELECT id FROM public.freelancer_profiles WHERE user_id = auth.uid())));
  END IF;
END $$;

-- Triggers for rating updates
CREATE OR REPLACE FUNCTION update_freelancer_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.freelancer_profiles SET
    rating_avg = (SELECT AVG(rating) FROM public.freelancer_reviews WHERE freelancer_id = NEW.freelancer_id),
    rating_count = (SELECT COUNT(*) FROM public.freelancer_reviews WHERE freelancer_id = NEW.freelancer_id)
  WHERE id = NEW.freelancer_id;
  UPDATE public.gigs SET
    rating_avg = (SELECT AVG(rating) FROM public.freelancer_reviews WHERE gig_id = NEW.gig_id),
    rating_count = (SELECT COUNT(*) FROM public.freelancer_reviews WHERE gig_id = NEW.gig_id)
  WHERE id = NEW.gig_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ratings ON public.freelancer_reviews;
CREATE TRIGGER trg_update_ratings AFTER INSERT ON public.freelancer_reviews FOR EACH ROW EXECUTE FUNCTION update_freelancer_ratings();

CREATE OR REPLACE FUNCTION increment_order_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.freelancer_profiles SET total_orders = total_orders + 1 WHERE id = NEW.freelancer_id;
    UPDATE public.gigs SET order_count = order_count + 1 WHERE id = NEW.gig_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_orders ON public.freelancer_orders;
CREATE TRIGGER trg_increment_orders AFTER UPDATE ON public.freelancer_orders FOR EACH ROW EXECUTE FUNCTION increment_order_count();


-- ============================================================
-- 028: GALLERY SYSTEM
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
-- 029: MEMBERSHIP PROGRAM (Plans + Members)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  interval TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('monthly', 'yearly', 'one_time')),
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  max_members INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_user ON public.membership_plans(user_id);

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'membership_plans' AND policyname = 'Users manage own membership plans') THEN
    CREATE POLICY "Users manage own membership plans" ON public.membership_plans
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  plan_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('prospect', 'trial', 'active', 'past_due', 'cancelled')),
  start_date DATE,
  end_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'current', 'past_due', 'cancelled')),
  notes TEXT,
  stage_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_plan ON public.memberships(plan_id);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'memberships' AND policyname = 'Users manage own memberships') THEN
    CREATE POLICY "Users manage own memberships" ON public.memberships
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 030: PACKAGES / SERVICE CATALOG + SERVICE-AWARE BOOKING
-- ============================================================

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


-- ============================================================
-- DONE! All migrations 012-030 applied.
-- ============================================================
