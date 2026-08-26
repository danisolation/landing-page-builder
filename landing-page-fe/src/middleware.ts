import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const locales = ['vi', 'en'];
const defaultLocale = 'vi';

function getLocaleFromPathname(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale prefix, redirect to the same URL with default locale
  if (!pathnameHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Get the locale from the URL
  const locale = getLocaleFromPathname(pathname);

  // Auth logic
  const token = request.cookies.get('token')?.value;

  // Define known routes that need auth
  const isLoginPage = pathname.match(/^\/(vi|en)\/login$/);
  const isRootPage = pathname.match(/^\/(vi|en)$/);
  const isDashboard = pathname.match(/^\/(vi|en)\/dashboard/);
  const isPagesRoute = pathname.match(/^\/(vi|en)\/pages/);

  // Public routes: login page and [slug] pages (anything that's not dashboard/pages)
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
