-- 027: Freelancer Marketplace
-- Tables for freelancer profiles, gigs, orders, milestones, reviews, messages

-- Freelancer profiles
CREATE TABLE IF NOT EXISTS freelancer_profiles (
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

-- Gigs (service listings)
CREATE TABLE IF NOT EXISTS gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
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

-- Orders
CREATE TABLE IF NOT EXISTS freelancer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(id),
  gig_id UUID NOT NULL REFERENCES gigs(id),
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

-- Order milestones
CREATE TABLE IF NOT EXISTS order_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES freelancer_orders(id) ON DELETE CASCADE,
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

-- Reviews
CREATE TABLE IF NOT EXISTS freelancer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES freelancer_orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(id),
  gig_id UUID NOT NULL REFERENCES gigs(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS freelancer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES freelancer_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user ON freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_category ON freelancer_profiles(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gigs_freelancer ON gigs(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_freelancer_orders_buyer ON freelancer_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_orders_freelancer ON freelancer_orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_messages_order ON freelancer_messages(order_id);

-- RLS
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_messages ENABLE ROW LEVEL SECURITY;

-- Public read for active profiles/gigs
CREATE POLICY "Anyone can view active profiles" ON freelancer_profiles
  FOR SELECT USING (is_active = true);
CREATE POLICY "Users manage own profile" ON freelancer_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active gigs" ON gigs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Freelancers manage own gigs" ON gigs
  FOR ALL USING (freelancer_id IN (SELECT id FROM freelancer_profiles WHERE user_id = auth.uid()));

-- Orders: buyer and freelancer can see their own
CREATE POLICY "Buyers see own orders" ON freelancer_orders
  FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Freelancers see own orders" ON freelancer_orders
  FOR SELECT USING (freelancer_id IN (SELECT id FROM freelancer_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Buyers create orders" ON freelancer_orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Order parties can update" ON freelancer_orders
  FOR UPDATE USING (
    auth.uid() = buyer_id OR
    freelancer_id IN (SELECT id FROM freelancer_profiles WHERE user_id = auth.uid())
  );

-- Milestones: same as orders
CREATE POLICY "Order parties see milestones" ON order_milestones
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM freelancer_orders
      WHERE buyer_id = auth.uid()
      OR freelancer_id IN (SELECT id FROM freelancer_profiles WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "Order parties manage milestones" ON order_milestones
  FOR ALL USING (
    order_id IN (
      SELECT id FROM freelancer_orders
      WHERE buyer_id = auth.uid()
      OR freelancer_id IN (SELECT id FROM freelancer_profiles WHERE user_id = auth.uid())
    )
  );

-- Reviews: public read, buyers write on own orders
CREATE POLICY "Anyone can read reviews" ON freelancer_reviews
  FOR SELECT USING (true);
CREATE POLICY "Buyers write reviews" ON freelancer_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Messages: order parties only
CREATE POLICY "Order parties see messages" ON freelancer_messages
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM freelancer_orders
      WHERE buyer_id = auth.uid()
      OR freelancer_id IN (SELECT id FROM freelancer_profiles WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "Order parties send messages" ON freelancer_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    order_id IN (
      SELECT id FROM freelancer_orders
      WHERE buyer_id = auth.uid()
      OR freelancer_id IN (SELECT id FROM freelancer_profiles WHERE user_id = auth.uid())
    )
  );

-- Trigger: update ratings on new review
CREATE OR REPLACE FUNCTION update_freelancer_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update freelancer profile rating
  UPDATE freelancer_profiles SET
    rating_avg = (SELECT AVG(rating) FROM freelancer_reviews WHERE freelancer_id = NEW.freelancer_id),
    rating_count = (SELECT COUNT(*) FROM freelancer_reviews WHERE freelancer_id = NEW.freelancer_id)
  WHERE id = NEW.freelancer_id;

  -- Update gig rating
  UPDATE gigs SET
    rating_avg = (SELECT AVG(rating) FROM freelancer_reviews WHERE gig_id = NEW.gig_id),
    rating_count = (SELECT COUNT(*) FROM freelancer_reviews WHERE gig_id = NEW.gig_id)
  WHERE id = NEW.gig_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ratings
  AFTER INSERT ON freelancer_reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_ratings();

-- Trigger: increment order count on completion
CREATE OR REPLACE FUNCTION increment_order_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE freelancer_profiles SET total_orders = total_orders + 1 WHERE id = NEW.freelancer_id;
    UPDATE gigs SET order_count = order_count + 1 WHERE id = NEW.gig_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_orders
  AFTER UPDATE ON freelancer_orders
  FOR EACH ROW EXECUTE FUNCTION increment_order_count();
