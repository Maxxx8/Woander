/*
  # Add Missing Foreign Key Indexes

  1. Indexes Added
    - `idx_gem_comments_user_id` on gem_comments(user_id)
    - `idx_gem_visits_user_id` on gem_visits(user_id)

  2. Purpose
    - Improve query performance for foreign key lookups
    - Optimize JOIN operations on user_id columns
    - Support efficient CASCADE operations

  3. Security
    - No RLS policy changes
    - Performance optimization only
*/

-- Add index for gem_comments.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_gem_comments_user_id
ON public.gem_comments(user_id);

-- Add index for gem_visits.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_gem_visits_user_id
ON public.gem_visits(user_id);

-- Add comment explaining the indexes
COMMENT ON INDEX idx_gem_comments_user_id IS 'Index to support foreign key constraint gem_comments_user_id_fkey';
COMMENT ON INDEX idx_gem_visits_user_id IS 'Index to support foreign key constraint gem_visits_user_id_fkey';
