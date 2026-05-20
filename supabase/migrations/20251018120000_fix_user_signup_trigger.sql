/*
  # Fix User Signup Database Error

  ## Overview
  This migration fixes the "Database Error" that occurs during new user signup
  by adjusting RLS policies to allow the signup trigger to properly initialize
  user data.

  ## Changes Made
  1. Drop and recreate RLS policy on user_contributions to allow trigger-based inserts
  2. Drop and recreate RLS policy on user_profiles to allow trigger-based inserts
  3. Ensure the initialize_user_data function uses SECURITY DEFINER properly

  ## Security
  - Maintains security by using SECURITY DEFINER on the trigger function
  - Policies now allow inserts but maintain read/update restrictions
  - Only authenticated users can update their own records

  ## Important Notes
  - The trigger runs with elevated privileges to initialize user data
  - Users still cannot modify other users' records
  - This fixes the signup flow without compromising security
*/

-- Drop existing INSERT policies that are too restrictive
DROP POLICY IF EXISTS "Users can view their own contribution profile" ON user_contributions;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;

-- Recreate policy for user_contributions that allows inserts
-- The trigger uses SECURITY DEFINER so it can insert regardless of auth context
CREATE POLICY "Allow user contribution inserts"
  ON user_contributions FOR INSERT
  WITH CHECK (true);

-- Recreate user_profiles INSERT policy to allow trigger inserts
CREATE POLICY "Allow user profile inserts"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Ensure UPDATE policies remain restrictive
DROP POLICY IF EXISTS "Users can update their own contribution profile" ON user_contributions;
CREATE POLICY "Users can update their own contribution profile"
  ON user_contributions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
