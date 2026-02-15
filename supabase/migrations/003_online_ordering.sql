-- Online Ordering System Tables

-- Menu table enhancements
ALTER TABLE menus ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS is_available_online BOOLEAN DEFAULT true;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS price_cents INTEGER;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS available_start TIME;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS available_end TIME;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT '{mon,tue,wed,thu,fri,sat,sun}';
ALTER TABLE menus ADD COLUMN IF NOT EXISTS inventory_item_id UUID;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS portions_per_unit INTEGER DEFAULT 1;

-- Menu Modifiers (size, toppings, sides)
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
CREATE POLICY "Users manage own modifiers" ON menu_modifiers
  FOR ALL USING (user_id = auth.uid());

-- Online Orders
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
CREATE POLICY "Users manage own orders" ON online_orders
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_online_orders_user ON online_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_status ON online_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_online_orders_number ON online_orders(order_number);

-- Promo Codes
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
CREATE POLICY "Users manage own promos" ON promo_codes
  FOR ALL USING (user_id = auth.uid());

-- Business profiles enhancements for ordering
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_name TEXT DEFAULT 'Sales Tax';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_radius_miles NUMERIC DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe';
