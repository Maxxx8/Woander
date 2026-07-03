ALTER TABLE tour_guides
  ADD COLUMN IF NOT EXISTS archetype text,
  ADD COLUMN IF NOT EXISTS hidden_gems_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS field_notes_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hosted_gems text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sample_field_notes text[] DEFAULT '{}';
