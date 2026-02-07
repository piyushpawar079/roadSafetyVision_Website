// ===========================================
// MIDDLEWARE
// Handles authentication and route protection
// ===========================================

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/error',
  '/auth/verify',
];

// API routes that don't require session authentication
// These may use API key authentication instead
const publicApiRoutes = [
  '/api/auth',           // NextAuth routes
  '/api/violations/upload', // Jetson Nano upload endpoint
  '/api/health',         // Health check
  '/api/seed',           // Database seeding
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow public routes
    if (publicRoutes.some((route) => pathname === route)) {
      return NextResponse.next();
    }

    // Allow public API routes (they handle their own auth)
    if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check if user is authenticated for protected routes
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control for dashboard routes
    const userRole = token.role as string;

    // Admin-only routes
    const adminOnlyRoutes = ['/dashboard/admin-requests', '/dashboard/users'];
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (!['admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Super admin only routes
    const superAdminOnlyRoutes = ['/dashboard/super-admin'];
    if (superAdminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (userRole !== 'super_admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Admin dashboard access
    if (pathname === '/dashboard/admin' && userRole === 'citizen') {
      return NextResponse.redirect(new URL('/dashboard/citizen', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes without token
        if (publicRoutes.some((route) => pathname === route)) {
          return true;
        }

        // Allow public API routes without token
        if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Require token for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|icons).*)',
  ],
};