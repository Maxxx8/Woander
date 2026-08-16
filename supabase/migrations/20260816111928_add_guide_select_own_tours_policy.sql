-- Allow guides to SELECT their own tours, including inactive ones
-- (the existing "Anyone can view active tours" policy only covers active tours)
CREATE POLICY "Guides can view own tours"
  ON tours FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tour_guides
      WHERE tour_guides.id = tours.guide_id
      AND tour_guides.user_id = auth.uid()
    )
  );