import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Retrieves a file from Supabase storage
 * @param filePath The path to the file in storage
 * @returns The file as an ArrayBuffer
 */
export async function getFileFromStorage(filePath: string): Promise<ArrayBuffer | null> {
  try {
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