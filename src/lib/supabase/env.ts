/**
 * Supabase Environment Validation Helper
 * Ensures the application detects missing or placeholder keys and triggers the technical configuration state.
 */

export function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  const isConfigured =
    Boolean(url) &&
    Boolean(anonKey) &&
    url !== 'https://your-project-ref.supabase.co' &&
    anonKey !== 'your-supabase-anon-key' &&
    url?.startsWith('https://');

  return {
    url: url || '',
    anonKey: anonKey || '',
    serviceRoleKey: serviceRoleKey || '',
    isConfigured,
  };
}

