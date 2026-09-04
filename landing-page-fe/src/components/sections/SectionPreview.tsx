'use client';

import { useTranslations } from 'next-intl';
import { sectionComponents } from '@/lib/section-components';
import type { SectionType, SectionContent } from '@/types';

export interface SectionPreviewProps {
  type: SectionType;
  content: SectionContent;
}

export default function SectionPreview({ type, content }: SectionPreviewProps) {
  const t = useTranslations('sectionPreview');
  const SectionComponent = sectionComponents[type];

  if (!SectionComponent) {
    return (
      <div className="p-6 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          {t('unsupported', { type })}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="bg-muted border-b border-border px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide ml-1">
          {type}
        </span>
      </div>
      <div className="overflow-hidden">
        <SectionComponent content={content} />
      </div>
    </div>
  );
}
