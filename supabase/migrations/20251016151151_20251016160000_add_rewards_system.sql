/*
  # Rewards and Badges System

  ## Overview
  This migration adds a comprehensive rewards system with achievement badges
  that users can earn through various activities and milestones.

  ## New Tables

  ### `user_badges`
  Individual badges earned by users
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `badge_type` (text) - Type of badge earned
  - `badge_name` (text) - Display name of badge
  - `badge_description` (text) - What the badge is for
  - `earned_at` (timestamptz) - When badge was earned
  - `metadata` (jsonb) - Additional badge data

  ## Badge Types
  - first_gem: Discovered first hidden gem
  - gem_master_5: Discovered 5 gems
  - gem_master_10: Discovered 10 gems
  - gem_master_25: Discovered 25 gems
  - explorer_verified: First gem verified
  - top_rated: Received 50+ votes
  - community_star: Received 100+ votes
  - adventure_starter: Created first adventure
  - globetrotter: Created 5+ adventures
  - world_traveler: Created 10+ adventures
  - social_butterfly: Made 25+ comments
  - level_5: Reached explorer level 5
  - level_10: Reached max explorer level

  ## Security
  - Enable RLS on user_badges table
  - Users can view all badges
  - Only system can create badges (through triggers)

  ## Important Notes
  1. Badges are automatically awarded through database triggers
  2. Each badge can only be earned once per user
  3. Badge metadata stores additional contextual information
*/

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, badge_type)
);

-- Enable Row Level Security
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_badges
CREATE POLICY "Anyone can view badges"
  ON user_badges FOR SELECT
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type);

-- Function to award badges based on user achievements
CREATE OR REPLACE FUNCTION award_user_badges(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_gems_count integer;
  v_verified_count integer;
  v_votes_count integer;
  v_adventures_count integer;
  v_comments_count integer;
  v_explorer_level integer;
BEGIN
  -- Get current stats
  SELECT
    COALESCE((SELECT COUNT(*) FROM hidden_gems WHERE submitted_by = p_user_id), 0),
    COALESCE((SELECT COUNT(*) FROM hidden_gems WHERE submitted_by = p_user_id AND verification_status IN ('verified', 'featured')), 0),
    COALESCE((SELECT total_votes_received FROM user_contributions WHERE user_id = p_user_id), 0),
    COALESCE((SELECT COUNT(*) FROM adventures WHERE user_id = p_user_id), 0),
    COALESCE((SELECT COUNT(*) FROM gem_comments WHERE user_id = p_user_id), 0),
    COALESCE((SELECT explorer_level FROM user_contributions WHERE user_id = p_user_id), 1)
  INTO v_gems_count, v_verified_count, v_votes_count, v_adventures_count, v_comments_count, v_explorer_level;

  -- Award gem discovery badges
  IF v_gems_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'first_gem', 'First Discovery', 'Discovered your first hidden gem', jsonb_build_object('count', v_gems_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_gems_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'gem_master_5', 'Gem Finder', 'Discovered 5 hidden gems', jsonb_build_object('count', v_gems_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_gems_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'gem_master_10', 'Gem Collector', 'Discovered 10 hidden gems', jsonb_build_object('count', v_gems_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_gems_count >= 25 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'gem_master_25', 'Gem Master', 'Discovered 25 hidden gems', jsonb_build_object('count', v_gems_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award verification badges
  IF v_verified_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'explorer_verified', 'Verified Explorer', 'Had your first gem verified', jsonb_build_object('count', v_verified_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award vote badges
  IF v_votes_count >= 50 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'top_rated', 'Top Rated', 'Received 50+ votes on your gems', jsonb_build_object('votes', v_votes_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_votes_count >= 100 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'community_star', 'Community Star', 'Received 100+ votes on your gems', jsonb_build_object('votes', v_votes_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award adventure badges
  IF v_adventures_count >= 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'adventure_starter', 'Adventure Starter', 'Created your first adventure', jsonb_build_object('count', v_adventures_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_adventures_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'globetrotter', 'Globetrotter', 'Created 5+ adventures', jsonb_build_object('count', v_adventures_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_adventures_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'world_traveler', 'World Traveler', 'Created 10+ adventures', jsonb_build_object('count', v_adventures_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award social badges
  IF v_comments_count >= 25 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'social_butterfly', 'Social Butterfly', 'Made 25+ comments', jsonb_build_object('count', v_comments_count))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award level badges
  IF v_explorer_level >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'level_5', 'Rising Explorer', 'Reached explorer level 5', jsonb_build_object('level', v_explorer_level))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_explorer_level >= 10 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, metadata)
    VALUES (p_user_id, 'level_10', 'Master Explorer', 'Reached max explorer level', jsonb_build_object('level', v_explorer_level))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to award badges when user stats change
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Award badges for the affected user
  IF (TG_TABLE_NAME = 'hidden_gems') THEN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
      PERFORM award_user_badges(NEW.submitted_by);
    END IF;
  ELSIF (TG_TABLE_NAME = 'adventures') THEN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
      PERFORM award_user_badges(NEW.user_id);
    END IF;
  ELSIF (TG_TABLE_NAME = 'gem_comments') THEN
    IF (TG_OP = 'INSERT') THEN
      PERFORM award_user_badges(NEW.user_id);
    END IF;
  ELSIF (TG_TABLE_NAME = 'user_contributions') THEN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
      PERFORM award_user_badges(NEW.user_id);
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to award badges automatically
DROP TRIGGER IF EXISTS award_badges_on_gem_change ON hidden_gems;
CREATE TRIGGER award_badges_on_gem_change
AFTER INSERT OR UPDATE ON hidden_gems
FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();

DROP TRIGGER IF EXISTS award_badges_on_adventure_change ON adventures;
CREATE TRIGGER award_badges_on_adventure_change
AFTER INSERT OR UPDATE ON adventures
FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();

DROP TRIGGER IF EXISTS award_badges_on_comment ON gem_comments;
CREATE TRIGGER award_badges_on_comment
AFTER INSERT ON gem_comments
FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();

DROP TRIGGER IF EXISTS award_badges_on_contribution_update ON user_contributions;
CREATE TRIGGER award_badges_on_contribution_update
AFTER INSERT OR UPDATE ON user_contributions
FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
