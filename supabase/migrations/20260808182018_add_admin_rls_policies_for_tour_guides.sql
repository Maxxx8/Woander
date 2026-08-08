/*
# Add admin RLS policies for tour_guides

## Problem
The tour_guides table had SELECT policies that only allowed:
1. Anyone to view approved + active guides (public)
2. Authenticated users to view their own guide profile

There was NO policy allowing admin users to see ALL guide applications
(including pending ones). When an admin queried the table through the
anon-key Supabase client, RLS filtered out all pending applications,
so the admin dashboard's "Pending Tour Guides" section appeared empty
even though pending rows existed in the database.

This is the same bug that was fixed for hidden_gems in migration
20260807191258_add_admin_rls_policies_for_hidden_gems.sql.

## Changes
1. Add SELECT policy: admins can view ALL tour guides (any status).
2. Add UPDATE policy: admins can update tour guides (approve/reject/suspend).

## Security
- Both policies check that the current user exists in admin_users with is_active = true.
- The existing public and owner SELECT policies remain in place for non-admin users.
- No DELETE or INSERT policy is added here — admins don't need to delete or create guide profiles.
*/

-- Admins can view all tour guides regardless of status
DROP POLICY IF EXISTS "Admins can view all tour guides" ON tour_guides;
CREATE POLICY "Admins can view all tour guides"
ON tour_guides FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid() AND au.is_active = true
  )
);

-- Admins can update tour guides (approve, reject, suspend, etc.)
DROP POLICY IF EXISTS "Admins can update tour guides" ON tour_guides;
CREATE POLICY "Admins can update tour guides"
ON tour_guides FOR UPDATE
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
