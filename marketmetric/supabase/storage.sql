-- Create a storage bucket for market reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-reports', 'market-reports', false);

-- Allow authenticated users to upload and download their files
CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'market-reports');

CREATE POLICY "Allow users to access their files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'market-reports' AND auth.uid() = owner);

CREATE POLICY "Allow users to update their files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'market-reports' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete their files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'market-reports' AND auth.uid() = owner); 