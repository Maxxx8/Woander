/*
  # Vanguard Tour Guide System Schema

  ## Overview
  Creates a comprehensive tour guide booking platform with approval system, tours, bookings, and reviews.

  ## New Tables

  ### 1. tour_guides
  Stores approved and verified tour guide profiles with qualifications and verification status.
  
  - `id` (uuid, primary key) - Unique guide identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `full_name` (text) - Guide's full name
  - `bio` (text) - Professional biography
  - `profile_image` (text) - Profile photo URL
  - `cover_image` (text) - Cover/banner image URL
  - `languages` (text[]) - Languages spoken
  - `specialties` (text[]) - Tour specialties (cultural, adventure, food, etc.)
  - `years_experience` (integer) - Years of guiding experience
  - `certifications` (jsonb) - Certification details
  - `location_city` (text) - Primary operating city
  - `location_state` (text) - Primary operating state
  - `location_country` (text) - Primary operating country
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email
  - `status` (text) - Application status: pending, approved, rejected, suspended
  - `verification_badges` (text[]) - Earned badges: verified, top_rated, certified, etc.
  - `average_rating` (numeric) - Overall rating average
  - `total_reviews` (integer) - Total number of reviews
  - `total_tours_completed` (integer) - Number of completed tours
  - `response_time_hours` (integer) - Average response time
  - `approval_date` (timestamptz) - When guide was approved
  - `is_active` (boolean) - Whether guide is currently active
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. tours
  Tour offerings created by approved tour guides.
  
  - `id` (uuid, primary key) - Unique tour identifier
  - `guide_id` (uuid, foreign key) - Links to tour_guides
  - `title` (text) - Tour name/title
  - `description` (text) - Detailed tour description
  - `tour_type` (text) - Type: cultural, adventure, food, history, nature, photography, etc.
  - `duration_hours` (numeric) - Tour duration in hours
  - `price_per_person` (numeric) - Price per person
  - `currency` (text) - Currency code (default INR)
  - `max_group_size` (integer) - Maximum participants
  - `min_group_size` (integer) - Minimum participants required
  - `difficulty_level` (text) - Easy, moderate, challenging, expert
  - `meeting_point` (text) - Where tour starts
  - `ending_point` (text) - Where tour ends
  - `included_items` (text[]) - What's included in the price
  - `excluded_items` (text[]) - What's not included
  - `requirements` (text[]) - Requirements for participants
  - `cancellation_policy` (text) - Cancellation terms
  - `featured_image` (text) - Primary tour image
  - `gallery_images` (text[]) - Additional tour photos
  - `location_city` (text) - Tour location city
  - `location_state` (text) - Tour location state
  - `is_active` (boolean) - Whether tour is currently offered
  - `is_featured` (boolean) - Featured tour status
  - `created_at` (timestamptz) - Tour creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. tour_bookings
  Tracks tour reservations and booking status.
  
  - `id` (uuid, primary key) - Unique booking identifier
  - `tour_id` (uuid, foreign key) - Links to tours
  - `guide_id` (uuid, foreign key) - Links to tour_guides
  - `user_id` (uuid, foreign key) - Customer who booked
  - `booking_date` (date) - Date of the tour
  - `booking_time` (time) - Time of the tour
  - `number_of_people` (integer) - Group size
  - `total_price` (numeric) - Total booking cost
  - `currency` (text) - Currency code
  - `status` (text) - pending, confirmed, completed, cancelled, rejected
  - `special_requests` (text) - Customer special requests
  - `customer_name` (text) - Customer name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone
  - `payment_status` (text) - Payment status: pending, paid, refunded
  - `confirmation_code` (text) - Unique booking confirmation code
  - `cancelled_at` (timestamptz) - Cancellation timestamp if applicable
  - `cancellation_reason` (text) - Reason for cancellation
  - `created_at` (timestamptz) - Booking creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. tour_reviews
  Customer reviews and ratings for completed tours.
  
  - `id` (uuid, primary key) - Unique review identifier
  - `booking_id` (uuid, foreign key) - Links to tour_bookings
  - `tour_id` (uuid, foreign key) - Links to tours
  - `guide_id` (uuid, foreign key) - Links to tour_guides
  - `user_id` (uuid, foreign key) - Reviewer
  - `overall_rating` (integer) - Overall rating 1-5
  - `knowledge_rating` (integer) - Guide knowledge rating 1-5
  - `communication_rating` (integer) - Communication rating 1-5
  - `professionalism_rating` (integer) - Professionalism rating 1-5
  - `value_rating` (integer) - Value for money rating 1-5
  - `review_text` (text) - Written review
  - `review_images` (text[]) - Review photos
  - `is_verified_booking` (boolean) - Whether from confirmed booking
  - `helpful_count` (integer) - Number of helpful votes
  - `guide_response` (text) - Guide's response to review
  - `guide_response_at` (timestamptz) - When guide responded
  - `is_featured` (boolean) - Featured review status
  - `created_at` (timestamptz) - Review creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. tour_guide_availability
  Tracks guide availability for bookings.
  
  - `id` (uuid, primary key) - Unique availability identifier
  - `guide_id` (uuid, foreign key) - Links to tour_guides
  - `date` (date) - Availability date
  - `is_available` (boolean) - Whether guide is available
  - `notes` (text) - Notes about availability
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to view approved guides and active tours
  - Add policies for users to manage their own bookings and reviews
  - Add policies for guides to manage their own profiles, tours, and bookings
  - Add admin-level policies for approval system

  ## Indexes
  - Add indexes on foreign keys for performance
  - Add indexes on status and active flags for filtering
  - Add indexes on location fields for geographical searches
  - Add indexes on dates for booking queries
*/

