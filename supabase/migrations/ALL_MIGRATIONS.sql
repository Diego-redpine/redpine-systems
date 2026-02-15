-- ================================================================
-- RED PINE OS — COMPLETE DATABASE SCHEMA
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards
-- Paste this entire file into Supabase SQL Editor and hit Run
-- ================================================================


-- ============================================================
-- 000: FOUNDATION (profiles, configs, config_versions)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  business_name text,
  subdomain text unique,
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users see own profile') THEN
    CREATE POLICY "Users see own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users update own profile') THEN
    CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Configs
CREATE TABLE IF NOT EXISTS public.configs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  business_name text,
  business_type text,
  tabs jsonb not null default '[]',
  colors jsonb default '{}',
  nav_style text default 'sidebar',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'configs' AND policyname = 'Users see own configs') THEN
    CREATE POLICY "Users see own configs" ON public.configs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'configs' AND policyname = 'Users update own configs') THEN
    CREATE POLICY "Users update own configs" ON public.configs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'configs' AND policyname = 'Users insert own configs') THEN
    CREATE POLICY "Users insert own configs" ON public.configs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'configs' AND policyname = 'Anon configs readable') THEN
    CREATE POLICY "Anon configs readable" ON public.configs FOR SELECT USING (user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'configs' AND policyname = 'Anon configs insertable') THEN
    CREATE POLICY "Anon configs insertable" ON public.configs FOR INSERT WITH CHECK (user_id IS NULL);
  END IF;
END $$;

-- Config versions (undo)
CREATE TABLE IF NOT EXISTS public.config_versions (
  id uuid default gen_random_uuid() primary key,
  config_id uuid references public.configs(id) on delete cascade not null,
  version_number integer not null,
  tabs_snapshot jsonb not null,
  colors_snapshot jsonb,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_config_versions_lookup
  ON public.config_versions (config_id, version_number desc);

ALTER TABLE public.config_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'config_versions' AND policyname = 'Users read own config versions') THEN
    CREATE POLICY "Users read own config versions" ON public.config_versions FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.configs WHERE configs.id = config_versions.config_id AND configs.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'config_versions' AND policyname = 'Users insert own config versions') THEN
    CREATE POLICY "Users insert own config versions" ON public.config_versions FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.configs WHERE configs.id = config_versions.config_id AND configs.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'config_versions' AND policyname = 'Users delete own config versions') THEN
    CREATE POLICY "Users delete own config versions" ON public.config_versions FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.configs WHERE configs.id = config_versions.config_id AND configs.user_id = auth.uid()));
  END IF;
END $$;

-- Profile extensions for ordering
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_name TEXT DEFAULT 'Sales Tax';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_radius_miles NUMERIC DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe';


-- ============================================================
-- 001: CORE DATA TABLES (9 business entities)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  type TEXT DEFAULT 'client',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users see own clients') THEN
    CREATE POLICY "Users see own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users insert own clients') THEN
    CREATE POLICY "Users insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users update own clients') THEN
    CREATE POLICY "Users update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users delete own clients') THEN
    CREATE POLICY "Users delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  location TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users see own appointments') THEN
    CREATE POLICY "Users see own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users insert own appointments') THEN
    CREATE POLICY "Users insert own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users update own appointments') THEN
    CREATE POLICY "Users update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users delete own appointments') THEN
    CREATE POLICY "Users delete own appointments" ON public.appointments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  invoice_number TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users see own invoices') THEN
    CREATE POLICY "Users see own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users insert own invoices') THEN
    CREATE POLICY "Users insert own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users update own invoices') THEN
    CREATE POLICY "Users update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users delete own invoices') THEN
    CREATE POLICY "Users delete own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER,
  sku TEXT,
  quantity INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users see own products') THEN
    CREATE POLICY "Users see own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users insert own products') THEN
    CREATE POLICY "Users insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users update own products') THEN
    CREATE POLICY "Users update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users delete own products') THEN
    CREATE POLICY "Users delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  assigned_to TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users see own tasks') THEN
    CREATE POLICY "Users see own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users insert own tasks') THEN
    CREATE POLICY "Users insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users update own tasks') THEN
    CREATE POLICY "Users update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users delete own tasks') THEN
    CREATE POLICY "Users delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  hourly_rate_cents INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Users see own staff') THEN
    CREATE POLICY "Users see own staff" ON public.staff FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Users insert own staff') THEN
    CREATE POLICY "Users insert own staff" ON public.staff FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Users update own staff') THEN
    CREATE POLICY "Users update own staff" ON public.staff FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff' AND policyname = 'Users delete own staff') THEN
    CREATE POLICY "Users delete own staff" ON public.staff FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  stage TEXT DEFAULT 'new',
  value_cents INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users see own leads') THEN
    CREATE POLICY "Users see own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users insert own leads') THEN
    CREATE POLICY "Users insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users update own leads') THEN
    CREATE POLICY "Users update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users delete own leads') THEN
    CREATE POLICY "Users delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  subject TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'note',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users see own messages') THEN
    CREATE POLICY "Users see own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users insert own messages') THEN
    CREATE POLICY "Users insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users update own messages') THEN
    CREATE POLICY "Users update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users delete own messages') THEN
    CREATE POLICY "Users delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes INTEGER,
  folder TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users see own documents') THEN
    CREATE POLICY "Users see own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users insert own documents') THEN
    CREATE POLICY "Users insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users update own documents') THEN
    CREATE POLICY "Users update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users delete own documents') THEN
    CREATE POLICY "Users delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);

