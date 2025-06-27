import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that should be protected (require authentication)
const protectedPaths = [
  "/dashboard",
  "/admin",
  "/lessons",
  "/speaking",
  "/progress",
  "/achievements",
];
// Add paths that should be accessible only to non-authenticated users
const authPaths = ["/login", "/signup"];
// Admin-only paths (excluding admin login)
const adminPaths = ["/admin"];
// Admin auth paths that should be accessible to non-authenticated users
const adminAuthPaths = ["/admin/login"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userEmail = request.cookies.get("userEmail")?.value;
  const { pathname } = request.nextUrl;

  console.log("🛡️ Middleware check:", {
    pathname,
    hasToken: !!token,
    hasEmail: !!userEmail,
  });

  // Check if the path is admin auth (should be accessible to non-authenticated users)
  const isAdminAuthPath = adminAuthPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if the path is an auth path (login/signup)
  const isAuthPath = authPaths.some((path) => pathname === path);

  // Check if the path is protected (but exclude admin auth paths)
  const isProtectedPath =
    protectedPaths.some((path) => pathname.startsWith(path)) &&
    !isAdminAuthPath;

  // Check if the path is admin-only (excluding admin login)
  const isAdminPath =
    adminPaths.some((path) => pathname.startsWith(path)) && !isAdminAuthPath;

  console.log("🛡️ Path checks:", {
    isProtectedPath,
    isAuthPath,
    isAdminPath,
    isAdminAuthPath,
  });

  // If trying to access admin routes without token, redirect to admin login
  if (isAdminPath && !token) {
    console.log("🚫 Redirecting to admin login - no token for admin path");
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access other protected paths without token, redirect to student login
  if (isProtectedPath && !token) {
    console.log(
      "🚫 Redirecting to student login - no token for protected path"
    );
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access student auth paths with token, redirect to dashboard
  if (isAuthPath && token) {
    console.log(
      "🔄 Redirecting authenticated user away from student auth path"
    );
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If trying to access admin auth paths with token, redirect based on role
  if (isAdminAuthPath && token) {
    console.log("🔄 Redirecting authenticated user away from admin auth path");
    // The auth context will handle role-based routing
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname.startsWith("/forgot-password/reset")) {
    console.log("✅ Allowing reset password route");
    return NextResponse.next();
  }
  console.log("✅ Middleware allowing request to proceed");
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
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
