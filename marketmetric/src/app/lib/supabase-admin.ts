import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase admin client with service role key for admin operations
// This should only be used server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_PASSWORD!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabaseAdmin; 