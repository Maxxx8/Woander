/*
  # Security Fix: Optimize RLS Policies - Admin Tables (Part 4)

  Continues RLS optimization for admin-related tables.
*/

-- ============================================================================
-- ADMIN_USERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid()) AND role = 'super_admin'));

-- ============================================================================
-- ADMIN_LOGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid())));

-- ============================================================================
-- ADMIN_PERMISSIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all permissions" ON admin_permissions;
CREATE POLICY "Admins can view all permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid())));

-- ============================================================================
-- ADMIN_ROLE_PERMISSIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view role permissions" ON admin_role_permissions;
CREATE POLICY "Admins can view role permissions"
  ON admin_role_permissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Super admins can manage role permissions" ON admin_role_permissions;
CREATE POLICY "Super admins can manage role permissions"
  ON admin_role_permissions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid()) AND role = 'super_admin'));

-- ============================================================================
-- ADMIN_INVITATIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view invitations" ON admin_invitations;
CREATE POLICY "Admins can view invitations"
  ON admin_invitations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid())));

DROP POLICY IF EXISTS "Super admins can manage invitations" ON admin_invitations;
CREATE POLICY "Super admins can manage invitations"
  ON admin_invitations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid()) AND role = 'super_admin'));

-- ============================================================================
-- ADMIN_ACTIVITY_STATS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all activity stats" ON admin_activity_stats;
CREATE POLICY "Admins can view all activity stats"
  ON admin_activity_stats FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = (select auth.uid())));
