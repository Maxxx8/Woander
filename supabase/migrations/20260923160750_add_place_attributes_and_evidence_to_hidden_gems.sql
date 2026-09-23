/*
# Add place attributes and evidence labels to hidden_gems

1. Purpose
   Transforms "Hidden Gems" into "Worthy Places" by adding two optional
   metadata columns that let contributors tag a place with its character
   (historical, cultural, natural, etc.) and the type of evidence behind
   what we know about it.

2. New Columns (on existing `hidden_gems` table)
   - `place_attributes` (jsonb, default '[]')
     An array of attribute tags describing the nature of the place.
     Possible values: "historical", "archaeological", "cultural",
     "natural", "living_heritage", "ancestral", "community", "hidden".
     Multiple attributes can apply simultaneously.
   - `evidence_labels` (jsonb, default '[]')
     An array of evidence-type tags describing how we know what we know.
     Possible values: "archaeologically_documented", "officially_documented",
     "scholarly_interpretation", "community_memory", "explorer_observation",
     "unverified".

3. Data Safety
   Both columns are nullable with default '[]'. No existing data is
   modified or lost. No column types are changed. No tables are dropped.

4. Security
   No RLS policy changes. The existing policies on `hidden_gems` already
   govern all CRUD operations. These columns inherit those policies
   automatically.

5. Important Notes
   - Both columns are optional; the UI only shows attributes/evidence
     when the array is non-empty.
   - The frontend will send these as arrays in the insert/update payload.
   - Existing rows get '[]' by default, so they simply show no tags.
*/

ALTER TABLE hidden_gems
  ADD COLUMN IF NOT EXISTS place_attributes jsonb DEFAULT '[]'::jsonb;

ALTER TABLE hidden_gems
  ADD COLUMN IF NOT EXISTS evidence_labels jsonb DEFAULT '[]'::jsonb;
