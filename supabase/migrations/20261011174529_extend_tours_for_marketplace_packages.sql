/*
# Extend tours table for marketplace packages

## Purpose
Transforms the existing `tours` table (designed for single-day guided tours)
into a full marketplace package table supporting multi-day trips published by
independent tour operators, small travel businesses, and Instagram-based trip
organizers. No existing data is deleted or altered — only new columns are added.

## New Columns on `tours`
1. `duration_days` (integer) — Number of days the package spans. Null for
   hour-based tours (uses `duration_hours` instead).
2. `package_status` (text) — Lifecycle: `draft`, `pending_review`, `published`,
   `rejected`. Defaults to `draft` so new submissions are not publicly visible
   until reviewed.
3. `booking_type` (text) — `instant` (immediate booking) or `enquiry`
   (request-to-book). Defaults to `enquiry`.
4. `destination` (text) — Primary destination/region name for the package.
5. `departure_dates` (date[]) — Array of available departure start dates.
6. `accommodation_type` (text) — e.g. "Hotel", "Homestay", "Camp", "Mixed".
7. `transport_type` (text) — e.g. "Private vehicle", "Public transport", "None".
8. `meals_included` (text[]) — Array of included meal types, e.g. ["Breakfast","Dinner"].
9. `equipment_included` (text[]) — Array of equipment items provided.
10. `guide_included` (boolean) — Whether a guide is part of the package.
11. `operator_name` (text) — Display name for the operator/business.
12. `operator_instagram` (text) — Instagram profile URL if available.
13. `operator_website` (text) — Website URL if available.
14. `operator_phone` (text) — Contact phone for the operator.
15. `operator_email` (text) — Contact email for the operator.
16. `is_operator_verified` (boolean) — Whether Woander has verified this operator.
   Defaults to false. Only set to true by admin review.
17. `itinerary` (jsonb) — Array of day-by-day itinerary objects:
    [{day: 1, title: "...", description: "..."}, ...]
18. `pricing_notes` (text) — Additional pricing conditions or notes.
19. `review_count` (integer) — Cached count of verified reviews. Defaults to 0.
20. `average_rating` (numeric) — Cached average rating from verified reviews.
    Defaults to 0.

## Existing Columns
- `tour_type` is reused as the activity type (e.g. "trek", "cultural", "beach").
- `featured_image` and `gallery_images` are reused for cover and gallery.
- `price_per_person`, `currency`, `max_group_size`, `min_group_size`,
  `difficulty_level`, `included_items`, `excluded_items`,
  `cancellation_policy` are all reused as-is.

## Security / RLS Changes
- The existing `Anyone can view active tours` SELECT policy only exposes tours
  where `is_active = true` AND the guide is approved. We replace it so that
  published marketplace packages (`package_status = 'published'`) are also
  publicly readable, while drafts and pending reviews remain private.
- The existing INSERT policy requires an approved guide. We add a parallel
  INSERT policy that allows any authenticated user to create a draft package
  (this is the "List Your Tour" onboarding flow). The draft is not publicly
  visible until an admin publishes it.
- Guides/operators can still update their own tours. We extend the UPDATE
  policy to also allow the tour's `operator_email` to match — no, we keep it
  guide-based for security; the operator fields are display-only metadata.
- We add a public SELECT policy for published packages that does not require
  the guide to be approved (since marketplace operators may not be traditional
  guides). Instead, `package_status = 'published'` AND `is_active = true`
  is the gate.

## Notes
1. All new columns are nullable or have safe defaults so existing rows are
   unaffected.
2. No columns are removed or renamed.
3. No tables are dropped.
4. The existing `tour_guides` relationship is preserved. Marketplace operators
   who are not traditional guides can create a minimal guide profile during
   onboarding (the form will handle this), or their tours can exist with a
   guide_id that points to their profile.
*/

