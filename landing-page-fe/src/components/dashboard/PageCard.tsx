'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export interface PageCardProps {
  page: any;
  onDelete: (id: string, title: string) => void;
}

export default function PageCard({ page, onDelete }: PageCardProps) {
  const t = useTranslations('pageCard');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const sectionCount = page.sections?.length || 0;
  const sectionTypes = page.sections?.map((s: any) => s.type) || [];
  const uniqueTypes = [...new Set(sectionTypes)];

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-base font-semibold text-foreground truncate">{page.title}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  page.isPublished
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600/20 dark:ring-emerald-400/20'
                    : 'bg-muted text-muted-foreground ring-1 ring-border'
                }`}
              >
                {page.isPublished ? t('published') : t('draft')}
              </span>
            </div>

            <p className="text-sm text-muted-foreground font-mono mb-2">/{page.slug}</p>

            {page.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {page.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                🧩 {t('sections', { count: sectionCount })}
              </span>

              {uniqueTypes.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  📋 {uniqueTypes.join(', ')}
                </span>
              )}

              <span className="inline-flex items-center gap-1">
                📅 {new Date(page.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-4 sm:flex-shrink-0">
            <Link href={`/pages/${page.id}/edit`}>
              <Button variant="outline" size="sm">
                {tCommon('edit')}
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(page.id, page.title)}
            >
              {tCommon('delete')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
