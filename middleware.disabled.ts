import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================
// cMart Platform — Next.js Middleware
// Handles:
//   1. Subdomain detection  → e-commerce storefront
//   2. Route protection      → auth + role enforcement
// ============================================================

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'cmart.lk';

// Routes that don't need auth
const PUBLIC_ROUTES = ['/', '/about', '/services', '/pricing', '/portfolio', '/contact', '/blog', '/forgot-password'];
const AUTH_ROUTES = ['/login', '/register'];

// Role → allowed route prefixes
// TODO: In the future, we need to restrict specific /employee/* sub-routes 
// (e.g., products, sales) based on the individual employee's permissions. 
// Currently, ANY user with the EMPLOYEE role has full access to ALL /employee/* pages for testing.
const ROLE_ROUTES: Record<string, string[]> = {
  super_admin: ['/admin'],
  STORE_OWNER: ['/owner'],
  EMPLOYEE: ['/employee'],
};

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // ─────────────────────────────────────────────────────────
  // 1. SUBDOMAIN DETECTION — e-commerce storefront
  // If hostname is *.cmart.lk → serve storefront
  // ─────────────────────────────────────────────────────────
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isSubdomain =
    !isLocalhost &&
    hostname.endsWith(`.${PLATFORM_DOMAIN}`) &&
    hostname !== `www.${PLATFORM_DOMAIN}` &&
    hostname !== PLATFORM_DOMAIN;

  if (isSubdomain) {
    const subdomain = hostname.replace(`.${PLATFORM_DOMAIN}`, '');
    // Rewrite to storefront handler, pass subdomain as header
    const url = request.nextUrl.clone();
    url.pathname = `/storefront${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set('x-store-subdomain', subdomain);
    return response;
  }

  // ─────────────────────────────────────────────────────────
  // 2. ROUTE PROTECTION
  // ─────────────────────────────────────────────────────────

  // Skip static files and API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/storefront') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public marketing routes — always accessible
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // Get auth token from cookie
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const userType = request.cookies.get('userType')?.value;

  // Auth routes — redirect if already logged in
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (token && userRole) {
      const redirectPath =
        userType === 'super_admin'
          ? '/admin/dashboard'
          : userRole === 'STORE_OWNER'
            ? '/owner/dashboard'
            : '/employee/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // Protected dashboard routes — require auth
  const isDashboardRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/owner') ||
    pathname.startsWith('/employee');

  if (isDashboardRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role enforcement
    const effectiveRole = userType === 'super_admin' ? 'super_admin' : userRole;
    const allowedPrefixes = ROLE_ROUTES[effectiveRole ?? ''] || [];
    const hasAccess = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (!hasAccess) {
      // Wrong role → redirect to their dashboard
      const correctDashboard =
        effectiveRole === 'super_admin'
          ? '/admin/dashboard'
          : effectiveRole === 'STORE_OWNER'
            ? '/owner/dashboard'
            : '/employee/dashboard';
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
