// Test script to verify Supabase storage connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

async function testSupabaseStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase credentials in .env.local file');
    return;
  }

  console.log('Supabase URL:', supabaseUrl);
  console.log('Testing Supabase storage connection...');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // List available buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Check if market-reports bucket exists
    const marketReportsBucket = buckets.find(b => b.name === 'market-reports');
    if (!marketReportsBucket) {
      console.error('Error: market-reports bucket does not exist');
      console.log('You need to create the bucket by running the storage.sql script in Supabase');
      return;
    }
    
    // List files in the market-reports bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('market-reports')
      .list('reports');
    
    if (filesError) {
      console.error('Error listing files in market-reports bucket:', filesError);
      return;
    }
    
    console.log('Files in market-reports/reports folder:', files);
    console.log('Supabase storage connection test completed successfully');
    
  } catch (error) {
    console.error('Unexpected error testing Supabase storage:', error);
  }
}

testSupabaseStorage(); 