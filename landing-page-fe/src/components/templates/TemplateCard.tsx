'use client';

import { Eye, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import type { SectionType } from '@/types';

export interface TemplateCardData {
  id: string;
  name: string;
  description?: string;
  sectionTypes: SectionType[];
  isCustom?: boolean;
}

export interface TemplateCardProps {
  data: TemplateCardData;
  selected: boolean;
  sectionLabels: Record<SectionType, string>;
  labels: { preview: string; deleteTemplate: string; customBadge: string };
  onSelect: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
}

export default function TemplateCard({
  data,
  selected,
  sectionLabels,
  labels,
  onSelect,
  onPreview,
  onDelete,
}: TemplateCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        'group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm text-foreground">{data.name}</p>
        {data.isCustom && (
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
            {labels.customBadge}
          </span>
        )}
      </div>

      {data.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{data.description}</p>
      )}

      {data.sectionTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {data.sectionTypes.map((type, i) => (
            <span
              key={`${type}-${i}`}
              className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full"
            >
              {sectionLabels[type]}
            </span>
          ))}
        </div>
      )}

      {(onPreview || onDelete) && (
        <div className="flex items-center gap-1 pt-1">
          {onPreview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
            >
              <Eye size={12} className="mr-1" />
              {labels.preview}
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              aria-label={labels.deleteTemplate}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
