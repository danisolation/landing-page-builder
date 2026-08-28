'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Breadcrumbs() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'vi';
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  const pathSegments = pathWithoutLocale.split('/').filter(Boolean);

  // Filter out "pages" segment and UUID segments (not real navigable pages)
  const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  const pathNames: Record<string, string> = {
    sections: t('sections'),
    new: t('createNew'),
    edit: t('editPage'),
  };

  // Keep original indices so href is built from pathSegments (correct URL)
  const visibleSegments = pathSegments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => segment !== 'pages' && !isUUID(segment));

  const breadcrumbs = visibleSegments.map(({ segment, index }, i) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = pathNames[segment] || segment;
    const isLast = i === visibleSegments.length - 1;
    return { href, label, isLast };
  });

  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="px-1.5 py-0.5 rounded hover:text-foreground hover:bg-accent transition-colors"
      >
        {t('dashboard')}
      </Link>

      {breadcrumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {crumb.isLast ? (
            <span className="px-1.5 py-0.5 text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="px-1.5 py-0.5 rounded hover:text-foreground hover:bg-accent transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
