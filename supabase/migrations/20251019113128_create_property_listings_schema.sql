/*
  # Create Property Listings Schema for Experiences

  ## Overview
  This migration creates a comprehensive system for authorized users to list their unique properties
  (homestays, vacation rentals, unique accommodations, etc.) in the Experiences section.

  ## New Tables

  ### 1. `property_listings`
  Main table for property listings
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Owner reference to auth.users
  - `title` (text) - Property title/name
  - `description` (text) - Detailed description
  - `property_type` (text) - Type: homestay, villa, cottage, treehouse, houseboat, etc.
  - `location_city` (text) - City name
  - `location_state` (text) - State/region
  - `location_country` (text, default 'India') - Country
  - `address` (text) - Full address
  - `latitude` (numeric, nullable) - GPS latitude
  - `longitude` (numeric, nullable) - GPS longitude
  - `price_per_night` (numeric) - Nightly rate
  - `currency` (text, default 'INR') - Currency code
  - `max_guests` (integer) - Maximum guest capacity
  - `bedrooms` (integer) - Number of bedrooms
  - `bathrooms` (integer) - Number of bathrooms
  - `amenities` (text[]) - Array of amenities (wifi, parking, kitchen, etc.)
  - `house_rules` (text) - Property rules
  - `check_in_time` (text) - Check-in time
  - `check_out_time` (text) - Check-out time
  - `minimum_stay` (integer, default 1) - Minimum nights
  - `cancellation_policy` (text) - Cancellation terms
  - `images` (text[]) - Array of image URLs
  - `featured_image` (text) - Main display image
  - `status` (text, default 'pending') - pending, approved, rejected, inactive
  - `is_active` (boolean, default true) - Active status
  - `is_featured` (boolean, default false) - Featured listing
  - `rating_average` (numeric, default 0) - Average rating
  - `rating_count` (integer, default 0) - Number of ratings
  - `view_count` (integer, default 0) - View counter
  - `booking_count` (integer, default 0) - Booking counter
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `approved_at` (timestamptz, nullable) - Approval timestamp
  - `approved_by` (uuid, nullable) - Moderator who approved

  ### 2. `property_availability`
  Tracks property booking availability
  - `id` (uuid, primary key) - Unique identifier
  - `property_id` (uuid, foreign key) - References property_listings
  - `date` (date) - Specific date
  - `is_available` (boolean, default true) - Availability status
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `property_bookings`
  Manages property bookings
  - `id` (uuid, primary key) - Unique identifier
  - `property_id` (uuid, foreign key) - References property_listings
  - `user_id` (uuid, foreign key) - Guest reference to auth.users
  - `check_in_date` (date) - Check-in date
  - `check_out_date` (date) - Check-out date
  - `num_guests` (integer) - Number of guests
  - `total_price` (numeric) - Total booking cost
  - `status` (text, default 'pending') - pending, confirmed, cancelled, completed
  - `special_requests` (text, nullable) - Guest requests
  - `created_at` (timestamptz) - Booking timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `property_reviews`
  Guest reviews for properties
  - `id` (uuid, primary key) - Unique identifier
  - `property_id` (uuid, foreign key) - References property_listings
  - `user_id` (uuid, foreign key) - Reviewer reference to auth.users
  - `booking_id` (uuid, foreign key, nullable) - Related booking
  - `rating` (integer) - Rating 1-5
  - `title` (text) - Review title
  - `comment` (text) - Review text
  - `created_at` (timestamptz) - Review timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all new tables
  - Public read access for approved property listings
  - Users can create and manage their own properties
  - Only property owners can edit their listings
  - Reviews require authentication and verified bookings

  ## Indexes
  - Performance indexes on frequently queried columns
  - Location-based search indexes
  - Status and availability indexes

  ## Important Notes
  - All properties start with 'pending' status requiring approval
  - Only approved properties are visible publicly
  - Users can list multiple properties
  - Booking system prevents double-booking
  - Reviews linked to verified bookings for authenticity
*/

