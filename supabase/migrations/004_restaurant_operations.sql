-- Waitlist table for walk-in queue management
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
CREATE POLICY "Users manage own waitlist" ON waitlist FOR ALL USING (user_id = auth.uid());

-- Tip pools for daily tip tracking
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
CREATE POLICY "Users manage own tip_pools" ON tip_pools FOR ALL USING (user_id = auth.uid());

-- Waste log for food waste tracking
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
CREATE POLICY "Users manage own waste_log" ON waste_log FOR ALL USING (user_id = auth.uid());

-- Suppliers table
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
CREATE POLICY "Users manage own suppliers" ON suppliers FOR ALL USING (user_id = auth.uid());

-- Purchase orders table
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
CREATE POLICY "Users manage own purchase_orders" ON purchase_orders FOR ALL USING (user_id = auth.uid());

-- Loyalty members table
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
CREATE POLICY "Users manage own loyalty_members" ON loyalty_members FOR ALL USING (user_id = auth.uid());

-- Loyalty config table
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
CREATE POLICY "Users manage own loyalty_config" ON loyalty_config FOR ALL USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_tip_pools_user ON tip_pools(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_log_user ON waste_log(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_user ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_user_phone ON loyalty_members(user_id, customer_phone);
