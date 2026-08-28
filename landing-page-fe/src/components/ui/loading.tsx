'use client';

import { useTranslations } from 'next-intl';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-[2.5px] border-border border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingPage() {
  const t = useTranslations('common');

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-3" />
      <div className="h-3 bg-muted rounded w-1/2 mb-4" />
      <div className="h-3 bg-muted rounded w-full mb-2" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-muted rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="h-2.5 bg-muted rounded w-1/2 mb-2" />
              <div className="h-6 bg-muted rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="bg-card rounded-lg border border-border p-6 animate-pulse">
      <div className="h-5 bg-muted rounded w-1/4 mb-6" />
      <div className="space-y-4">
        <div>
          <div className="h-2.5 bg-muted rounded w-1/6 mb-2.5" />
          <div className="h-10 bg-muted rounded w-full" />
        </div>
        <div>
          <div className="h-2.5 bg-muted rounded w-1/6 mb-2.5" />
          <div className="h-10 bg-muted rounded w-full" />
        </div>
        <div>
          <div className="h-2.5 bg-muted rounded w-1/6 mb-2.5" />
          <div className="h-20 bg-muted rounded w-full" />
        </div>
      </div>
    </div>
  );
}
