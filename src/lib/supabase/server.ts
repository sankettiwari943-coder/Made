import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

export function createClient() {
  const cookieStore = cookies();
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return createServerClient(
      url || 'https://placeholder.supabase.co',
      anonKey || 'placeholder-anon-key',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {}
          },
        },
      }
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {}
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
      get() {
        return undefined;
      },
      set() {},
      remove() {},
    },
  });
}
