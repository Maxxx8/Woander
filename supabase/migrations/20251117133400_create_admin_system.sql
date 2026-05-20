/*
  # Admin System Setup

  1. New Tables
    - admin_users: Admin accounts with role-based access (super_admin, moderator, support)
    - admin_logs: Audit trail for all admin actions

  2. Modifications to Existing Tables
    - property_listings: Add status, rejection_reason, resubmitted_at
    - hidden_gems: Add status, rejection_reason, resubmitted_at
    - adventures: Add status, rejection_reason, resubmitted_at
    - tour_guides: Add rejection_reason, resubmitted_at

  3. Security
    - Enable RLS on all admin tables
    - Create policies for role-based access
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support')),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "System can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_listings' AND column_name = 'status') THEN
    ALTER TABLE property_listings ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_listings' AND column_name = 'rejection_reason') THEN
    ALTER TABLE property_listings ADD COLUMN rejection_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_listings' AND column_name = 'resubmitted_at') THEN
    ALTER TABLE property_listings ADD COLUMN resubmitted_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hidden_gems' AND column_name = 'status') THEN
    ALTER TABLE hidden_gems ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hidden_gems' AND column_name = 'rejection_reason') THEN
    ALTER TABLE hidden_gems ADD COLUMN rejection_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hidden_gems' AND column_name = 'resubmitted_at') THEN
    ALTER TABLE hidden_gems ADD COLUMN resubmitted_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adventures' AND column_name = 'status') THEN
    ALTER TABLE adventures ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adventures' AND column_name = 'rejection_reason') THEN
    ALTER TABLE adventures ADD COLUMN rejection_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'adventures' AND column_name = 'resubmitted_at') THEN
    ALTER TABLE adventures ADD COLUMN resubmitted_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_guides' AND column_name = 'rejection_reason') THEN
    ALTER TABLE tour_guides ADD COLUMN rejection_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_guides' AND column_name = 'resubmitted_at') THEN
    ALTER TABLE tour_guides ADD COLUMN resubmitted_at timestamptz;
  END IF;
END $$;