-- Create tour_guides table
CREATE TABLE IF NOT EXISTS tour_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  bio text DEFAULT '',
  profile_image text,
  cover_image text,
  languages text[] DEFAULT ARRAY[]::text[],
  specialties text[] DEFAULT ARRAY[]::text[],
  years_experience integer DEFAULT 0,
  certifications jsonb DEFAULT '[]'::jsonb,
  location_city text DEFAULT '',
  location_state text DEFAULT '',
  location_country text DEFAULT 'India',
  phone text,
  email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  verification_badges text[] DEFAULT ARRAY[]::text[],
  average_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_tours_completed integer DEFAULT 0,
  response_time_hours integer DEFAULT 24,
  approval_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create tours table
CREATE TABLE IF NOT EXISTS tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES tour_guides(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  tour_type text DEFAULT 'cultural' CHECK (tour_type IN ('cultural', 'adventure', 'food', 'history', 'nature', 'photography', 'walking', 'cycling', 'wildlife', 'spiritual', 'other')),
  duration_hours numeric NOT NULL,
  price_per_person numeric NOT NULL,
  currency text DEFAULT 'INR',
  max_group_size integer DEFAULT 10,
  min_group_size integer DEFAULT 1,
  difficulty_level text DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'moderate', 'challenging', 'expert')),
  meeting_point text DEFAULT '',
  ending_point text DEFAULT '',
  included_items text[] DEFAULT ARRAY[]::text[],
  excluded_items text[] DEFAULT ARRAY[]::text[],
  requirements text[] DEFAULT ARRAY[]::text[],
  cancellation_policy text DEFAULT 'Free cancellation up to 24 hours before the tour',
  featured_image text,
  gallery_images text[] DEFAULT ARRAY[]::text[],
  location_city text DEFAULT '',
  location_state text DEFAULT '',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tour_bookings table
CREATE TABLE IF NOT EXISTS tour_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  guide_id uuid REFERENCES tour_guides(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  number_of_people integer NOT NULL CHECK (number_of_people > 0),
  total_price numeric NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
  special_requests text DEFAULT '',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  confirmation_code text UNIQUE,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tour_reviews table
CREATE TABLE IF NOT EXISTS tour_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES tour_bookings(id) ON DELETE CASCADE NOT NULL,
  tour_id uuid REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  guide_id uuid REFERENCES tour_guides(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  knowledge_rating integer NOT NULL CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
  communication_rating integer NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating integer NOT NULL CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  value_rating integer NOT NULL CHECK (value_rating >= 1 AND value_rating <= 5),
  review_text text DEFAULT '',
  review_images text[] DEFAULT ARRAY[]::text[],
  is_verified_booking boolean DEFAULT true,
  helpful_count integer DEFAULT 0,
  guide_response text,
  guide_response_at timestamptz,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(booking_id)
);

-- Create tour_guide_availability table
CREATE TABLE IF NOT EXISTS tour_guide_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES tour_guides(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(guide_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tour_guides_user_id ON tour_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_guides_status ON tour_guides(status);
CREATE INDEX IF NOT EXISTS idx_tour_guides_location ON tour_guides(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_tour_guides_active ON tour_guides(is_active);

CREATE INDEX IF NOT EXISTS idx_tours_guide_id ON tours(guide_id);
CREATE INDEX IF NOT EXISTS idx_tours_type ON tours(tour_type);
CREATE INDEX IF NOT EXISTS idx_tours_location ON tours(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured);

CREATE INDEX IF NOT EXISTS idx_tour_bookings_tour_id ON tour_bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_guide_id ON tour_bookings(guide_id);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_user_id ON tour_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_date ON tour_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_status ON tour_bookings(status);

CREATE INDEX IF NOT EXISTS idx_tour_reviews_guide_id ON tour_reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_tour_id ON tour_reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_user_id ON tour_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_availability_guide_date ON tour_guide_availability(guide_id, date);

-- Enable Row Level Security
ALTER TABLE tour_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_guide_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_guides

-- Anyone can view approved and active tour guides
CREATE POLICY "Anyone can view approved tour guides"
  ON tour_guides FOR SELECT
  USING (status = 'approved' AND is_active = true);

-- Users can view their own guide profile regardless of status
CREATE POLICY "Users can view own guide profile"
  ON tour_guides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can create a guide profile
CREATE POLICY "Authenticated users can create guide profile"
  ON tour_guides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own guide profile
CREATE POLICY "Users can update own guide profile"
  ON tour_guides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tours

-- Anyone can view active tours from approved guides
CREATE POLICY "Anyone can view active tours"
  ON tours FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.status = 'approved'
      AND tour_guides.is_active = true
    )
  );

-- Approved guides can create tours
CREATE POLICY "Approved guides can create tours"
  ON tours FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = auth.uid()
      AND tour_guides.status = 'approved'
    )
  );

