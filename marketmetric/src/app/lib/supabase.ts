import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create the Supabase client with explicit options
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Retrieves a file from Supabase storage
 * @param filePath The path to the file in storage
 * @returns The file as an ArrayBuffer
 */
export async function getFileFromStorage(filePath: string): Promise<ArrayBuffer | null> {
  try {
    // Handle local file storage fallback case
    if (filePath.startsWith('local/')) {
      const fileName = filePath.split('/')[1];
      const fileData = sessionStorage.getItem(`file_${fileName}`);
      if (fileData) {
        // Convert base64 back to ArrayBuffer
        const base64 = fileData.split(',')[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
      }
      return null;
    }

    // Regular Supabase storage path
    const { data, error } = await supabase.storage
      .from('market-reports')
      .download(filePath);
    
    if (error) {
      console.error('Error downloading file:', error);
      return null;
    }
    
    return await data.arrayBuffer();
  } catch (error) {
    console.error('Error retrieving file:', error);
    return null;
  }
}

export default supabase; 