import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are populated and valid
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== '' && 
  !supabaseUrl.includes('your-') &&
  supabaseAnonKey && 
  supabaseAnonKey !== '' && 
  !supabaseAnonKey.includes('your-');

let clientInstance: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("⚡ Supabase backend connected successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Supabase:", error);
  }
} else {
  console.log("ℹ️ Supabase credentials missing or blank. Running in offline LocalStorage mode.");
}

export const supabase = clientInstance as any;
export const isLiveBackend = isSupabaseConfigured && clientInstance !== null;
