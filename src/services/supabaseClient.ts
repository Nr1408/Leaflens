import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const extra = (Constants.expoConfig?.extra || Constants.manifest?.extra || {}) as any;
const SUPABASE_URL: string | undefined = extra.SUPABASE_URL;
const SUPABASE_ANON_KEY: string | undefined = extra.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[LeafLens] Supabase config missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in app.json extra.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    persistSession: true,
    storage: {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    },
  },
});

// Auth-only mode: resolve email from username via RPC (server-side function)
export async function getEmailByUsername(username: string): Promise<string | null> {
  const { data, error } = await (supabase as any).rpc('get_email_by_username', {
    p_username: username.trim(),
  });
  if (error) {
    console.warn('[LeafLens][Supabase] getEmailByUsername error:', error);
    return null;
  }
  return (data as string) || null;
}
