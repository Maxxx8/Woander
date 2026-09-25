/*
# Restore image storage for Worthy Places submissions

1. Purpose
   Restores the `gem-images` storage bucket required when a contributor
   uploads a photo while adding a Worthy Place to the record.

2. Storage Bucket
   - `gem-images` (public read access)
   - Maximum file size: 5 MB
   - Accepted types: JPEG, JPG, PNG, WEBP, and GIF

3. Security
   - Authenticated contributors may upload only into a folder named with
     their own authenticated user ID.
   - Anyone may read images because published Worthy Place photos are public.
   - Contributors may update or delete only files in their own folder.
   - Policies are recreated idempotently so this migration is safe to retry.

4. Data Safety
   This migration creates a missing storage bucket and access policies only.
   It does not remove, overwrite, or delete any application data.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gem-images',
  'gem-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can upload gem images" ON storage.objects;
CREATE POLICY "Authenticated users can upload gem images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gem-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Anyone can view gem images" ON storage.objects;
CREATE POLICY "Anyone can view gem images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gem-images');

DROP POLICY IF EXISTS "Users can update own gem images" ON storage.objects;
CREATE POLICY "Users can update own gem images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gem-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'gem-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own gem images" ON storage.objects;
CREATE POLICY "Users can delete own gem images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gem-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
