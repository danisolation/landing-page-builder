import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const locales = ['vi', 'en'];
const defaultLocale = 'vi';

// Admin paths that require locale prefix
const adminPaths = ['/login', '/dashboard', '/pages'];

function getLocaleFromPathname(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

function isAdminPath(pathname: string): boolean {
  return adminPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Public pages (no locale prefix) — allow through without redirect
  if (!pathnameHasLocale) {
    if (isAdminPath(pathname)) {
      // Admin routes without locale → redirect to locale-prefixed version
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
    // Public page — no locale needed
    return NextResponse.next();
  }

  // From here: pathname has locale prefix (admin routes)
  const locale = getLocaleFromPathname(pathname);

  // Auth logic
  const token = request.cookies.get('token')?.value;

  // Define known routes
  const isLoginPage = pathname.match(/^\/(vi|en)\/login$/);
  const isRootPage = pathname.match(/^\/(vi|en)$/);
  const isDashboard = pathname.match(/^\/(vi|en)\/dashboard/);
  const isPagesRoute = pathname.match(/^\/(vi|en)\/pages/);

  // Public routes: login page (anything that's not dashboard/pages)
  const isPublicRoute = isLoginPage || (!isDashboard && !isPagesRoute && !isRootPage);

  // If not authenticated and not a public route → redirect to login
  if (!token && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // If authenticated and on login page → redirect to dashboard
  if (token && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // If on root locale page, redirect to dashboard or login
  if (isRootPage) {
    const url = request.nextUrl.clone();
    url.pathname = token ? `/${locale}/dashboard` : `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files
    '/((?!_next|.*\\..*).*)',
  ],
};
