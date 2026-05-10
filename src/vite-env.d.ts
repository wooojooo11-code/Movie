/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_RATINGS_SCHEMA?: string;
  readonly VITE_SUPABASE_RATINGS_TABLE?: string;
  readonly VITE_SUPABASE_RATINGS_USER_COLUMN?: string;
  readonly VITE_SUPABASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
