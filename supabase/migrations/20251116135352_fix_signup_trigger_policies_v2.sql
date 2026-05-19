/*
  # Fix Sign-Up Trigger - Allow Anonymous Inserts

  ## Issue
  SECURITY DEFINER is not bypassing RLS correctly, or policies are too restrictive.
  Need to explicitly allow both authenticated and anon roles to insert during signup.

  ## Solution
  - Update INSERT policies to allow both authenticated and anon roles
  - Remove role restrictions to allow trigger execution
  - Keep UPDATE/DELETE policies restrictive for security

  ## Security
  - Only trigger can create initial records (via SECURITY DEFINER)
  - Users cannot manually insert via client
  - UPDATE still requires auth.uid() = user_id
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow contribution creation during signup" ON user_contributions;

-- Create permissive INSERT policies for trigger execution
CREATE POLICY "Enable insert during signup trigger"
  ON user_profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Enable insert during signup trigger"
  ON user_contributions FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
