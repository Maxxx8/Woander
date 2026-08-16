-- Create tours table (missing from database)
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

-- Create tour_bookings table (missing from database)
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

-- Create tour_reviews table (missing from database)
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

-- Create tour_guide_availability table (missing from database)
CREATE TABLE IF NOT EXISTS tour_guide_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES tour_guides(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(guide_id, date)
);

-- Create indexes
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

-- Enable RLS on new tables
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_guide_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tours
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
CREATE POLICY "Users can view own bookings"
  ON tour_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

CREATE POLICY "Authenticated users can create bookings"
  ON tour_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON tour_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
CREATE POLICY "Anyone can view reviews"
  ON tour_reviews FOR SELECT
  USING (true);

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

CREATE POLICY "Users can update own reviews"
  ON tour_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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