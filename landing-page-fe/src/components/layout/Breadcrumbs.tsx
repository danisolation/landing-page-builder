'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map pathname sang tên hiển thị
const pathNames: Record<string, string> = {
  dashboard: 'Dashboard',
  pages: 'Pages',
  new: 'Tạo mới',
  edit: 'Chỉnh sửa',
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Tạo breadcrumbs từ pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = pathNames[segment] || segment;
    const isLast = index === pathSegments.length - 1;

    return { href, label, isLast };
  });

  // Không hiển thị breadcrumbs ở trang login hoặc dashboard
  if (pathname === '/login' || pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link href="/dashboard" className="hover:text-blue-600">
        Dashboard
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center space-x-2">
          <span>/</span>
          {crumb.isLast ? (
            <span className="text-gray-800 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-blue-600">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
