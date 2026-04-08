-- Storage Configuration for Bntec Assets
-- This ensures the product-images bucket is public and has proper RLS policies.

-- 1. Ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- 2. Consolidate RLS Policies for product-images
-- Allow public access to view images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload/manage assets
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