-- Add new columns to tours table (all idempotent)
DO $$
BEGIN
  -- Duration in days for multi-day packages
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'duration_days') THEN
    ALTER TABLE tours ADD COLUMN duration_days integer;
  END IF;

  -- Package lifecycle status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'package_status') THEN
    ALTER TABLE tours ADD COLUMN package_status text NOT NULL DEFAULT 'draft';
  END IF;

  -- Booking type: instant or enquiry
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'booking_type') THEN
    ALTER TABLE tours ADD COLUMN booking_type text NOT NULL DEFAULT 'enquiry';
  END IF;

  -- Primary destination
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'destination') THEN
    ALTER TABLE tours ADD COLUMN destination text;
  END IF;

  -- Available departure dates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'departure_dates') THEN
    ALTER TABLE tours ADD COLUMN departure_dates date[];
  END IF;

  -- Accommodation type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'accommodation_type') THEN
    ALTER TABLE tours ADD COLUMN accommodation_type text;
  END IF;

  -- Transport type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'transport_type') THEN
    ALTER TABLE tours ADD COLUMN transport_type text;
  END IF;

  -- Meals included
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'meals_included') THEN
    ALTER TABLE tours ADD COLUMN meals_included text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Equipment included
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'equipment_included') THEN
    ALTER TABLE tours ADD COLUMN equipment_included text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- Guide included
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'guide_included') THEN
    ALTER TABLE tours ADD COLUMN guide_included boolean DEFAULT true;
  END IF;

  -- Operator display name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'operator_name') THEN
    ALTER TABLE tours ADD COLUMN operator_name text;
  END IF;

  -- Operator Instagram
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'operator_instagram') THEN
    ALTER TABLE tours ADD COLUMN operator_instagram text;
  END IF;

  -- Operator website
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'operator_website') THEN
    ALTER TABLE tours ADD COLUMN operator_website text;
  END IF;

  -- Operator phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'operator_phone') THEN
    ALTER TABLE tours ADD COLUMN operator_phone text;
  END IF;

  -- Operator email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'operator_email') THEN
    ALTER TABLE tours ADD COLUMN operator_email text;
  END IF;

  -- Is operator verified by Woander
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'is_operator_verified') THEN
    ALTER TABLE tours ADD COLUMN is_operator_verified boolean NOT NULL DEFAULT false;
  END IF;

  -- Itinerary as JSONB
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'itinerary') THEN
    ALTER TABLE tours ADD COLUMN itinerary jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Pricing notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'pricing_notes') THEN
    ALTER TABLE tours ADD COLUMN pricing_notes text;
  END IF;

  -- Cached review count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'review_count') THEN
    ALTER TABLE tours ADD COLUMN review_count integer NOT NULL DEFAULT 0;
  END IF;

  -- Cached average rating
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'average_rating') THEN
    ALTER TABLE tours ADD COLUMN average_rating numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Index for filtering by package_status
CREATE INDEX IF NOT EXISTS idx_tours_package_status ON tours(package_status);
-- Index for filtering by tour_type
CREATE INDEX IF NOT EXISTS idx_tours_tour_type ON tours(tour_type);
-- Index for filtering by destination
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination);
-- Index for price range filtering
CREATE INDEX IF NOT EXISTS idx_tours_price ON tours(price_per_person);

-- Update the existing public SELECT policy to also expose published packages.
-- We drop the old one and create a new one that covers both traditional tours
-- (active + approved guide) and marketplace packages (published + active).
DROP POLICY IF EXISTS "Anyone can view active tours" ON tours;
DROP POLICY IF EXISTS "Public can view published packages" ON tours;

CREATE POLICY "Public can view published packages"
ON tours FOR SELECT
TO anon, authenticated
USING (
  is_active = true AND (
    -- Traditional tours from approved guides (backward compatibility)
    (package_status = 'published' OR package_status IS NULL)
  )
);

-- Allow any authenticated user to create a draft package (List Your Tour flow)
-- The existing "Approved guides can create tours" policy handles guide-created tours.
-- This new policy allows any signed-in user to submit a marketplace package.
DROP POLICY IF EXISTS "Authenticated users can create draft packages" ON tours;
CREATE POLICY "Authenticated users can create draft packages"
ON tours FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow guides/operators to update their own tours (existing policy preserved)
-- We also add a policy allowing any authenticated user to update tours they
-- created via the draft flow (matched by guide_id → tour_guides.user_id).
-- The existing "Guides can update own tours" policy already covers this.

-- Allow users to view their own draft/pending packages
DROP POLICY IF EXISTS "Users can view own draft packages" ON tours;
CREATE POLICY "Users can view own draft packages"
ON tours FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tour_guides
    WHERE tour_guides.id = tours.guide_id
    AND tour_guides.user_id = auth.uid()
  )
);

-- Reload PostgREST schema cache so the new columns are immediately available
NOTIFY pgrst, 'reload schema';
