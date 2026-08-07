/*
# Add rejection_reason to hidden_gems

## Purpose
The admin Review Queue writes `rejection_reason` when rejecting a hidden gem submission,
but this column does not exist on the hidden_gems table. Without it, the rejection reason
is silently dropped and the admin/user never sees the feedback.

## Changes
- Adds `rejection_reason` (text, nullable) column to `hidden_gems`.
- No data loss — existing rows get NULL for the new column.

## Security
- No RLS policy changes needed; the column is covered by existing policies.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hidden_gems' AND column_name = 'rejection_reason') THEN
    ALTER TABLE hidden_gems ADD COLUMN rejection_reason text;
  END IF;
END $$;
