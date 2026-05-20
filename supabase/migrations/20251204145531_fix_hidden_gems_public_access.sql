/*
  # Fix Hidden Gems Public Access
  
  ## Changes
  - Drop existing restrictive SELECT policy on hidden_gems
  - Create new policy allowing public access to verified/featured gems
  - Authenticated users can still see their own pending submissions
  
  ## Security
  - Public users can view verified and featured gems only
  - Users can see their own submissions regardless of verification status
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view verified hidden gems" ON hidden_gems;

-- Create new policy for public viewing of verified/featured gems
CREATE POLICY "Public can view verified and featured gems"
  ON hidden_gems
  FOR SELECT
  USING (
    verification_status IN ('verified', 'featured')
    OR submitted_by = auth.uid()
  );
