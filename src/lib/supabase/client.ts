import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export function createClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return createBrowserClient(
      url || 'https://placeholder.supabase.co',
      anonKey || 'placeholder-anon-key'
    );
  }

  return createBrowserClient(url, anonKey);
}
