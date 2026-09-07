'use client';

import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Pencil, Trash2, ExternalLink, Link2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { Page } from '@/types';

export interface PageTableProps {
  pages: Page[];
  onDelete: (id: string, title: string) => void;
  onDuplicate: (page: Page) => void;
}

export default function PageTable({ pages, onDelete, onDuplicate }: PageTableProps) {
  const t = useTranslations('pageCard');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const handleCopyLink = async (page: Page) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${locale}/${page.slug}`
      );
      toast.success(t('copySuccess'));
    } catch {
      toast.error(t('copyFailed'));
    }
  };

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
                  <td className="px-4 py-3 text-muted-foreground font-mono hidden sm:table-cell max-w-[150px]">
                    <span className="block truncate">/{page.slug}</span>
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
                      {page.isPublished && (
                        <a
                          href={`/${locale}/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={t('view')} aria-label={t('view')}>
                            <ExternalLink size={14} />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleCopyLink(page)}
                        title={t('copyLink')}
                        aria-label={t('copyLink')}
                      >
                        <Link2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onDuplicate(page)}
                        disabled={sectionCount > 20}
                        title={t('duplicate')}
                        aria-label={t('duplicate')}
                      >
                        <Copy size={14} />
                      </Button>
                      <Link href={`/pages/${page.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={tCommon('edit')} aria-label={tCommon('edit')}>
                          <Pencil size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => onDelete(page.id, page.title)}
                        title={tCommon('delete')}
                        aria-label={tCommon('delete')}
                      >
                        <Trash2 size={14} />
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
