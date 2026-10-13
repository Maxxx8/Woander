/*
# Insert tour package via RPC to bypass stale PostgREST schema cache

PostgREST's schema cache does not recognize the new marketplace columns
on the `tours` table (accommodation_type, transport_type, meals_included,
etc.), causing insert failures with errors like:
"Could not find the 'accommodation_type' column of 'tours' in the schema cache"

NOTIFY pgrst reload did not resolve the issue. This SECURITY DEFINER
function performs the insert server-side where all columns are visible,
matching the proven pattern already used by `insert_worthy_place`.

1. Security
   - SECURITY DEFINER so it runs with database privileges.
   - Checks that the caller is authenticated.
   - Creates a minimal tour_guides profile if the user doesn't have one,
     then inserts the tour row with the provided guide_id.
   - Granted to the authenticated role only.

2. Data Safety
   No existing data is modified or deleted. Only inserts a new row
   into `tours` and optionally into `tour_guides`.
*/

CREATE OR REPLACE FUNCTION public.insert_tour_package(
  p_guide_id uuid,
  p_title text,
  p_description text,
  p_tour_type text DEFAULT 'adventure',
  p_duration_hours numeric DEFAULT 4,
  p_duration_days integer DEFAULT NULL,
  p_price_per_person numeric DEFAULT 0,
  p_currency text DEFAULT 'INR',
  p_max_group_size integer DEFAULT 10,
  p_min_group_size integer DEFAULT 1,
  p_difficulty_level text DEFAULT 'moderate',
  p_booking_type text DEFAULT 'enquiry',
  p_featured_image text DEFAULT NULL,
  p_location_city text DEFAULT '',
  p_location_state text DEFAULT '',
  p_destination text DEFAULT NULL,
  p_accommodation_type text DEFAULT NULL,
  p_transport_type text DEFAULT NULL,
  p_meals_included text[] DEFAULT ARRAY[]::text[],
  p_equipment_included text[] DEFAULT ARRAY[]::text[],
  p_guide_included boolean DEFAULT true,
  p_included_items text[] DEFAULT ARRAY[]::text[],
  p_excluded_items text[] DEFAULT ARRAY[]::text[],
  p_cancellation_policy text DEFAULT '',
  p_pricing_notes text DEFAULT NULL,
  p_itinerary jsonb DEFAULT '[]'::jsonb,
  p_operator_name text DEFAULT NULL,
  p_operator_instagram text DEFAULT NULL,
  p_operator_website text DEFAULT NULL,
  p_operator_phone text DEFAULT NULL,
  p_operator_email text DEFAULT NULL,
  p_package_status text DEFAULT 'draft'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  final_guide_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to list a tour.'
      USING ERRCODE = '42501';
  END IF;

  -- Verify the guide belongs to the caller
  final_guide_id := p_guide_id;

  IF final_guide_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = final_guide_id
        AND tour_guides.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Invalid guide profile.'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    -- Create a minimal guide profile if none exists
    INSERT INTO tour_guides (user_id, full_name, status, is_active, location_city, location_state, email, phone)
    VALUES (auth.uid(), COALESCE(p_operator_name, 'Independent Operator'), 'approved', true, p_location_city, p_location_state, p_operator_email, p_operator_phone)
    RETURNING id INTO final_guide_id;
  END IF;

  INSERT INTO public.tours (
    guide_id, title, description, tour_type,
    duration_hours, duration_days, price_per_person, currency,
    max_group_size, min_group_size, difficulty_level,
    booking_type, featured_image,
    location_city, location_state, destination,
    accommodation_type, transport_type,
    meals_included, equipment_included, guide_included,
    included_items, excluded_items,
    cancellation_policy, pricing_notes, itinerary,
    operator_name, operator_instagram, operator_website,
    operator_phone, operator_email,
    is_operator_verified, package_status, is_active
  )
  VALUES (
    final_guide_id, p_title, p_description, p_tour_type,
    p_duration_hours, p_duration_days, p_price_per_person, p_currency,
    p_max_group_size, p_min_group_size, p_difficulty_level,
    p_booking_type, p_featured_image,
    p_location_city, p_location_state, p_destination,
    p_accommodation_type, p_transport_type,
    p_meals_included, p_equipment_included, p_guide_included,
    p_included_items, p_excluded_items,
    p_cancellation_policy, p_pricing_notes, p_itinerary,
    p_operator_name, p_operator_instagram, p_operator_website,
    p_operator_phone, p_operator_email,
    false, p_package_status, true
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_tour_package TO authenticated;
