/*
  # Hidden Gems Schema - Community-Powered Discovery

  ## Overview
  This migration creates the complete database schema for the "Hidden Gems" feature, 
  enabling community-powered discovery of off-the-beaten-path locations with social 
  validation and gamification elements.

  ## New Tables
  
  ### `hidden_gems`
  Core table storing all discovered hidden gem locations
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Name of the hidden gem
  - `description` (text) - Detailed description
  - `location` (text) - Location name/address
  - `latitude` (numeric) - GPS latitude coordinate
  - `longitude` (numeric) - GPS longitude coordinate
  - `category` (text) - Type of gem (cafe, viewpoint, trail, waterfall, etc.)
  - `difficulty_level` (text) - How hard to reach (easy, moderate, challenging)
  - `image_url` (text) - Primary image URL
  - `additional_images` (jsonb) - Array of additional image URLs
  - `best_time_to_visit` (text) - Recommended visiting time
  - `tips` (text) - Insider tips and recommendations
  - `submitted_by` (uuid, foreign key) - User who discovered it
  - `verification_status` (text) - pending, verified, featured
  - `total_votes` (integer) - Aggregated vote count
  - `total_visits` (integer) - Number of users who visited
  - `created_at` (timestamptz) - Discovery timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `gem_votes`
  User voting/reactions on hidden gems
  - `id` (uuid, primary key) - Unique identifier
  - `gem_id` (uuid, foreign key) - Reference to hidden_gems
  - `user_id` (uuid, foreign key) - User who voted
  - `vote_type` (text) - upvote, love, fire, crown (different reaction types)
  - `created_at` (timestamptz) - Vote timestamp

  ### `gem_visits`
  Track user visits to validate gems
  - `id` (uuid, primary key) - Unique identifier
  - `gem_id` (uuid, foreign key) - Reference to hidden_gems
  - `user_id` (uuid, foreign key) - User who visited
  - `visited_at` (timestamptz) - Visit timestamp
  - `visit_notes` (text) - Optional visit notes
  - `visit_photos` (jsonb) - Array of photo URLs from visit

  ### `gem_comments`
  Community comments and discussions
  - `id` (uuid, primary key) - Unique identifier
  - `gem_id` (uuid, foreign key) - Reference to hidden_gems
  - `user_id` (uuid, foreign key) - User who commented
  - `comment_text` (text) - Comment content
  - `created_at` (timestamptz) - Comment timestamp

  ### `user_contributions`
  Gamification tracking for user contributions
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `gems_discovered` (integer) - Count of gems submitted
  - `gems_verified` (integer) - Count of verified gems
  - `total_votes_received` (integer) - Total votes on their gems
  - `explorer_level` (integer) - User level (1-10)
  - `badges` (jsonb) - Array of earned badges
  - `created_at` (timestamptz) - Profile creation
  - `updated_at` (timestamptz) - Last update

  ## Security
  - Enable RLS on all tables
  - Create policies for authenticated users to read all gems
  - Allow users to create their own contributions
  - Only allow users to update/delete their own submissions
  - Allow users to vote/visit/comment if authenticated

  ## Important Notes
  1. Uses JSONB for flexible arrays (images, badges)
  2. Includes geolocation for future map features
  3. Verification system for quality control
  4. Gamification through levels and badges
  5. Social features (votes, comments, visits)
*/

-- Create hidden_gems table
CREATE TABLE IF NOT EXISTS hidden_gems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  category text NOT NULL DEFAULT 'other',
  difficulty_level text DEFAULT 'easy',
  image_url text,
  additional_images jsonb DEFAULT '[]'::jsonb,
  best_time_to_visit text,
  tips text,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verification_status text DEFAULT 'pending',
  total_votes integer DEFAULT 0,
  total_visits integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gem_votes table
CREATE TABLE IF NOT EXISTS gem_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gem_id uuid REFERENCES hidden_gems(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text DEFAULT 'upvote',
  created_at timestamptz DEFAULT now(),
  UNIQUE(gem_id, user_id)
);

