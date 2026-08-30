'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function PublicPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error('Public page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mb-6">
          {error.message || t('message')}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
