import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  if (error) {
    console.error('Supabase Auth callback error:', error, error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const supabase = createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful authentication session established
      const forwardUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/dashboard`;
      return NextResponse.redirect(forwardUrl);
    }

    console.error('Failed to exchange code for session:', exchangeError);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication link is invalid or has expired.')}`);
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/login`);
}
