/*
  # Optimize RLS Policies - Auth Function Initialization

  1. Changes
    - Replace all `auth.uid()` with `(select auth.uid())` in RLS policies
    - Replace all `auth.role()` with `(select auth.role())` in RLS policies
    - Prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Tables Updated
    - adventures (4 policies)
    - itinerary_days (5 policies)
    - hidden_gems (4 policies)
    - gem_votes (2 policies)
    - gem_visits (2 policies)
    - gem_comments (2 policies)
    - user_contributions (2 policies)
    - user_profiles (2 policies)

  3. Security
    - No security model changes
    - Performance optimization only
    - All policies maintain same access control
*/

-- ============================================================================
-- ADVENTURES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own adventures" ON public.adventures;
CREATE POLICY "Users can view own adventures"
ON public.adventures
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own adventures" ON public.adventures;
CREATE POLICY "Users can create own adventures"
ON public.adventures
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own adventures" ON public.adventures;
CREATE POLICY "Users can update own adventures"
ON public.adventures
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own adventures" ON public.adventures;
CREATE POLICY "Users can delete own adventures"
ON public.adventures
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- ============================================================================
-- ITINERARY_DAYS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view itinerary for own adventures" ON public.itinerary_days;
CREATE POLICY "Users can view itinerary for own adventures"
ON public.itinerary_days
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.adventures
    WHERE adventures.id = itinerary_days.adventure_id
    AND adventures.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create itinerary for own adventures" ON public.itinerary_days;
CREATE POLICY "Users can create itinerary for own adventures"
ON public.itinerary_days
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.adventures
    WHERE adventures.id = itinerary_days.adventure_id
    AND adventures.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update itinerary for own adventures" ON public.itinerary_days;
CREATE POLICY "Users can update itinerary for own adventures"
ON public.itinerary_days
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.adventures
    WHERE adventures.id = itinerary_days.adventure_id
    AND adventures.user_id = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.adventures
    WHERE adventures.id = itinerary_days.adventure_id
    AND adventures.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete itinerary for own adventures" ON public.itinerary_days;
CREATE POLICY "Users can delete itinerary for own adventures"
ON public.itinerary_days
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.adventures
    WHERE adventures.id = itinerary_days.adventure_id
    AND adventures.user_id = (select auth.uid())
  )
);

-- ============================================================================
-- HIDDEN_GEMS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view verified hidden gems" ON public.hidden_gems;
CREATE POLICY "Anyone can view verified hidden gems"
ON public.hidden_gems
FOR SELECT
TO authenticated
USING (verification_status IN ('verified', 'featured'));

DROP POLICY IF EXISTS "Authenticated users can submit hidden gems" ON public.hidden_gems;
CREATE POLICY "Authenticated users can submit hidden gems"
ON public.hidden_gems
FOR INSERT
TO authenticated
WITH CHECK (submitted_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own hidden gems" ON public.hidden_gems;
CREATE POLICY "Users can update their own hidden gems"
ON public.hidden_gems
FOR UPDATE
TO authenticated
USING (submitted_by = (select auth.uid()))
WITH CHECK (submitted_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own hidden gems" ON public.hidden_gems;
CREATE POLICY "Users can delete their own hidden gems"
ON public.hidden_gems
FOR DELETE
TO authenticated
USING (submitted_by = (select auth.uid()));

-- ============================================================================
-- GEM_VOTES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can vote on gems" ON public.gem_votes;
CREATE POLICY "Authenticated users can vote on gems"
ON public.gem_votes
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove their own votes" ON public.gem_votes;
CREATE POLICY "Users can remove their own votes"
ON public.gem_votes
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- ============================================================================
-- GEM_VISITS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can log visits" ON public.gem_visits;
CREATE POLICY "Authenticated users can log visits"
ON public.gem_visits
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own visits" ON public.gem_visits;
CREATE POLICY "Users can update their own visits"
ON public.gem_visits
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- GEM_COMMENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.gem_comments;
CREATE POLICY "Authenticated users can comment"
ON public.gem_comments
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.gem_comments;
CREATE POLICY "Users can delete their own comments"
ON public.gem_comments
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- ============================================================================
-- USER_CONTRIBUTIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own contribution profile" ON public.user_contributions;
CREATE POLICY "Users can view their own contribution profile"
ON public.user_contributions
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own contribution profile" ON public.user_contributions;
CREATE POLICY "Users can update their own contribution profile"
ON public.user_contributions
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
CREATE POLICY "Users can create their own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));
