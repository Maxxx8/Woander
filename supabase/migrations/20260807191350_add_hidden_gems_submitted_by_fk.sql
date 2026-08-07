/*
# Add foreign key from hidden_gems.submitted_by to user_profiles.user_id

## Problem
The hidden_gems table has a `submitted_by` column (uuid) that stores the
auth.users id of the user who submitted the gem. However, there is no foreign
key constraint linking it to user_profiles.user_id. Without this constraint,
PostgREST (the Supabase API layer) cannot resolve nested joins like
`user_profiles!hidden_gems_submitted_by_fkey(display_name, avatar_url)`.

## Changes
1. Add FK constraint: hidden_gems.submitted_by → user_profiles.user_id
   (ON DELETE SET NULL, so deleting a user profile doesn't delete their gems).

## Security
- No RLS changes. The FK is purely for join resolution.
- Existing rows with submitted_by = NULL are unaffected (NULL FKs are allowed).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'hidden_gems_submitted_by_fkey'
      AND table_name = 'hidden_gems'
  ) THEN
    ALTER TABLE hidden_gems
      ADD CONSTRAINT hidden_gems_submitted_by_fkey
      FOREIGN KEY (submitted_by) REFERENCES user_profiles(user_id)
      ON DELETE SET NULL;
  END IF;
END $$;
