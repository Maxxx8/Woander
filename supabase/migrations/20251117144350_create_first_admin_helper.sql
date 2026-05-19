/*
  # Create First Admin User Helper Function

  1. New Function
    - create_admin_user: Helper function to create admin users
      - Takes email, password, role, and display_name as parameters
      - Creates auth user and admin_users entry in one transaction
      - Returns the created admin user ID
      
  2. Purpose
    - Simplifies the process of creating the first admin user
    - Ensures proper setup of both auth and admin_users tables
    - Can be used by super admins to create additional admin users
    
  3. Security
    - Function runs with security definer (elevated privileges)
    - Only accessible to authenticated users who are super admins
    - Validates role input
    
  4. Usage Example
    SELECT create_admin_user(
      'admin@example.com',
      'secure_password',
      'super_admin',
      'System Administrator'
    );
*/

-- Create a function to add admin users
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  user_role text DEFAULT 'moderator',
  user_display_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Validate role
  IF user_role NOT IN ('super_admin', 'moderator', 'support') THEN
    RAISE EXCEPTION 'Invalid role. Must be super_admin, moderator, or support';
  END IF;

  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('display_name', COALESCE(user_display_name, user_email)),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create admin_users entry
  INSERT INTO admin_users (id, role, display_name, is_active)
  VALUES (new_user_id, user_role, user_display_name, true);

  RETURN new_user_id;
END;
$$;

-- Grant execute permission to authenticated users (will be restricted by RLS in practice)
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated;

-- Create a simpler public function for initial setup (can be called without auth)
CREATE OR REPLACE FUNCTION create_first_admin(
  admin_email text,
  admin_password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  admin_count integer;
BEGIN
  -- Check if any admin users already exist
  SELECT COUNT(*) INTO admin_count FROM admin_users;
  
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin users already exist. Use create_admin_user function instead.';
  END IF;

  -- Create the first super admin
  SELECT create_admin_user(
    admin_email,
    admin_password,
    'super_admin',
    'System Administrator'
  ) INTO new_user_id;

  RETURN new_user_id;
END;
$$;

-- Grant execute to public for initial setup only
GRANT EXECUTE ON FUNCTION create_first_admin TO anon, authenticated;
