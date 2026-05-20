/*
  # Security Fix: Optimize RLS Policies - Properties & Tours (Part 3)

  Continues RLS optimization for property and tour-related tables.
*/

-- ============================================================================
-- PROPERTY_LISTINGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own properties" ON property_listings;
CREATE POLICY "Users can view own properties"
  ON property_listings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create properties" ON property_listings;
CREATE POLICY "Authenticated users can create properties"
  ON property_listings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own properties" ON property_listings;
CREATE POLICY "Users can update own properties"
  ON property_listings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own properties" ON property_listings;
CREATE POLICY "Users can delete own properties"
  ON property_listings FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PROPERTY_AVAILABILITY TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Property owners can manage availability" ON property_availability;
CREATE POLICY "Property owners can manage availability"
  ON property_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = property_availability.property_id
      AND property_listings.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PROPERTY_BOOKINGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own bookings" ON property_bookings;
CREATE POLICY "Users can view own bookings"
  ON property_bookings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Property owners can view their property bookings" ON property_bookings;
CREATE POLICY "Property owners can view their property bookings"
  ON property_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = property_bookings.property_id
      AND property_listings.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create bookings" ON property_bookings;
CREATE POLICY "Authenticated users can create bookings"
  ON property_bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own bookings" ON property_bookings;
CREATE POLICY "Users can update own bookings"
  ON property_bookings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PROPERTY_REVIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON property_reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON property_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own reviews" ON property_reviews;
CREATE POLICY "Users can update own reviews"
  ON property_reviews FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own reviews" ON property_reviews;
CREATE POLICY "Users can delete own reviews"
  ON property_reviews FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TOUR_GUIDES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own guide profile" ON tour_guides;
CREATE POLICY "Users can view own guide profile"
  ON tour_guides FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create guide profile" ON tour_guides;
CREATE POLICY "Authenticated users can create guide profile"
  ON tour_guides FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own guide profile" ON tour_guides;
CREATE POLICY "Users can update own guide profile"
  ON tour_guides FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TOURS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Approved guides can create tours" ON tours;
CREATE POLICY "Approved guides can create tours"
  ON tours FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = (select auth.uid())
      AND tour_guides.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Guides can update own tours" ON tours;
CREATE POLICY "Guides can update own tours"
  ON tours FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Guides can delete own tours" ON tours;
CREATE POLICY "Guides can delete own tours"
  ON tours FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TOUR_BOOKINGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own bookings" ON tour_bookings;
CREATE POLICY "Users can view own bookings"
  ON tour_bookings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Guides can view their tour bookings" ON tour_bookings;
CREATE POLICY "Guides can view their tour bookings"
  ON tour_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tours
      JOIN tour_guides ON tours.guide_id = tour_guides.id
      WHERE tours.id = tour_bookings.tour_id
      AND tour_guides.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create bookings" ON tour_bookings;
CREATE POLICY "Authenticated users can create bookings"
  ON tour_bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own bookings" ON tour_bookings;
CREATE POLICY "Users can update own bookings"
  ON tour_bookings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Guides can update their tour bookings" ON tour_bookings;
CREATE POLICY "Guides can update their tour bookings"
  ON tour_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tours
      JOIN tour_guides ON tours.guide_id = tour_guides.id
      WHERE tours.id = tour_bookings.tour_id
      AND tour_guides.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TOUR_REVIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can create reviews for completed bookings" ON tour_reviews;
CREATE POLICY "Users can create reviews for completed bookings"
  ON tour_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own reviews" ON tour_reviews;
CREATE POLICY "Users can update own reviews"
  ON tour_reviews FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Guides can respond to their tour reviews" ON tour_reviews;
CREATE POLICY "Guides can respond to their tour reviews"
  ON tour_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tours
      JOIN tour_guides ON tours.guide_id = tour_guides.id
      WHERE tours.id = tour_reviews.tour_id
      AND tour_guides.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TOUR_GUIDE_AVAILABILITY TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Guides can manage own availability" ON tour_guide_availability;
CREATE POLICY "Guides can manage own availability"
  ON tour_guide_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_guide_availability.guide_id
      AND tour_guides.user_id = (select auth.uid())
    )
  );
