/*
  # Create Storage Bucket for Gem Images

  ## Overview
  Creates a storage bucket for user-uploaded hidden gem images with proper
  security policies.

  ## Changes
  1. Create 'gem-images' storage bucket
  2. Enable public access for uploaded images
  3. Set up RLS policies for upload and access

  ## Security
  - Authenticated users can upload images to their own folder
  - Anyone can view uploaded images (public bucket)
  - Users can only delete their own images
*/

-- Create storage bucket for gem images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gem-images',
  'gem-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload gem images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gem-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view gem images (public bucket)
CREATE POLICY "Anyone can view gem images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gem-images');

-- Policy: Users can update their own images
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

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own gem images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gem-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
