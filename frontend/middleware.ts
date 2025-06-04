import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be protected (require authentication)
const protectedPaths = ['/dashboard', '/lessons', '/speaking', '/progress', '/achievements'];
// Add paths that should be accessible only to non-authenticated users
const authPaths = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  // Check if the path is an auth path (login/signup)
  const isAuthPath = authPaths.some(path => pathname === path);

  // If trying to access protected path without token, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access auth paths with token, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 