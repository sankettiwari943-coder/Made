import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal next routes bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const { response, user, isConfigured } = await updateSession(request);

  // If Supabase is not configured, allow public views and let client component render config screen on auth paths
  if (!isConfigured) {
    return response;
  }

  const isProtectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings');

  const isAuthPath =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/join' ||
    pathname === '/register' ||
    pathname === '/sign-in' ||
    pathname === '/auth/sign-up';

  // 1. Protected route guard: Redirect unauthenticated requests to /login
  if (isProtectedPath && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Forward any refreshed session cookies to the redirect response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // 2. Auth route guard: Redirect already authenticated users away from login/signup/join/register
  if (isAuthPath && user) {
    const redirectResponse = NextResponse.redirect(new URL('/workspace', request.url));
    // Forward any refreshed session cookies to the redirect response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
