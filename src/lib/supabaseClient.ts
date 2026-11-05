import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the Supabase Client.
 * Gracefully warns if environment variables are not yet provided.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. ' +
        'Real-time shared cart will operate in local fallback state.'
      );
    }
    return null;
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return clientInstance;
}

