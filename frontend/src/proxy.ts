import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/admin', '/profile', '/orders', '/inventory'];
  const authOnlyPaths = ['/login', '/signup', '/forgot-password'];

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthOnlyPath = authOnlyPaths.some((path) => pathname.startsWith(path));

  if (sessionCookie && isAuthOnlyPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!sessionCookie && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/inventory/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
};