-- Column extensions (safe to re-run)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'client';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


-- ============================================================
-- 002: TEAM MEMBERS (staff/role system)
-- ============================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_record_id UUID,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'deactivated')),
  invite_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_owner_id, email)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Owners can view their team') THEN
    CREATE POLICY "Owners can view their team" ON team_members FOR SELECT USING (business_owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Owners can insert team members') THEN
    CREATE POLICY "Owners can insert team members" ON team_members FOR INSERT WITH CHECK (business_owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Owners can update their team') THEN
    CREATE POLICY "Owners can update their team" ON team_members FOR UPDATE USING (business_owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Owners can delete team members') THEN
    CREATE POLICY "Owners can delete team members" ON team_members FOR DELETE USING (business_owner_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Staff can view own membership') THEN
    CREATE POLICY "Staff can view own membership" ON team_members FOR SELECT USING (auth_user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_auth_user ON team_members(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON team_members(invite_token);


-- ============================================================
-- 003: ONLINE ORDERING (menus, orders, promos)
-- ============================================================

-- Menu modifiers
CREATE TABLE IF NOT EXISTS menu_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID,
  group_name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1,
  options JSONB NOT NULL DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE menu_modifiers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menu_modifiers' AND policyname = 'Users manage own modifiers') THEN
    CREATE POLICY "Users manage own modifiers" ON menu_modifiers FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- Online orders
CREATE TABLE IF NOT EXISTS online_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'pickup', 'delivery')),
  table_number TEXT,
  delivery_address JSONB,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  tip_cents INTEGER NOT NULL DEFAULT 0,
  delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id TEXT,
  promo_code_id UUID,
  gift_card_id UUID,
  gift_card_amount_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'completed', 'cancelled')),
  estimated_ready_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  delivery_tracking_url TEXT,
  delivery_driver_name TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'online_orders' AND policyname = 'Users manage own orders') THEN
    CREATE POLICY "Users manage own orders" ON online_orders FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_online_orders_user ON online_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_status ON online_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_online_orders_number ON online_orders(order_number);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, code)
);
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promo_codes' AND policyname = 'Users manage own promos') THEN
    CREATE POLICY "Users manage own promos" ON promo_codes FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;


