'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, FileText, CheckCircle2, FilePlus2, Blocks } from 'lucide-react';
import type { Page } from '@/types';

export interface StatsCardsProps {
  pages: Page[];
}

export default function StatsCards({ pages }: StatsCardsProps) {
  const t = useTranslations('stats');
  const totalPages = pages.length;
  const publishedPages = pages.filter((p) => p.isPublished).length;
  const draftPages = totalPages - publishedPages;
  const totalSections = pages.reduce((acc, p) => acc + (p.sections?.length || 0), 0);
  const totalViews = pages.reduce((acc, p) => acc + (p.viewCount || 0), 0);

  const stats = [
    {
      label: t('totalPages'),
      value: totalPages,
      icon: <FileText size={20} />,
      color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: t('published'),
      value: publishedPages,
      icon: <CheckCircle2 size={20} />,
      color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t('draft'),
      value: draftPages,
      icon: <FilePlus2 size={20} />,
      color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    },
    {
      label: t('totalSections'),
      value: totalSections,
      icon: <Blocks size={20} />,
      color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    },
    {
      label: t('totalViews'),
      value: totalViews,
      icon: <Eye size={20} />,
      color: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-lg ${stat.color}`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
