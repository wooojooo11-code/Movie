import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseRatingsSchema = import.meta.env.VITE_SUPABASE_RATINGS_SCHEMA?.trim() || 'public';
export const supabaseRatingsTable = import.meta.env.VITE_SUPABASE_RATINGS_TABLE?.trim() || 'ratings';
export const supabaseRatingsUserColumn =
  import.meta.env.VITE_SUPABASE_RATINGS_USER_COLUMN?.trim() || 'user_id';
export const supabaseUserListsSchema = import.meta.env.VITE_SUPABASE_USER_LISTS_SCHEMA?.trim() || 'public';
export const supabaseUserListsTable =
  import.meta.env.VITE_SUPABASE_USER_LISTS_TABLE?.trim() || 'user_lists';
export const supabaseUserListsUserColumn =
  import.meta.env.VITE_SUPABASE_USER_LISTS_USER_COLUMN?.trim() || 'user_id';
export const supabaseListInteractionsSchema =
  import.meta.env.VITE_SUPABASE_LIST_INTERACTIONS_SCHEMA?.trim() || 'public';
export const supabaseListInteractionsTable =
  import.meta.env.VITE_SUPABASE_LIST_INTERACTIONS_TABLE?.trim() || 'list_interactions';
export const supabaseListInteractionsUserColumn =
  import.meta.env.VITE_SUPABASE_LIST_INTERACTIONS_USER_COLUMN?.trim() || 'user_id';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
  : null;

export const getSupabaseRatingsRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseRatingsSchema).from(supabaseRatingsTable);
};

export const getSupabaseUserListsRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseUserListsSchema).from(supabaseUserListsTable);
};

export const getSupabaseListInteractionsRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseListInteractionsSchema).from(supabaseListInteractionsTable);
};