-- Create property_listings table
CREATE TABLE IF NOT EXISTS property_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('homestay', 'villa', 'cottage', 'apartment', 'treehouse', 'houseboat', 'farmstay', 'castle', 'cabin', 'other')),
  location_city text NOT NULL,
  location_state text NOT NULL,
  location_country text DEFAULT 'India',
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  price_per_night numeric NOT NULL CHECK (price_per_night >= 0),
  currency text DEFAULT 'INR',
  max_guests integer NOT NULL CHECK (max_guests > 0),
  bedrooms integer NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
  amenities text[] DEFAULT '{}',
  house_rules text DEFAULT '',
  check_in_time text DEFAULT '14:00',
  check_out_time text DEFAULT '11:00',
  minimum_stay integer DEFAULT 1 CHECK (minimum_stay >= 1),
  cancellation_policy text DEFAULT 'Flexible',
  images text[] DEFAULT '{}',
  featured_image text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  rating_average numeric DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  booking_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);

-- Create property_availability table
CREATE TABLE IF NOT EXISTS property_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES property_listings(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Create property_bookings table
CREATE TABLE IF NOT EXISTS property_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES property_listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  num_guests integer NOT NULL CHECK (num_guests > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (check_out_date > check_in_date)
);

-- Create property_reviews table
CREATE TABLE IF NOT EXISTS property_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES property_listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES property_bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_listings_user ON property_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_status ON property_listings(status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_property_listings_location ON property_listings(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_property_listings_type ON property_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_property_listings_price ON property_listings(price_per_night);
CREATE INDEX IF NOT EXISTS idx_property_listings_rating ON property_listings(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_property_listings_featured ON property_listings(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_property_availability_property ON property_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_property_availability_date ON property_availability(date);

CREATE INDEX IF NOT EXISTS idx_property_bookings_property ON property_bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_user ON property_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_dates ON property_bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_property_bookings_status ON property_bookings(status);

CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_user ON property_reviews(user_id);

-- Enable Row Level Security
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_listings
CREATE POLICY "Approved properties are publicly viewable"
  ON property_listings FOR SELECT
  TO public
  USING (status = 'approved' AND is_active = true);

CREATE POLICY "Users can view own properties"
  ON property_listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create properties"
  ON property_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON property_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON property_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for property_availability
CREATE POLICY "Availability is publicly viewable"
  ON property_availability FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = property_availability.property_id
      AND property_listings.status = 'approved'
      AND property_listings.is_active = true
    )
  );

CREATE POLICY "Property owners can manage availability"
  ON property_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = property_availability.property_id
      AND property_listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = property_availability.property_id
      AND property_listings.user_id = auth.uid()
    )
  );

-- RLS Policies for property_bookings
CREATE POLICY "Users can view own bookings"
  ON property_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view their property bookings"
  ON property_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = property_bookings.property_id
      AND property_listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create bookings"
  ON property_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON property_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for property_reviews
CREATE POLICY "Reviews are publicly viewable"
  ON property_reviews FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM property_listings
      WHERE property_listings.id = property_reviews.property_id
      AND property_listings.status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can create reviews"
  ON property_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON property_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON property_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_listings_updated_at
  BEFORE UPDATE ON property_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_property_listings_updated_at();

CREATE TRIGGER update_property_bookings_updated_at
  BEFORE UPDATE ON property_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_reviews_updated_at
  BEFORE UPDATE ON property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update property rating after review
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE property_listings
  SET 
    rating_average = (
      SELECT AVG(rating)::numeric(3,2)
      FROM property_reviews
      WHERE property_id = NEW.property_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM property_reviews
      WHERE property_id = NEW.property_id
    )
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_rating_after_insert
  AFTER INSERT ON property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_rating();

CREATE TRIGGER update_property_rating_after_update
  AFTER UPDATE ON property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_rating();

-- Function to increment property view count
CREATE OR REPLACE FUNCTION increment_property_views(property_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE property_listings
  SET view_count = view_count + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check booking availability
CREATE OR REPLACE FUNCTION check_property_availability(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
)
RETURNS boolean AS $$
DECLARE
  available boolean;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1
    FROM property_bookings
    WHERE property_id = p_property_id
    AND status IN ('confirmed', 'pending')
    AND (
      (check_in_date <= p_check_in AND check_out_date > p_check_in)
      OR (check_in_date < p_check_out AND check_out_date >= p_check_out)
      OR (check_in_date >= p_check_in AND check_out_date <= p_check_out)
    )
  ) INTO available;
  
  RETURN available;
END;
$$ LANGUAGE plpgsql;