-- ============================================================
-- 004: RESTAURANT OPERATIONS (waitlist, tips, waste, suppliers, loyalty)
-- ============================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'seated', 'no_show', 'cancelled')),
  estimated_wait_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  seated_at TIMESTAMPTZ
);
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waitlist' AND policyname = 'Users manage own waitlist') THEN
    CREATE POLICY "Users manage own waitlist" ON waitlist FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tip_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_tips_cents INTEGER NOT NULL DEFAULT 0,
  foh_share_percent INTEGER DEFAULT 80,
  boh_share_percent INTEGER DEFAULT 20,
  distributed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tip_pools ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tip_pools' AND policyname = 'Users manage own tip_pools') THEN
    CREATE POLICY "Users manage own tip_pools" ON tip_pools FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS waste_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'portions',
  reason TEXT CHECK (reason IN ('expired', 'damaged', 'overproduction', 'customer_return', 'other')),
  estimated_cost_cents INTEGER,
  logged_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE waste_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waste_log' AND policyname = 'Users manage own waste_log') THEN
    CREATE POLICY "Users manage own waste_log" ON waste_log FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users manage own suppliers') THEN
    CREATE POLICY "Users manage own suppliers" ON suppliers FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  po_number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
  expected_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Users manage own purchase_orders') THEN
    CREATE POLICY "Users manage own purchase_orders" ON purchase_orders FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS loyalty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  total_orders INTEGER DEFAULT 0,
  total_spent_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, customer_phone)
);
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loyalty_members' AND policyname = 'Users manage own loyalty_members') THEN
    CREATE POLICY "Users manage own loyalty_members" ON loyalty_members FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS loyalty_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points_per_dollar INTEGER DEFAULT 1,
  reward_threshold INTEGER DEFAULT 100,
  reward_type TEXT DEFAULT 'discount',
  reward_value_cents INTEGER DEFAULT 500,
  is_active BOOLEAN DEFAULT true
);
ALTER TABLE loyalty_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loyalty_config' AND policyname = 'Users manage own loyalty_config') THEN
    CREATE POLICY "Users manage own loyalty_config" ON loyalty_config FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_tip_pools_user ON tip_pools(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_log_user ON waste_log(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_user ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_user_phone ON loyalty_members(user_id, customer_phone);


-- ============================================================
-- 005: RECORD ATTACHMENTS (file uploads for any entity)
-- ============================================================

CREATE TABLE IF NOT EXISTS record_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  record_id text not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_record_attachments_lookup
  ON record_attachments (user_id, entity_type, record_id);
ALTER TABLE record_attachments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'record_attachments' AND policyname = 'Users can view own attachments') THEN
    CREATE POLICY "Users can view own attachments" ON record_attachments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'record_attachments' AND policyname = 'Users can insert own attachments') THEN
    CREATE POLICY "Users can insert own attachments" ON record_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'record_attachments' AND policyname = 'Users can delete own attachments') THEN
    CREATE POLICY "Users can delete own attachments" ON record_attachments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 006: RECORD LINKS (cross-entity relationships)
-- ============================================================

CREATE TABLE IF NOT EXISTS record_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_entity text not null,
  source_id text not null,
  target_entity text not null,
  target_id text not null,
  link_type text not null default 'related',
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_record_links_source
  ON record_links (user_id, source_entity, source_id);
CREATE INDEX IF NOT EXISTS idx_record_links_target
  ON record_links (user_id, target_entity, target_id);
ALTER TABLE record_links ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'record_links' AND policyname = 'Users can view own links') THEN
    CREATE POLICY "Users can view own links" ON record_links FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'record_links' AND policyname = 'Users can insert own links') THEN
    CREATE POLICY "Users can insert own links" ON record_links FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'record_links' AND policyname = 'Users can delete own links') THEN
    CREATE POLICY "Users can delete own links" ON record_links FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 007: RECURRING RECORDS (invoices + appointments)
-- ============================================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurrence text default 'none';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurrence_end_date date;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_template_id uuid;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_recurring_template boolean default false;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence text default 'none';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_end_date date;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurring_template_id uuid;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_recurring_template boolean default false;

CREATE TABLE IF NOT EXISTS recurring_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  template_id uuid not null,
  generated_id uuid not null,
  generated_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_recurring_log_template
  ON recurring_log (user_id, entity_type, template_id);
ALTER TABLE recurring_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_log' AND policyname = 'Users can view own recurring log') THEN
    CREATE POLICY "Users can view own recurring log" ON recurring_log FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recurring_log' AND policyname = 'Users can insert own recurring log') THEN
    CREATE POLICY "Users can insert own recurring log" ON recurring_log FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- DONE! All 8 migrations applied.
-- ============================================================
-- Tables created/verified: profiles, configs, config_versions,
-- clients, appointments, invoices, products, tasks, staff, leads,
-- messages, documents, team_members, menu_modifiers, online_orders,
-- promo_codes, waitlist, tip_pools, waste_log, suppliers,
-- purchase_orders, loyalty_members, loyalty_config,
-- record_attachments, record_links, recurring_log
-- ============================================================
