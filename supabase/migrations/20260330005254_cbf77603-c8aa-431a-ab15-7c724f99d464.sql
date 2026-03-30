
-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow anyone to view property images (public bucket)
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'property-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update own property images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'property-images');

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'property-images');
