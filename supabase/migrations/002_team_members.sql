-- Team Members table: Links platform login accounts to businesses
-- business_owner_id = the owner's user ID (same user_id used in all CRUD)
-- auth_user_id = the staff member's own login account
-- Staff queries use business_owner_id to see the owner's data

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

-- RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Owners can see and manage their own team
CREATE POLICY "Owners can view their team"
  ON team_members FOR SELECT
  USING (business_owner_id = auth.uid());

CREATE POLICY "Owners can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (business_owner_id = auth.uid());

CREATE POLICY "Owners can update their team"
  ON team_members FOR UPDATE
  USING (business_owner_id = auth.uid());

CREATE POLICY "Owners can delete team members"
  ON team_members FOR DELETE
  USING (business_owner_id = auth.uid());

-- Staff can view their own membership record
CREATE POLICY "Staff can view own membership"
  ON team_members FOR SELECT
  USING (auth_user_id = auth.uid());

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_auth_user ON team_members(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON team_members(invite_token);
