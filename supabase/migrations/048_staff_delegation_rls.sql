-- ============================================================
-- 048: Staff Delegation RLS Policies + Performance Index
-- ============================================================
-- Adds staff delegation to ALL tables with user_id column.
-- Allows staff members to access their business owner's data
-- through user-scoped Supabase client (not service role key).
--
-- PostgreSQL RLS is OR-based: any policy that permits access wins.
-- Existing "owner" policies (auth.uid() = user_id) are preserved.
-- This migration ADDS a parallel "staff" policy alongside them.
-- ============================================================

-- Index for fast RLS subquery lookups
CREATE INDEX IF NOT EXISTS idx_team_members_auth_user_active
  ON public.team_members(auth_user_id, status)
  WHERE status = 'active';

-- ── team_members: staff reads own membership, owner manages team ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'staff_read_own_membership') THEN
    CREATE POLICY "staff_read_own_membership" ON public.team_members
      FOR SELECT USING (auth_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'owner_manage_team') THEN
    CREATE POLICY "owner_manage_team" ON public.team_members
      FOR ALL USING (business_owner_id = auth.uid())
      WITH CHECK (business_owner_id = auth.uid());
  END IF;
END $$;

-- ── Add staff delegation policy to ALL tables with user_id column ──
DO $$
DECLARE
  tbl_name text;
BEGIN
  FOR tbl_name IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t ON c.table_name = t.table_name AND c.table_schema = t.table_schema
    WHERE c.column_name = 'user_id'
      AND c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.table_name NOT IN ('profiles', 'team_members') -- profiles uses id, team_members handled above
  LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY "staff_delegation" ON public.%I FOR ALL USING (
          user_id IN (
            SELECT business_owner_id FROM public.team_members
            WHERE auth_user_id = auth.uid() AND status = ''active''
          )
        ) WITH CHECK (
          user_id IN (
            SELECT business_owner_id FROM public.team_members
            WHERE auth_user_id = auth.uid() AND status = ''active''
          )
        )', tbl_name
      );
      RAISE NOTICE 'Added staff_delegation policy to %', tbl_name;
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Skipped % (staff_delegation policy already exists)', tbl_name;
    END;
  END LOOP;
END $$;
