import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Protection against placeholder strings in env file to prevent client initialization crash
const validUrl = supabaseUrl && !supabaseUrl.startsWith('your_') ? supabaseUrl : 'https://placeholder-project.supabase.co';
const validKey = supabaseAnonKey && !supabaseAnonKey.startsWith('your_') ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey);

/**
 * Creates a server-side Supabase client with administrative privileges
 * using the private service role key. Useful for backend OAuth callback & sync API routes.
 */
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const validServiceKey = serviceKey && !serviceKey.startsWith('your_') ? serviceKey : 'placeholder-service-key';
  
  return createClient(validUrl, validServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
