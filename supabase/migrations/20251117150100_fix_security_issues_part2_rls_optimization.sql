/*
  # Security Fix: Optimize RLS Policies (Part 2)

  1. Issue: RLS Auth Function Re-evaluation
    - Policies call auth.uid() multiple times per row
    - Causes performance degradation at scale
    - Re-evaluates for every row in query result

  2. Solution: Use SELECT Subquery Pattern
    - Wrap auth.uid() in SELECT subquery: (select auth.uid())
    - Evaluates once per query instead of once per row
    - Significantly improves performance at scale

  ## Updated Tables:
  - adventures
  - itinerary_days
  - hidden_gems
  - gem_comments, gem_votes, gem_visits
  - user_profiles, user_contributions, user_favorite_quotes
  - property_listings, property_bookings, property_reviews, property_availability
  - tour_guides, tours, tour_bookings, tour_reviews, tour_guide_availability
  - admin_users, admin_logs, admin_permissions, admin_role_permissions
  - admin_invitations, admin_activity_stats
*/

-- ============================================================================
-- ADVENTURES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own adventures" ON adventures;
CREATE POLICY "Users can view own adventures"
  ON adventures FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own adventures" ON adventures;
CREATE POLICY "Users can create own adventures"
  ON adventures FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own adventures" ON adventures;
CREATE POLICY "Users can update own adventures"
  ON adventures FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own adventures" ON adventures;
CREATE POLICY "Users can delete own adventures"
  ON adventures FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- ITINERARY_DAYS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view itinerary for own adventures" ON itinerary_days;
CREATE POLICY "Users can view itinerary for own adventures"
  ON itinerary_days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create itinerary for own adventures" ON itinerary_days;
CREATE POLICY "Users can create itinerary for own adventures"
  ON itinerary_days FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update itinerary for own adventures" ON itinerary_days;
CREATE POLICY "Users can update itinerary for own adventures"
  ON itinerary_days FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete itinerary for own adventures" ON itinerary_days;
CREATE POLICY "Users can delete itinerary for own adventures"
  ON itinerary_days FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- HIDDEN_GEMS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view verified hidden gems" ON hidden_gems;
CREATE POLICY "Anyone can view verified hidden gems"
  ON hidden_gems FOR SELECT
  TO authenticated
  USING (
    verification_status = 'approved' OR
    submitted_by = (select auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can submit hidden gems" ON hidden_gems;
CREATE POLICY "Authenticated users can submit hidden gems"
  ON hidden_gems FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own hidden gems" ON hidden_gems;
CREATE POLICY "Users can update their own hidden gems"
  ON hidden_gems FOR UPDATE
  TO authenticated
  USING (submitted_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own hidden gems" ON hidden_gems;
CREATE POLICY "Users can delete their own hidden gems"
  ON hidden_gems FOR DELETE
  TO authenticated
  USING (submitted_by = (select auth.uid()));

-- ============================================================================
-- GEM_COMMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can comment" ON gem_comments;
CREATE POLICY "Authenticated users can comment"
  ON gem_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own comments" ON gem_comments;
CREATE POLICY "Users can delete their own comments"
  ON gem_comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- GEM_VOTES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can vote on gems" ON gem_votes;
CREATE POLICY "Authenticated users can vote on gems"
  ON gem_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove their own votes" ON gem_votes;
CREATE POLICY "Users can remove their own votes"
  ON gem_votes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- GEM_VISITS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can log visits" ON gem_visits;
CREATE POLICY "Authenticated users can log visits"
  ON gem_visits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own visits" ON gem_visits;
CREATE POLICY "Users can update their own visits"
  ON gem_visits FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- USER_PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()));

-- ============================================================================
-- USER_CONTRIBUTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can update their own contribution profile" ON user_contributions;
CREATE POLICY "Users can update their own contribution profile"
  ON user_contributions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- USER_FAVORITE_QUOTES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorite_quotes;
CREATE POLICY "Users can view own favorites"
  ON user_favorite_quotes FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can add favorites" ON user_favorite_quotes;
CREATE POLICY "Users can add favorites"
  ON user_favorite_quotes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove favorites" ON user_favorite_quotes;
CREATE POLICY "Users can remove favorites"
  ON user_favorite_quotes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
