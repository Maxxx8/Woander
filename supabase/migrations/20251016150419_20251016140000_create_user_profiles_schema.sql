/*
  # User Profiles & Dashboard Schema

  ## Overview
  This migration creates user profile management for the dashboard feature,
  extending the existing user_contributions table with personal profile data.

  ## New Tables

  ### `user_profiles`
  Personal profile information for users
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `display_name` (text) - User's display name
  - `bio` (text) - User biography
  - `avatar_url` (text) - Profile picture URL
  - `location` (text) - User's location
  - `joined_at` (timestamptz) - Account creation date
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on user_profiles table
  - Anyone can view public profiles
  - Users can only update their own profile
  - Automatically create profile on user signup

  ## Important Notes
  1. Profiles are public by default to enable community features
  2. Links with existing user_contributions table for metrics
  3. Triggers automatically initialize profiles and contributions on signup
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name text,
  bio text DEFAULT '',
  avatar_url text,
  location text DEFAULT '',
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user profile and contributions on signup
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (user_id, display_name, joined_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.created_at
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user contributions record
  INSERT INTO user_contributions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize user data on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Function to update user contribution stats
CREATE OR REPLACE FUNCTION sync_user_contribution_stats()
RETURNS void AS $$
BEGIN
  -- Update gems_discovered count
  UPDATE user_contributions uc
  SET gems_discovered = (
    SELECT COUNT(*) FROM hidden_gems hg
    WHERE hg.submitted_by = uc.user_id
  );

  -- Update gems_verified count
  UPDATE user_contributions uc
  SET gems_verified = (
    SELECT COUNT(*) FROM hidden_gems hg
    WHERE hg.submitted_by = uc.user_id
    AND hg.verification_status IN ('verified', 'featured')
  );

  -- Update total_votes_received
  UPDATE user_contributions uc
  SET total_votes_received = (
    SELECT COALESCE(SUM(hg.total_votes), 0)
    FROM hidden_gems hg
    WHERE hg.submitted_by = uc.user_id
  );

  -- Update explorer level based on contribution score
  UPDATE user_contributions
  SET explorer_level = LEAST(10, GREATEST(1,
    1 + (gems_verified / 5) + (total_votes_received / 20)
  ));
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update contribution stats when gems change
CREATE OR REPLACE FUNCTION update_user_stats_on_gem_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Update the submitter's stats
    UPDATE user_contributions
    SET
      gems_discovered = (
        SELECT COUNT(*) FROM hidden_gems
        WHERE submitted_by = NEW.submitted_by
      ),
      gems_verified = (
        SELECT COUNT(*) FROM hidden_gems
        WHERE submitted_by = NEW.submitted_by
        AND verification_status IN ('verified', 'featured')
      ),
      total_votes_received = (
        SELECT COALESCE(SUM(total_votes), 0) FROM hidden_gems
        WHERE submitted_by = NEW.submitted_by
      )
    WHERE user_id = NEW.submitted_by;

    -- Update explorer level
    UPDATE user_contributions
    SET explorer_level = LEAST(10, GREATEST(1,
      1 + (gems_verified / 5) + (total_votes_received / 20)
    ))
    WHERE user_id = NEW.submitted_by;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    -- Update the submitter's stats after deletion
    UPDATE user_contributions
    SET
      gems_discovered = (
        SELECT COUNT(*) FROM hidden_gems
        WHERE submitted_by = OLD.submitted_by
      ),
      gems_verified = (
        SELECT COUNT(*) FROM hidden_gems
        WHERE submitted_by = OLD.submitted_by
        AND verification_status IN ('verified', 'featured')
      ),
      total_votes_received = (
        SELECT COALESCE(SUM(total_votes), 0) FROM hidden_gems
        WHERE submitted_by = OLD.submitted_by
      )
    WHERE user_id = OLD.submitted_by;

    -- Update explorer level
    UPDATE user_contributions
    SET explorer_level = LEAST(10, GREATEST(1,
      1 + (gems_verified / 5) + (total_votes_received / 20)
    ))
    WHERE user_id = OLD.submitted_by;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when gems are created, updated, or deleted
DROP TRIGGER IF EXISTS sync_contribution_stats_on_gem_change ON hidden_gems;
CREATE TRIGGER sync_contribution_stats_on_gem_change
AFTER INSERT OR UPDATE OR DELETE ON hidden_gems
FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_gem_change();
