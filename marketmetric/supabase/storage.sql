-- Create a storage bucket for market reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-reports', 'market-reports', true);

-- Allow anyone to upload files (no auth required)
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