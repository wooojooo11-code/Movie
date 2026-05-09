import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseRatingsTable = import.meta.env.VITE_SUPABASE_RATINGS_TABLE?.trim() || 'ratings';
export const supabaseRatingsUserColumn =
  import.meta.env.VITE_SUPABASE_RATINGS_USER_COLUMN?.trim() || 'user_id';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
  : null;
