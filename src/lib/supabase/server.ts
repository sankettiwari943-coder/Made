import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

export interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export function createClient() {
  const cookieStore = cookies();
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  const supabaseUrl = isConfigured ? url : url || 'https://placeholder.supabase.co';
  const supabaseAnonKey = isConfigured ? anonKey : anonKey || 'placeholder-anon-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Server-only service role client for elevated administrative actions (e.g. role assignment)
 * NEVER expose to the browser.
 */
export function createServiceClient() {
  const { url, serviceRoleKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured || !serviceRoleKey) {
    return createClient();
  }

  return createServerClient(url, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
