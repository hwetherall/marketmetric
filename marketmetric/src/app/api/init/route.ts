import { NextResponse } from 'next/server';
import supabaseAdmin from '@/app/lib/supabase-admin';

export async function GET() {
  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return NextResponse.json({ error: 'Failed to check bucket existence' }, { status: 500 });
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'market-reports');
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabaseAdmin.storage.createBucket('market-reports', {
        public: false,  // Not publicly accessible
        fileSizeLimit: 10485760,  // 10MB file size limit
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
      }
      
      // Public access policy is managed in the schema.sql file
      // No need to create policies here as they're already defined
      
      return NextResponse.json({ message: 'Storage bucket created successfully' });
    }
    
    return NextResponse.json({ message: 'Storage bucket already exists' });
  } catch (error) {
    console.error('Error initializing storage:', error);
    return NextResponse.json({ error: 'Failed to initialize storage' }, { status: 500 });
  }
} 