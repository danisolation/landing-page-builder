'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const locale = useLocale();
  const t = useTranslations('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl font-bold text-muted-foreground/20 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('notFoundTitle')}
        </h1>
        <p className="text-muted-foreground mb-6">{t('notFoundDesc')}</p>
        <Link
          href="/dashboard"
          locale={locale === 'en' ? 'en' : 'vi'}
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
