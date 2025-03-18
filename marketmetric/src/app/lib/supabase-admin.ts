import { createClient } from '@supabase/supabase-js';

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
} else {
  // Basic validation of service role key format
  try {
    // Check if it looks like a JWT (3 parts separated by dots)
    const parts = supabaseServiceRoleKey.split('.');
    if (parts.length !== 3) {
      console.error('SUPABASE_SERVICE_ROLE_KEY does not appear to be in valid JWT format (should have 3 parts)');
    } else {
      // Check if middle part (payload) can be decoded
      try {
        const payloadStr = Buffer.from(parts[1], 'base64').toString();
        const payload = JSON.parse(payloadStr);
        
        // Check for role claim
        if (payload.role !== 'service_role') {
          console.error('Warning: SUPABASE_SERVICE_ROLE_KEY does not contain service_role in payload');
        } else {
          console.log('Service role key appears to be formatted correctly');
        }
      } catch (e) {
        console.error('SUPABASE_SERVICE_ROLE_KEY payload cannot be decoded, may be invalid:', e);
      }
    }
  } catch (e) {
    console.error('Error validating service role key format:', e);
  }
}

// Initialize the Supabase admin client with service role key for admin operations
// This should only be used server-side
const supabaseAdmin = createClient(
  supabaseUrl!,
  supabaseServiceRoleKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('Supabase Admin URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('Supabase Service Role Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);

export default supabaseAdmin; 