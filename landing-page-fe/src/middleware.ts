import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes - không cần auth
  const publicRoutes = ['/login', '/pages/'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Nếu chưa đăng nhập và không phải public route → redirect về login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu đã đăng nhập và vào login → redirect về dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
