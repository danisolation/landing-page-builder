'use client';

import { useTranslations } from 'next-intl';
import { usePages } from '@/hooks/usePages';
import { SkeletonStats } from '@/components/ui/loading';
import StatsCards from '@/components/dashboard/StatsCards';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { pages, isLoading } = usePages();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">{t('title')}</h1>
        <SkeletonStats />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-6">{t('title')}</h1>
      {pages && pages.length > 0 && <StatsCards pages={pages} />}
    </div>
  );
}
