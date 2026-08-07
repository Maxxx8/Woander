/*
# Add admin RLS policies for hidden_gems

## Problem
The hidden_gems table had a SELECT policy ("Public can view verified and featured gems")
that only allowed reading rows where verification_status IN ('verified', 'featured')
OR submitted_by = auth.uid(). There was NO policy allowing admin users to see
pending gems. When an admin queried the table through the anon-key Supabase client,
RLS filtered out all pending submissions, so the admin dashboard's "Pending Hidden Gems"
section appeared empty even though pending rows existed in the database.

## Changes
1. Add SELECT policy: admins can view ALL hidden gems (any status).
2. Add UPDATE policy: admins can update hidden gems (approve/reject/feature).

## Security
- Both policies check that the current user exists in admin_users with is_active = true.
- The existing public SELECT policy remains in place for non-admin users.
- No DELETE or INSERT policy is added here — admins don't need to delete or create gems.
*/

-- Admins can view all hidden gems regardless of verification status
DROP POLICY IF EXISTS "Admins can view all hidden gems" ON hidden_gems;
CREATE POLICY "Admins can view all hidden gems"
ON hidden_gems FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid() AND au.is_active = true
  )
);

-- Admins can update hidden gems (approve, reject, feature, etc.)
DROP POLICY IF EXISTS "Admins can update hidden gems" ON hidden_gems;
CREATE POLICY "Admins can update hidden gems"
ON hidden_gems FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid() AND au.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid() AND au.is_active = true
  )
);
