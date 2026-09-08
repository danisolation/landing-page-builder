'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        {t('title')}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || t('message')}
      </p>
      <Button variant="outline" size="sm" onClick={reset}>
        {t('retry')}
      </Button>
    </div>
  );
}
