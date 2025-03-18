import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/app/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const results = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
    serviceKeyValid: false,
    serviceKeyFormat: 'unknown',
    bucketExists: false,
    authStatus: 'unknown',
    error: null as string | null
  };
  
  try {
    // Check service key format
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      results.serviceKeyFormat = 'missing';
    } else {
      const parts = serviceKey.split('.');
      if (parts.length !== 3) {
        results.serviceKeyFormat = 'invalid format (not 3 parts)';
      } else {
        try {
          const payloadStr = Buffer.from(parts[1], 'base64').toString();
          const payload = JSON.parse(payloadStr);
          results.serviceKeyFormat = payload.role === 'service_role' ? 
            'appears valid' : `wrong role: ${payload.role}`;
        } catch (e) {
          results.serviceKeyFormat = 'cannot decode payload';
        }
      }
    }
    
    // Check auth status
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.getSession();
      results.authStatus = authError ? 'error' : 'success';
    } catch (authErr) {
      results.authStatus = 'exception';
    }
    
    // Check if bucket exists
    try {
      const { data, error } = await supabaseAdmin.storage.getBucket('market-reports');
      results.bucketExists = !error && !!data;
    } catch (bucketErr) {
      results.bucketExists = false;
    }
    
    return NextResponse.json(results);
  } catch (error) {
    results.error = String(error);
    return NextResponse.json(results, { status: 500 });
  }
} 