/*
  # Enhanced Admin System with Permission Levels

  1. New Tables
    - admin_permissions: Defines all available system permissions
      - id (uuid, primary key)
      - permission_key (text, unique) - e.g., 'manage_properties', 'view_logs'
      - permission_name (text) - human-readable name
      - description (text)
      - category (text) - groups permissions by feature area
      - created_at (timestamptz)
    
    - admin_role_permissions: Maps permissions to roles
      - id (uuid, primary key)
      - role (text) - references admin role type
      - permission_key (text) - references permission
      - created_at (timestamptz)
    
    - admin_invitations: Tracks pending admin user invitations
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - invited_by (uuid) - references admin_users
      - invitation_token (uuid, unique)
      - status (text) - pending, accepted, expired, revoked
      - expires_at (timestamptz)
      - accepted_at (timestamptz)
      - message (text) - optional personalized message
      - created_at (timestamptz)
    
    - admin_activity_stats: Daily activity metrics per admin
      - id (uuid, primary key)
      - admin_id (uuid) - references admin_users
      - date (date)
      - approvals_count (integer)
      - rejections_count (integer)
      - items_reviewed (integer)
      - created_at (timestamptz)

  2. Modifications to Existing Tables
    - admin_users: Add display_name, department, phone_number, profile_image, is_active, invited_by, failed_login_attempts, locked_until
    - admin_logs: Add ip_address, user_agent, before_state, after_state

  3. Security
    - Enable RLS on all new tables
    - Create restrictive policies for admin-only access
    - Add indexes for performance optimization

  4. Initial Permissions Seeding
    - Insert all available system permissions
    - Map permissions to existing roles (super_admin, moderator, support)
*/

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text UNIQUE NOT NULL,
  permission_name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Create admin_role_permissions table
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support')),
  permission_key text NOT NULL REFERENCES admin_permissions(permission_key) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_key)
);

ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role permissions"
  ON admin_role_permissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Super admins can manage role permissions"
  ON admin_role_permissions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin'));

-- Create admin_invitations table
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

CREATE POLICY "Admins can view invitations"
  ON admin_invitations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Super admins can manage invitations"
  ON admin_invitations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin'));

-- Create admin_activity_stats table
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

CREATE POLICY "Admins can view all activity stats"
  ON admin_activity_stats FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "System can update activity stats"
  ON admin_activity_stats FOR ALL
  TO authenticated
  WITH CHECK (true);

-- Add new columns to admin_users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'display_name') THEN
    ALTER TABLE admin_users ADD COLUMN display_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'department') THEN
    ALTER TABLE admin_users ADD COLUMN department text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'phone_number') THEN
    ALTER TABLE admin_users ADD COLUMN phone_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'profile_image') THEN
    ALTER TABLE admin_users ADD COLUMN profile_image text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'is_active') THEN
    ALTER TABLE admin_users ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'invited_by') THEN
    ALTER TABLE admin_users ADD COLUMN invited_by uuid REFERENCES admin_users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'failed_login_attempts') THEN
    ALTER TABLE admin_users ADD COLUMN failed_login_attempts integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'locked_until') THEN
    ALTER TABLE admin_users ADD COLUMN locked_until timestamptz;
  END IF;
END $$;

-- Add new columns to admin_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'ip_address') THEN
    ALTER TABLE admin_logs ADD COLUMN ip_address text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'user_agent') THEN
    ALTER TABLE admin_logs ADD COLUMN user_agent text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'before_state') THEN
    ALTER TABLE admin_logs ADD COLUMN before_state jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'after_state') THEN
    ALTER TABLE admin_logs ADD COLUMN after_state jsonb;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_stats_admin_id ON admin_activity_stats(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_stats_date ON admin_activity_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_status ON admin_invitations(status);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(invitation_token);

-- Seed permissions
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

-- Map permissions to roles
INSERT INTO admin_role_permissions (role, permission_key) VALUES
  -- Super Admin gets all permissions
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
  
  -- Moderator gets content management permissions
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
  
  -- Support gets view-only permissions
  ('support', 'view_properties'),
  ('support', 'view_gems'),
  ('support', 'view_adventures'),
  ('support', 'view_guides'),
  ('support', 'view_users'),
  ('support', 'view_logs')
ON CONFLICT (role, permission_key) DO NOTHING;