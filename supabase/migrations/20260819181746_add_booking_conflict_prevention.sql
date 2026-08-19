-- Partial unique index: one active booking per (guide, date, time).
-- Only covers bookings that are not cancelled/rejected, so the slot is freed when a booking is cancelled.
CREATE UNIQUE INDEX IF NOT EXISTS tour_bookings_guide_date_time_active_idx
  ON public.tour_bookings (guide_id, booking_date, booking_time)
  WHERE status IN ('pending', 'confirmed', 'completed');

-- Check whether a specific (guide, date, time) slot is bookable.
-- Runs as the table owner so it can see ALL bookings for the guide,
-- not just the caller's own (RLS would otherwise hide other users' bookings).
-- Read-only: only counts rows, exposes no booking details.
CREATE OR REPLACE FUNCTION public.check_booking_slot_available(
  p_guide_id uuid,
  p_booking_date date,
  p_booking_time time
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.tour_bookings
    WHERE guide_id = p_guide_id
      AND booking_date = p_booking_date
      AND booking_time = p_booking_time
      AND status IN ('pending', 'confirmed', 'completed')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.check_booking_slot_available(uuid, date, time) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_booking_slot_available(uuid, date, time) TO authenticated;

-- Return the list of booked time slots for a guide on a given date.
-- Also runs as owner so a booking user can see which slots are taken by others.
-- Returns only the times and a coarse status, no customer info.
CREATE OR REPLACE FUNCTION public.get_booked_time_slots(
  p_guide_id uuid,
  p_booking_date date
)
RETURNS TABLE (booking_time time, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT booking_time, status
  FROM public.tour_bookings
  WHERE guide_id = p_guide_id
    AND booking_date = p_booking_date
    AND status IN ('pending', 'confirmed', 'completed');
$$;

REVOKE EXECUTE ON FUNCTION public.get_booked_time_slots(uuid, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_booked_time_slots(uuid, date) TO authenticated;
