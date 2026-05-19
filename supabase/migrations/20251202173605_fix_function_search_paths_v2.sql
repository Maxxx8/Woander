/*
  # Fix Function Search Paths (Version 2)

  1. Changes
    - Drop and recreate all functions with immutable search_path
    - Prevents search_path hijacking attacks
    - Explicitly set to 'public, pg_catalog'
    - Improves security and performance

  2. Functions Updated
    - update_updated_at_column
    - initialize_user_data
    - update_gem_vote_count
    - update_gem_visit_count
    - sync_user_contribution_stats
    - update_user_stats_on_gem_change

  3. Security
    - Prevents search_path manipulation attacks
    - Ensures functions use correct schema
    - No functional changes to logic
*/

-- ============================================================================
-- FIX: update_updated_at_column
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger if it was dropped
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = pg_tables.tablename
      AND column_name = 'updated_at'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    ', r.tablename, r.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- FIX: initialize_user_data
-- ============================================================================

DROP FUNCTION IF EXISTS public.initialize_user_data() CASCADE;

CREATE FUNCTION public.initialize_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_contributions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in initialize_user_data: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_data();

-- ============================================================================
-- FIX: update_gem_vote_count
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_gem_vote_count() CASCADE;

CREATE FUNCTION public.update_gem_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.hidden_gems
    SET total_votes = total_votes + 1
    WHERE id = NEW.gem_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.hidden_gems
    SET total_votes = GREATEST(total_votes - 1, 0)
    WHERE id = OLD.gem_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_vote_count_on_insert ON public.gem_votes;
CREATE TRIGGER update_vote_count_on_insert
  AFTER INSERT ON public.gem_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gem_vote_count();

DROP TRIGGER IF EXISTS update_vote_count_on_delete ON public.gem_votes;
CREATE TRIGGER update_vote_count_on_delete
  AFTER DELETE ON public.gem_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gem_vote_count();

-- ============================================================================
-- FIX: update_gem_visit_count
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_gem_visit_count() CASCADE;

CREATE FUNCTION public.update_gem_visit_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.hidden_gems
  SET total_visits = total_visits + 1
  WHERE id = NEW.gem_id;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_visit_count_on_insert ON public.gem_visits;
CREATE TRIGGER update_visit_count_on_insert
  AFTER INSERT ON public.gem_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gem_visit_count();

-- ============================================================================
-- FIX: sync_user_contribution_stats
-- ============================================================================

DROP FUNCTION IF EXISTS public.sync_user_contribution_stats() CASCADE;

CREATE FUNCTION public.sync_user_contribution_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_user_id := NEW.submitted_by;
  ELSIF TG_OP = 'DELETE' THEN
    v_user_id := OLD.submitted_by;
  ELSE
    RETURN NEW;
  END IF;

  UPDATE public.user_contributions
  SET
    gems_submitted = (
      SELECT COUNT(*)
      FROM public.hidden_gems
      WHERE submitted_by = v_user_id
    ),
    gems_verified = (
      SELECT COUNT(*)
      FROM public.hidden_gems
      WHERE submitted_by = v_user_id
      AND verification_status = 'verified'
    )
  WHERE user_id = v_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS sync_contribution_stats_on_insert ON public.hidden_gems;
CREATE TRIGGER sync_contribution_stats_on_insert
  AFTER INSERT ON public.hidden_gems
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_contribution_stats();

DROP TRIGGER IF EXISTS sync_contribution_stats_on_delete ON public.hidden_gems;
CREATE TRIGGER sync_contribution_stats_on_delete
  AFTER DELETE ON public.hidden_gems
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_contribution_stats();

-- ============================================================================
-- FIX: update_user_stats_on_gem_change
-- ============================================================================

DROP FUNCTION IF EXISTS public.update_user_stats_on_gem_change() CASCADE;

CREATE FUNCTION public.update_user_stats_on_gem_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.verification_status != NEW.verification_status THEN
    UPDATE public.user_contributions
    SET
      gems_verified = (
        SELECT COUNT(*)
        FROM public.hidden_gems
        WHERE submitted_by = NEW.submitted_by
        AND verification_status = 'verified'
      )
    WHERE user_id = NEW.submitted_by;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_user_stats_on_verification ON public.hidden_gems;
CREATE TRIGGER update_user_stats_on_verification
  AFTER UPDATE ON public.hidden_gems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_on_gem_change();

-- ============================================================================
-- Add comments documenting the security fix
-- ============================================================================

COMMENT ON FUNCTION public.update_updated_at_column IS 'Automatically updates updated_at timestamp. Search path fixed for security.';
COMMENT ON FUNCTION public.initialize_user_data IS 'Initializes user profile and contributions on signup. Search path fixed for security.';
COMMENT ON FUNCTION public.update_gem_vote_count IS 'Updates gem vote count on vote insert/delete. Search path fixed for security.';
COMMENT ON FUNCTION public.update_gem_visit_count IS 'Updates gem visit count on visit insert. Search path fixed for security.';
COMMENT ON FUNCTION public.sync_user_contribution_stats IS 'Syncs user contribution statistics. Search path fixed for security.';
COMMENT ON FUNCTION public.update_user_stats_on_gem_change IS 'Updates user stats when gem verification changes. Search path fixed for security.';
