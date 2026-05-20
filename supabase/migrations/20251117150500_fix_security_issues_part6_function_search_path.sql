/*
  # Security Fix: Function Search Path Security (Part 6)

  1. Issue: Mutable Search Path
    - Functions without explicit search_path are vulnerable
    - Can be exploited by creating malicious schemas
    - Security risk in multi-tenant environments

  2. Solution: Set Immutable Search Path
    - Add `SECURITY DEFINER` where needed
    - Set explicit `search_path` to trusted schemas
    - Prevents search path manipulation attacks

  ## Fixed Functions:
  - update_guide_statistics
  - generate_confirmation_code
  - increment_completed_tours
  - create_admin_user
  - create_first_admin
  - increment_property_views
  - check_property_availability
  - update_gem_vote_count
  - update_gem_visit_count
  - update_updated_at_column
  - sync_user_contribution_stats
  - update_user_stats_on_gem_change
  - increment_media_usage
  - increment_quote_usage
  - clean_expired_cache
  - update_property_listings_updated_at
  - update_property_rating
*/

-- ============================================================================
-- GUIDE STATISTICS FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_guide_statistics()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE tour_guides
  SET
    total_reviews = (
      SELECT COUNT(*) FROM tour_reviews tr
      JOIN tours t ON tr.tour_id = t.id
      WHERE t.guide_id = tour_guides.id
    ),
    average_rating = (
      SELECT AVG(rating) FROM tour_reviews tr
      JOIN tours t ON tr.tour_id = t.id
      WHERE t.guide_id = tour_guides.id
    ),
    updated_at = now()
  WHERE id = (
    SELECT guide_id FROM tours WHERE id = NEW.tour_id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION increment_completed_tours()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE tour_guides
    SET
      completed_tours = completed_tours + 1,
      updated_at = now()
    WHERE id = (
      SELECT guide_id FROM tours WHERE id = NEW.tour_id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- ADMIN FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT DEFAULT 'moderator',
  display_name TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
  VALUES (
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    'authenticated'
  )
  RETURNING id INTO new_user_id;

  INSERT INTO admin_users (id, role, display_name, is_active)
  VALUES (new_user_id, user_role, display_name, true);

  RETURN new_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_first_admin(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  new_admin_id UUID;
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM admin_users;

  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin users already exist. Use create_admin_user() instead.';
  END IF;

  SELECT create_admin_user(admin_email, admin_password, 'super_admin', 'Super Administrator')
  INTO new_admin_id;

  RETURN new_admin_id;
END;
$$;

-- ============================================================================
-- PROPERTY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_property_views()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE property_listings
  SET
    views = views + 1,
    updated_at = now()
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_property_availability(
  property_id_param UUID,
  check_in_param DATE,
  check_out_param DATE
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM property_bookings
    WHERE property_id = property_id_param
    AND status IN ('confirmed', 'pending')
    AND (
      (check_in_date, check_out_date) OVERLAPS (check_in_param, check_out_param)
    )
  ) INTO is_available;

  RETURN is_available;
END;
$$;

CREATE OR REPLACE FUNCTION update_property_listings_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE property_listings
  SET average_rating = (
    SELECT AVG(rating) FROM property_reviews
    WHERE property_id = NEW.property_id
  )
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- GEM FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_gem_vote_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hidden_gems
    SET vote_count = vote_count + 1
    WHERE id = NEW.gem_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hidden_gems
    SET vote_count = vote_count - 1
    WHERE id = OLD.gem_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_gem_visit_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE hidden_gems
  SET visit_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM gem_visits
    WHERE gem_id = NEW.gem_id
  )
  WHERE id = NEW.gem_id;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- USER CONTRIBUTION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_user_contribution_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_contributions (user_id, gems_submitted)
  VALUES (NEW.submitted_by, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET gems_submitted = user_contributions.gems_submitted + 1;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_user_stats_on_gem_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN
    UPDATE user_contributions
    SET gems_approved = gems_approved + 1
    WHERE user_id = NEW.submitted_by;
  ELSIF NEW.verification_status = 'rejected' AND OLD.verification_status = 'approved' THEN
    UPDATE user_contributions
    SET gems_approved = gems_approved - 1
    WHERE user_id = NEW.submitted_by;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- MEDIA AND QUOTE FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_media_usage()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE media_library
  SET usage_count = usage_count + 1
  WHERE id = NEW.background_media_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION increment_quote_usage()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE quotes_library
  SET usage_count = usage_count + 1
  WHERE id = NEW.quote_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM media_cache
  WHERE expires_at < now();
END;
$$;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
