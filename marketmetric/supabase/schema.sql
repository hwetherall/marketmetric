-- MarketMetric Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score INTEGER,
  has_publication_date BOOLEAN,
  has_author BOOLEAN,
  has_tam BOOLEAN,
  has_cagr BOOLEAN, 
  has_customer_segments BOOLEAN,
  has_competitive_landscape BOOLEAN,
  has_emerging_tech BOOLEAN,
  has_industry_trends BOOLEAN,
  has_geographic_breakdown BOOLEAN,
  has_regulatory_requirements BOOLEAN
);

-- Storage policies
-- Allow authenticated users to upload files to the 'market-reports' bucket
CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'market-reports');

-- Allow users to access only their own uploaded files
CREATE POLICY "Allow users to access their own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'market-reports' AND auth.uid() = owner);

-- Row Level Security (RLS) for reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own reports
CREATE POLICY "Users can view their own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy to allow users to insert their own reports
CREATE POLICY "Users can insert their own reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());