-- Guides can update their own tours
CREATE POLICY "Guides can update own tours"
  ON tours FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  );

-- Guides can delete their own tours
CREATE POLICY "Guides can delete own tours"
  ON tours FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  );

-- RLS Policies for tour_bookings

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON tour_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Guides can view bookings for their tours
CREATE POLICY "Guides can view their tour bookings"
  ON tour_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_bookings.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  );

-- Authenticated users can create bookings
CREATE POLICY "Authenticated users can create bookings"
  ON tour_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings"
  ON tour_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Guides can update bookings for their tours
CREATE POLICY "Guides can update their tour bookings"
  ON tour_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_bookings.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_bookings.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  );

-- RLS Policies for tour_reviews

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON tour_reviews FOR SELECT
  USING (true);

-- Users can create reviews for their completed bookings
CREATE POLICY "Users can create reviews for completed bookings"
  ON tour_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tour_bookings
      WHERE tour_bookings.id = tour_reviews.booking_id
      AND tour_bookings.user_id = auth.uid()
      AND tour_bookings.status = 'completed'
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON tour_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Guides can update reviews for their tours (to add responses)
CREATE POLICY "Guides can respond to their tour reviews"
  ON tour_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_reviews.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_reviews.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  );

-- RLS Policies for tour_guide_availability

-- Anyone can view availability for approved guides
CREATE POLICY "Anyone can view guide availability"
  ON tour_guide_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_guide_availability.guide_id
      AND tour_guides.status = 'approved'
      AND tour_guides.is_active = true
    )
  );

-- Guides can manage their own availability
CREATE POLICY "Guides can manage own availability"
  ON tour_guide_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_guide_availability.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tour_guide_availability.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  );

-- Function to update guide statistics when a review is added
CREATE OR REPLACE FUNCTION update_guide_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tour_guides
  SET
    average_rating = (
      SELECT AVG(overall_rating)
      FROM tour_reviews
      WHERE guide_id = NEW.guide_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM tour_reviews
      WHERE guide_id = NEW.guide_id
    ),
    updated_at = now()
  WHERE id = NEW.guide_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update guide statistics on review insert
DROP TRIGGER IF EXISTS trigger_update_guide_statistics ON tour_reviews;
CREATE TRIGGER trigger_update_guide_statistics
  AFTER INSERT ON tour_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_guide_statistics();

-- Function to generate unique confirmation codes
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.confirmation_code = 'VG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate confirmation code on booking insert
DROP TRIGGER IF EXISTS trigger_generate_confirmation_code ON tour_bookings;
CREATE TRIGGER trigger_generate_confirmation_code
  BEFORE INSERT ON tour_bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_confirmation_code();

-- Function to increment completed tours count
CREATE OR REPLACE FUNCTION increment_completed_tours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE tour_guides
    SET
      total_tours_completed = total_tours_completed + 1,
      updated_at = now()
    WHERE id = NEW.guide_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment completed tours count
DROP TRIGGER IF EXISTS trigger_increment_completed_tours ON tour_bookings;
CREATE TRIGGER trigger_increment_completed_tours
  AFTER UPDATE ON tour_bookings
  FOR EACH ROW
  EXECUTE FUNCTION increment_completed_tours();