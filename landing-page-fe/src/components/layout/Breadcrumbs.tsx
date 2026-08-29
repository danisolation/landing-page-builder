'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export interface BreadcrumbsProps {
  pageTitle?: string;
}

interface Crumb {
  label: string;
  href?: string; // undefined = current page (not clickable)
}

export default function Breadcrumbs({ pageTitle }: BreadcrumbsProps) {
  const t = useTranslations('nav');
  const tAria = useTranslations('aria');
  const tEditor = useTranslations('sectionEditor');
  const tNewPage = useTranslations('newPage');
  const pathname = usePathname();

  const locale = pathname.split('/')[1] || 'vi';
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const crumbs = buildCrumbs(pathWithoutLocale, pageTitle, t, tEditor, tNewPage);

  if (!crumbs) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6" aria-label={tAria('breadcrumb')}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <Chevron />}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="px-1.5 py-0.5 rounded hover:text-foreground hover:bg-accent transition-colors max-w-[200px] truncate inline-block"
                title={crumb.label}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={`px-1.5 py-0.5 max-w-[200px] truncate inline-block ${isLast ? 'text-foreground font-medium' : ''}`} title={crumb.label}>
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function buildCrumbs(
  path: string,
  pageTitle: string | undefined,
  t: (key: string) => string,
  tEditor: (key: string) => string,
  tNewPage: (key: string) => string,
): Crumb[] | null {
  // Hidden routes
  if (path === '/login' || path === '/dashboard' || path === '/pages') return null;

  const segments = path.split('/').filter(Boolean);

  // /pages/new
  if (path === '/pages/new') {
    return [
      { label: t('pages'), href: '/pages' },
      { label: tNewPage('title') },
    ];
  }

  // /pages/[id]/edit
  const editMatch = path.match(/^\/pages\/[^/]+\/edit$/);
  if (editMatch) {
    return [
      { label: t('pages'), href: '/pages' },
      { label: pageTitle || t('editPage') },
    ];
  }

  // /pages/[id]/sections/new
  const sectionNewMatch = path.match(/^\/pages\/[^/]+\/sections\/new$/);
  if (sectionNewMatch) {
    return [
      { label: t('pages'), href: '/pages' },
      ...(pageTitle ? [{ label: pageTitle, href: `/pages/${segments[1]}/edit` }] : []),
      { label: tEditor('addSection') },
    ];
  }

  // /pages/[id]/sections/[sectionId]/edit
  const sectionEditMatch = path.match(/^\/pages\/[^/]+\/sections\/[^/]+\/edit$/);
  if (sectionEditMatch) {
    return [
      { label: t('pages'), href: '/pages' },
      ...(pageTitle ? [{ label: pageTitle, href: `/pages/${segments[1]}/edit` }] : []),
      { label: tEditor('editSection') },
    ];
  }

  return null;
}

function Chevron() {
  return (
    <svg
      className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
