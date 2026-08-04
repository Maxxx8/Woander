/*
# Add theme_preference column to user_profiles

## Purpose
Stores each user's day/night display mode preference so it syncs across devices when they sign in.

## Changes
- Adds `theme_preference` column to `user_profiles` table
- Type: text, default 'system' (follows device setting until user explicitly chooses)
- Allowed values: 'day', 'night', 'system'

## Security
- No RLS policy changes needed — existing policies already allow users to update their own profile
  and anyone to read profiles. The new column is covered by those existing policies.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN theme_preference text DEFAULT 'system';
  END IF;
END $$;