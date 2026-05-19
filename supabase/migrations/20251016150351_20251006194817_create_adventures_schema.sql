/*
  # Create Custom Adventures Schema

  1. New Tables
    - `adventures`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, adventure name)
      - `destination` (text, where to go)
      - `description` (text, adventure description)
      - `start_date` (date, trip start)
      - `end_date` (date, trip end)
      - `total_cost` (numeric, total estimated cost)
      - `currency` (text, default 'USD')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `itinerary_days`
      - `id` (uuid, primary key)
      - `adventure_id` (uuid, references adventures)
      - `day_number` (integer, day of trip)
      - `title` (text, day title)
      - `description` (text, day activities)
      - `accommodation` (text, where staying)
      - `accommodation_cost` (numeric)
      - `activities_cost` (numeric)
      - `meals_cost` (numeric)
      - `transport_cost` (numeric)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only manage their own adventures
    - Users can only manage itinerary days for their adventures
*/

CREATE TABLE IF NOT EXISTS adventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  destination text NOT NULL,
  description text DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_cost numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id uuid REFERENCES adventures(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  accommodation text DEFAULT '',
  accommodation_cost numeric DEFAULT 0,
  activities_cost numeric DEFAULT 0,
  meals_cost numeric DEFAULT 0,
  transport_cost numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own adventures"
  ON adventures FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own adventures"
  ON adventures FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own adventures"
  ON adventures FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own adventures"
  ON adventures FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view itinerary for own adventures"
  ON itinerary_days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create itinerary for own adventures"
  ON itinerary_days FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update itinerary for own adventures"
  ON itinerary_days FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete itinerary for own adventures"
  ON itinerary_days FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM adventures
      WHERE adventures.id = itinerary_days.adventure_id
      AND adventures.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_adventures_user_id ON adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_adventure_id ON itinerary_days(adventure_id);
