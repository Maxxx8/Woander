/*
# Insert Worthy Place via RPC to bypass stale PostgREST schema cache

The PostgREST schema cache doesn't recognize the `place_attributes` and
`evidence_labels` columns on `hidden_gems`, causing insert failures.
This SECURITY DEFINER function performs the insert server-side, where
the columns are visible, and returns the new row's id.

1. Security
   - SECURITY DEFINER so it runs with database privileges, bypassing
     the PostgREST schema cache validation.
   - The function checks that the caller is authenticated and that
     `submitted_by` matches their auth.uid(), preserving the same
     ownership invariant the RLS policy enforced.
   - Granted to the authenticated role only.

2. Data Safety
   No existing data is modified or deleted. The function only inserts
   a single new row into `hidden_gems`.
*/

CREATE OR REPLACE FUNCTION public.insert_worthy_place(
  p_title text,
  p_description text,
  p_location text,
  p_latitude numeric,
  p_longitude numeric,
  p_category text,
  p_difficulty_level text,
  p_image_url text,
  p_best_time_to_visit text,
  p_tips text,
  p_submitted_by uuid,
  p_place_attributes jsonb DEFAULT '[]'::jsonb,
  p_evidence_labels jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to add a place.'
      USING ERRCODE = '42501';
  END IF;

  IF auth.uid() != p_submitted_by THEN
    RAISE EXCEPTION 'You can only submit places as yourself.'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.hidden_gems (
    title, description, location, latitude, longitude,
    category, difficulty_level, image_url,
    best_time_to_visit, tips, submitted_by,
    verification_status, place_attributes, evidence_labels
  )
  VALUES (
    p_title, p_description, p_location, p_latitude, p_longitude,
    p_category, p_difficulty_level, p_image_url,
    p_best_time_to_visit, p_tips, p_submitted_by,
    'pending', p_place_attributes, p_evidence_labels
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_worthy_place TO authenticated;
