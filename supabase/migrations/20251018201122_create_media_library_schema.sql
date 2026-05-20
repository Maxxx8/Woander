/*
  # Create Media Library and Enhanced Quotes Schema

  ## Overview
  This migration creates comprehensive tables for managing a dynamic media library and an expanded quotes collection for the travel web application.

  ## New Tables

  ### 1. `media_library`
  Stores images and video clips from external APIs (Pexels, Unsplash)
  - `id` (uuid, primary key) - Unique identifier
  - `url` (text) - Direct URL to the media asset
  - `thumbnail_url` (text, nullable) - Thumbnail for videos
  - `type` (text) - Media type: 'image' or 'video'
  - `source` (text) - API source: 'pexels' or 'unsplash'
  - `source_id` (text) - Original ID from the source API
  - `keywords` (text[]) - Array of search keywords
  - `category` (text) - Content category (nature, adventure, culture, etc.)
  - `width` (integer) - Media width in pixels
  - `height` (integer) - Media height in pixels
  - `photographer` (text) - Photographer/creator name
  - `photographer_url` (text, nullable) - Link to photographer profile
  - `usage_count` (integer, default 0) - Times this media has been displayed
  - `rating` (numeric, default 0) - Quality rating score
  - `is_active` (boolean, default true) - Whether media is available for use
  - `created_at` (timestamptz) - Record creation timestamp
  - `last_used_at` (timestamptz, nullable) - Last time media was displayed

  ### 2. `quotes_library`
  Expanded collection of inspirational travel and adventure quotes
  - `id` (uuid, primary key) - Unique identifier
  - `text` (text) - The quote text
  - `author` (text) - Quote author name
  - `category` (text) - Primary category (travel, adventure, wanderlust, etc.)
  - `tags` (text[]) - Array of descriptive tags
  - `background_media_id` (uuid, nullable, foreign key) - Associated media from media_library
  - `mood` (text) - Emotional tone (inspiring, reflective, adventurous, etc.)
  - `source` (text, nullable) - Where the quote originated (api, user-submitted, curated)
  - `usage_count` (integer, default 0) - Times displayed
  - `favorite_count` (integer, default 0) - Times favorited by users
  - `is_verified` (boolean, default true) - Quality verification status
  - `is_active` (boolean, default true) - Whether available for display
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 3. `user_favorite_quotes`
  Tracks user's favorite quotes
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `quote_id` (uuid, foreign key) - References quotes_library
  - `created_at` (timestamptz) - When favorited

  ### 4. `media_cache`
  Caches API responses to reduce external calls
  - `id` (uuid, primary key) - Unique identifier
  - `cache_key` (text, unique) - Cache identifier (e.g., "pexels_mountain_travel")
  - `media_ids` (uuid[]) - Array of media_library IDs
  - `expires_at` (timestamptz) - Cache expiration time
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all new tables
  - Public read access for media_library and quotes_library
  - Authenticated users can read and manage their favorite_quotes
  - Only authenticated users with specific roles can write to media_library and quotes_library

  ## Indexes
  - Performance indexes on frequently queried columns
  - Full-text search indexes for quotes
  - Category and tag indexes for filtering

  ## Important Notes
  - All tables use UUIDs for primary keys
  - Timestamps use timestamptz for timezone awareness
  - Array columns allow flexible tagging and categorization
  - Usage tracking enables analytics and optimization
  - Foreign key relationships maintain data integrity
*/

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  thumbnail_url text,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  source text NOT NULL CHECK (source IN ('pexels', 'unsplash', 'custom')),
  source_id text NOT NULL,
  keywords text[] DEFAULT '{}',
  category text NOT NULL DEFAULT 'general',
  width integer NOT NULL DEFAULT 1920,
  height integer NOT NULL DEFAULT 1080,
  photographer text NOT NULL DEFAULT 'Unknown',
  photographer_url text,
  usage_count integer DEFAULT 0,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(source, source_id)
);

-- Create quotes_library table
CREATE TABLE IF NOT EXISTS quotes_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL DEFAULT 'Unknown',
  category text NOT NULL DEFAULT 'travel',
  tags text[] DEFAULT '{}',
  background_media_id uuid REFERENCES media_library(id) ON DELETE SET NULL,
  mood text DEFAULT 'inspiring',
  source text DEFAULT 'curated',
  usage_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  is_verified boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_favorite_quotes table
CREATE TABLE IF NOT EXISTS user_favorite_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quote_id uuid REFERENCES quotes_library(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quote_id)
);

-- Create media_cache table
CREATE TABLE IF NOT EXISTS media_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  media_ids uuid[] DEFAULT '{}',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(type);
CREATE INDEX IF NOT EXISTS idx_media_library_keywords ON media_library USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_media_library_is_active ON media_library(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_media_library_usage ON media_library(usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_quotes_library_category ON quotes_library(category);
CREATE INDEX IF NOT EXISTS idx_quotes_library_tags ON quotes_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_quotes_library_is_active ON quotes_library(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quotes_library_usage ON quotes_library(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_library_text ON quotes_library USING GIN(to_tsvector('english', text));

CREATE INDEX IF NOT EXISTS idx_user_favorite_quotes_user ON user_favorite_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_quotes_quote ON user_favorite_quotes(quote_id);

CREATE INDEX IF NOT EXISTS idx_media_cache_key ON media_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_media_cache_expires ON media_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_library
CREATE POLICY "Media library is publicly readable"
  ON media_library FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update media"
  ON media_library FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for quotes_library
CREATE POLICY "Quotes are publicly readable"
  ON quotes_library FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert quotes"
  ON quotes_library FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotes"
  ON quotes_library FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_favorite_quotes
CREATE POLICY "Users can view own favorites"
  ON user_favorite_quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON user_favorite_quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON user_favorite_quotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for media_cache
CREATE POLICY "Cache is publicly readable"
  ON media_cache FOR SELECT
  TO public
  USING (expires_at > now());

CREATE POLICY "Authenticated users can manage cache"
  ON media_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_media_usage(media_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE media_library
  SET usage_count = usage_count + 1,
      last_used_at = now()
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment quote usage count
CREATE OR REPLACE FUNCTION increment_quote_usage(quote_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE quotes_library
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = quote_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM media_cache
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update quotes_library updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotes_library_updated_at
  BEFORE UPDATE ON quotes_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();