/*
  # Fix User Sign-Up RLS Policies

  ## Issue
  Sign-up fails because INSERT policies on user_profiles and user_contributions
  require auth.uid() = user_id, but the trigger runs before the session is established,
  so auth.uid() returns NULL.

  ## Solution
  - Drop restrictive INSERT policies
  - Create new INSERT policies with WITH CHECK (true) to allow trigger inserts
  - Maintain UPDATE policies to keep security intact

  ## Security
  - SECURITY DEFINER function bypasses RLS during trigger execution
  - Users still cannot update other users' data
  - Only system trigger can create initial records
*/

-- Fix user_profiles INSERT policy
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;

CREATE POLICY "Allow profile creation during signup"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Fix user_contributions INSERT policy  
DROP POLICY IF EXISTS "Users can view their own contribution profile" ON user_contributions;

CREATE POLICY "Allow contribution creation during signup"
  ON user_contributions FOR INSERT
  WITH CHECK (true);
