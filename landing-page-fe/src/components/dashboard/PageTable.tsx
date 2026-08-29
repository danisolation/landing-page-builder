'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { Page } from '@/types';

export interface PageTableProps {
  pages: Page[];
  onDelete: (id: string, title: string) => void;
}

export default function PageTable({ pages, onDelete }: PageTableProps) {
  const t = useTranslations('pageCard');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('titleLabel')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t('slugLabel')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('statusLabel')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t('sectionsLabel')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">{t('dateLabel')}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const sectionCount = page.sections?.length || 0;
              return (
                <tr key={page.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-foreground truncate max-w-[200px]">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono hidden sm:table-cell truncate max-w-[150px]">
                    /{page.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        page.isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600/20 dark:ring-emerald-400/20'
                          : 'bg-muted text-muted-foreground ring-1 ring-border'
                      }`}
                    >
                      {page.isPublished ? t('published') : t('draft')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {sectionCount}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {new Date(page.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/pages/${page.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={tCommon('edit')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => onDelete(page.id, page.title)}
                        aria-label={tCommon('delete')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