-- Create gem_visits table
CREATE TABLE IF NOT EXISTS gem_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gem_id uuid REFERENCES hidden_gems(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visited_at timestamptz DEFAULT now(),
  visit_notes text,
  visit_photos jsonb DEFAULT '[]'::jsonb,
  UNIQUE(gem_id, user_id)
);

-- Create gem_comments table
CREATE TABLE IF NOT EXISTS gem_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gem_id uuid REFERENCES hidden_gems(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_contributions table
CREATE TABLE IF NOT EXISTS user_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gems_discovered integer DEFAULT 0,
  gems_verified integer DEFAULT 0,
  total_votes_received integer DEFAULT 0,
  explorer_level integer DEFAULT 1,
  badges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hidden_gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE gem_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gem_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE gem_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hidden_gems
CREATE POLICY "Anyone can view verified hidden gems"
  ON hidden_gems FOR SELECT
  USING (verification_status IN ('verified', 'featured') OR submitted_by = auth.uid());

CREATE POLICY "Authenticated users can submit hidden gems"
  ON hidden_gems FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own hidden gems"
  ON hidden_gems FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitted_by)
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can delete their own hidden gems"
  ON hidden_gems FOR DELETE
  TO authenticated
  USING (auth.uid() = submitted_by);

-- RLS Policies for gem_votes
CREATE POLICY "Anyone can view gem votes"
  ON gem_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on gems"
  ON gem_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
  ON gem_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for gem_visits
CREATE POLICY "Anyone can view gem visits count"
  ON gem_visits FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can log visits"
  ON gem_visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
  ON gem_visits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for gem_comments
CREATE POLICY "Anyone can view comments"
  ON gem_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON gem_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON gem_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_contributions
CREATE POLICY "Anyone can view contribution stats"
  ON user_contributions FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own contribution profile"
  ON user_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contribution profile"
  ON user_contributions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hidden_gems_category ON hidden_gems(category);
CREATE INDEX IF NOT EXISTS idx_hidden_gems_status ON hidden_gems(verification_status);
CREATE INDEX IF NOT EXISTS idx_hidden_gems_submitted_by ON hidden_gems(submitted_by);
CREATE INDEX IF NOT EXISTS idx_hidden_gems_votes ON hidden_gems(total_votes DESC);
CREATE INDEX IF NOT EXISTS idx_gem_votes_gem_id ON gem_votes(gem_id);
CREATE INDEX IF NOT EXISTS idx_gem_votes_user_id ON gem_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_gem_comments_gem_id ON gem_comments(gem_id);

-- Function to update total_votes on hidden_gems
CREATE OR REPLACE FUNCTION update_gem_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE hidden_gems 
    SET total_votes = total_votes + 1 
    WHERE id = NEW.gem_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE hidden_gems 
    SET total_votes = GREATEST(total_votes - 1, 0)
    WHERE id = OLD.gem_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote counts
DROP TRIGGER IF EXISTS gem_vote_count_trigger ON gem_votes;
CREATE TRIGGER gem_vote_count_trigger
AFTER INSERT OR DELETE ON gem_votes
FOR EACH ROW EXECUTE FUNCTION update_gem_vote_count();

-- Function to update total_visits on hidden_gems
CREATE OR REPLACE FUNCTION update_gem_visit_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE hidden_gems 
    SET total_visits = total_visits + 1 
    WHERE id = NEW.gem_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update visit counts
DROP TRIGGER IF EXISTS gem_visit_count_trigger ON gem_visits;
CREATE TRIGGER gem_visit_count_trigger
AFTER INSERT ON gem_visits
FOR EACH ROW EXECUTE FUNCTION update_gem_visit_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_hidden_gems_updated_at ON hidden_gems;
CREATE TRIGGER update_hidden_gems_updated_at
BEFORE UPDATE ON hidden_gems
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_contributions_updated_at ON user_contributions;
CREATE TRIGGER update_user_contributions_updated_at
BEFORE UPDATE ON user_contributions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();