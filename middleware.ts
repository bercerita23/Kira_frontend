import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be protected (require authentication)
const protectedPaths = ['/dashboard', '/admin', '/lessons', '/speaking', '/progress', '/achievements'];
// Add paths that should be accessible only to non-authenticated users
const authPaths = ['/login', '/signup'];
// Admin-only paths
const adminPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userEmail = request.cookies.get('userEmail')?.value;
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  // Check if the path is an auth path (login/signup)
  const isAuthPath = authPaths.some(path => pathname === path);
  // Check if the path is admin-only
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  // If trying to access protected path without token, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access auth paths with token, redirect based on role
  if (isAuthPath && token) {
    // For now, we'll redirect to dashboard by default
    // The actual role-based redirect will happen in the auth context after login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For admin paths, we'll let the component handle role checking
  // since we can't easily access user role in middleware without making API calls

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