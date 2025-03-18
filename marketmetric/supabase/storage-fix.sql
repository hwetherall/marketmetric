-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to access their files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to market-reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to market-reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to update files in market-reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to delete files in market-reports" ON storage.objects;

-- Make bucket public
UPDATE storage.buckets SET public = true WHERE id = 'market-reports';

-- Create new public policies
CREATE POLICY "Allow public uploads to market-reports"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'market-reports');

CREATE POLICY "Allow public access to market-reports"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'market-reports');

CREATE POLICY "Allow public to update files in market-reports"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'market-reports');

CREATE POLICY "Allow public to delete files in market-reports"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'market-reports'); 