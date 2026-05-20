/*
  # Fix User Contribution Stats Function - Column Name

  1. Changes
    - Update sync_user_contribution_stats to use correct column name
    - Change gems_submitted to gems_discovered
    - Maintain same functionality

  2. Purpose
    - Fix error when inserting hidden gems
    - Ensure trigger works correctly with actual schema
*/

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

  -- Skip if no user_id (system inserts)
  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.user_contributions
  SET
    gems_discovered = (
      SELECT COUNT(*)
      FROM public.hidden_gems
      WHERE submitted_by = v_user_id
    ),
    gems_verified = (
      SELECT COUNT(*)
      FROM public.hidden_gems
      WHERE submitted_by = v_user_id
      AND verification_status IN ('verified', 'featured')
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

COMMENT ON FUNCTION public.sync_user_contribution_stats IS 'Syncs user contribution statistics using correct column names (gems_discovered, gems_verified)';
