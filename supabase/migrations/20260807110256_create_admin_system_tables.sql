/*
# Create Admin System Tables

## Purpose
The admin Review Queue and admin auth context reference admin_users, admin_role_permissions,
admin_logs, admin_activity_stats, admin_permissions, and admin_invitations — but these tables
were never applied to the database. This migration creates them with RLS so the admin panel
can function.

## New Tables
1. admin_users — Admin accounts linked to auth.users, with role, display_name, activity status,
   login tracking, and lockout fields.
2. admin_permissions — Catalog of all available system permissions (seeded).
3. admin_role_permissions — Maps permissions to roles (super_admin, moderator, support). Seeded.
4. admin_logs — Audit trail of admin actions (approve, reject, invite, etc.).
5. admin_activity_stats — Daily per-admin activity metrics (approvals, rejections, items reviewed).
6. admin_invitations — Tracks pending admin invitations with tokens and expiry.

## Security
- RLS enabled on all tables.
- admin_users: admins can SELECT all; super_admins can INSERT/UPDATE/DELETE.
- admin_permissions, admin_role_permissions: admins can SELECT; super_admins can manage.
- admin_logs: admins can SELECT; any authenticated admin can INSERT (for audit logging).
- admin_activity_stats: admins can SELECT; any authenticated admin can INSERT/UPDATE (for stats tracking).
- admin_invitations: admins can SELECT; super_admins can manage.
- All policies use an EXISTS subquery checking admin_users for auth.uid().
*/

-- =========================================================
-- admin_users
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support')),
  display_name text,
  department text,
  phone_number text,
  profile_image text,
  is_active boolean DEFAULT true,
  invited_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;
CREATE POLICY "Super admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'super_admin'));

DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
CREATE POLICY "Super admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'super_admin'));

DROP POLICY IF EXISTS "Admins can update own admin profile" ON admin_users;
CREATE POLICY "Admins can update own admin profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =========================================================
-- admin_permissions
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text UNIQUE NOT NULL,
  permission_name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all permissions" ON admin_permissions;
CREATE POLICY "Admins can view all permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

-- =========================================================
-- admin_role_permissions
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support')),
  permission_key text NOT NULL REFERENCES admin_permissions(permission_key) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_key)
);

ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view role permissions" ON admin_role_permissions;
CREATE POLICY "Admins can view role permissions"
  ON admin_role_permissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage role permissions" ON admin_role_permissions;
CREATE POLICY "Super admins can manage role permissions"
  ON admin_role_permissions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'super_admin'));

-- =========================================================
-- admin_logs
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  content_type text NOT NULL,
  content_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert logs" ON admin_logs;
CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

-- =========================================================
-- admin_activity_stats
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_activity_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  approvals_count integer DEFAULT 0,
  rejections_count integer DEFAULT 0,
  items_reviewed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(admin_id, date)
);

ALTER TABLE admin_activity_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all activity stats" ON admin_activity_stats;
CREATE POLICY "Admins can view all activity stats"
  ON admin_activity_stats FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert activity stats" ON admin_activity_stats;
CREATE POLICY "Admins can insert activity stats"
  ON admin_activity_stats FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update activity stats" ON admin_activity_stats;
CREATE POLICY "Admins can update activity stats"
  ON admin_activity_stats FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

-- =========================================================
-- admin_invitations
-- =========================================================
CREATE TABLE IF NOT EXISTS admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support')),
  invited_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  invitation_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view invitations" ON admin_invitations;
CREATE POLICY "Admins can view invitations"
  ON admin_invitations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage invitations" ON admin_invitations;
CREATE POLICY "Super admins can manage invitations"
  ON admin_invitations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.role = 'super_admin'));

-- =========================================================
-- Indexes
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_stats_admin_id ON admin_activity_stats(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_stats_date ON admin_activity_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(invitation_token);

-- =========================================================
-- Seed permissions
-- =========================================================
INSERT INTO admin_permissions (permission_key, permission_name, description, category) VALUES
  ('view_properties', 'View Properties', 'Can view property listings', 'properties'),
  ('manage_properties', 'Manage Properties', 'Can approve, reject, and edit property listings', 'properties'),
  ('view_gems', 'View Hidden Gems', 'Can view hidden gems', 'gems'),
  ('manage_gems', 'Manage Hidden Gems', 'Can approve, reject, and edit hidden gems', 'gems'),
  ('view_adventures', 'View Adventures', 'Can view adventures', 'adventures'),
  ('manage_adventures', 'Manage Adventures', 'Can approve, reject, and edit adventures', 'adventures'),
  ('view_guides', 'View Tour Guides', 'Can view tour guide applications', 'guides'),
  ('manage_guides', 'Manage Tour Guides', 'Can approve, reject, and edit tour guides', 'guides'),
  ('view_users', 'View Users', 'Can view regular user profiles', 'users'),
  ('manage_users', 'Manage Users', 'Can edit and moderate regular users', 'users'),
  ('view_logs', 'View Activity Logs', 'Can view admin activity logs', 'system'),
  ('view_analytics', 'View Analytics', 'Can view admin analytics and statistics', 'system'),
  ('manage_admins', 'Manage Admins', 'Can create, edit, and manage admin users', 'system'),
  ('system_settings', 'System Settings', 'Can access and modify system settings', 'system')
ON CONFLICT (permission_key) DO NOTHING;

-- =========================================================
-- Map permissions to roles
-- =========================================================
INSERT INTO admin_role_permissions (role, permission_key) VALUES
  ('super_admin', 'view_properties'),
  ('super_admin', 'manage_properties'),
  ('super_admin', 'view_gems'),
  ('super_admin', 'manage_gems'),
  ('super_admin', 'view_adventures'),
  ('super_admin', 'manage_adventures'),
  ('super_admin', 'view_guides'),
  ('super_admin', 'manage_guides'),
  ('super_admin', 'view_users'),
  ('super_admin', 'manage_users'),
  ('super_admin', 'view_logs'),
  ('super_admin', 'view_analytics'),
  ('super_admin', 'manage_admins'),
  ('super_admin', 'system_settings'),
  ('moderator', 'view_properties'),
  ('moderator', 'manage_properties'),
  ('moderator', 'view_gems'),
  ('moderator', 'manage_gems'),
  ('moderator', 'view_adventures'),
  ('moderator', 'manage_adventures'),
  ('moderator', 'view_guides'),
  ('moderator', 'manage_guides'),
  ('moderator', 'view_users'),
  ('moderator', 'view_logs'),
  ('moderator', 'view_analytics'),
  ('support', 'view_properties'),
  ('support', 'view_gems'),
  ('support', 'view_adventures'),
  ('support', 'view_guides'),
  ('support', 'view_users'),
  ('support', 'view_logs')
ON CONFLICT (role, permission_key) DO NOTHING;
