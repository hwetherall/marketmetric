import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/app/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Ensure it's a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }
    
    // Generate a unique file name
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `reports/${fileName}`;
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('Attempting upload with admin client...');
    
    // Upload to Supabase with admin privileges
    const { data, error } = await supabaseAdmin.storage
      .from('market-reports')
      .upload(filePath, arrayBuffer, {
        contentType: 'application/pdf',
      });
    
    if (error) {
      console.error('Admin upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Try to diagnose auth status
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.getSession();
        console.log('Auth status:', authError ? 'Error' : 'Success');
        console.log('Auth error:', authError);
      } catch (authCheckErr) {
        console.error('Error checking auth status:', authCheckErr);
      }
      
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }
    
    // Return success with file path
    return NextResponse.json({ 
      success: true, 
      filePath: data.path,
      fileName: file.name 
    });
    
  } catch (error) {
    console.error('Server upload error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during upload' 
    }, { status: 500 });
  }
} 