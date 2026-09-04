'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { GripVertical, Eye, Pencil, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { getSectionSummary, sectionTypeColors } from '@/lib/section-utils';
import type { Section, SectionType, SectionContent } from '@/types';
import { sectionComponents } from '@/lib/section-components';





// eslint-disable-next-line @typescript-eslint/no-explicit-any

interface DragOverlayData {
  sectionId: string;
  sectionType: SectionType;
  sectionContent: SectionContent;
  sectionOrder: number;
}

export interface SectionCardProps {
  section: Section;
  index: number;
  pageId: string;
  onPreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragOverlayChange?: (data: DragOverlayData | null) => void;
}

export default memo(function SectionCard({
  section,
  index,
  pageId,
  onPreview,
  onDuplicate,
  onDelete,
  onDragOverlayChange,
}: SectionCardProps) {
  const t = useTranslations('sectionCard');
  const tTypes = useTranslations('sectionTypes');

  const { cardRef, handleRef, isDragging, closestEdge } = useDragAndDrop({
    index,
    sectionId: section.id,
    sectionType: section.type,
    sectionContent: section.content,
    sectionOrder: section.order,
    onDragOverlayChange,
  });

  const SectionComponent = sectionComponents[section.type];

  return (
    <div
      ref={cardRef}
      className={`
        group relative flex items-center gap-0 border rounded-xl overflow-hidden
        transition-all duration-200 ease-out
        bg-card
        ${isDragging
          ? 'opacity-30 scale-[0.98] border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20'
          : 'border-border hover:border-border/80 hover:shadow-sm'
        }
      `}
    >
      {/* Drop indicator - top */}
      <div
        className={`
          absolute left-0 right-0 top-0 h-0.5 z-10 rounded-full
          transition-all duration-150 ease-out
          ${closestEdge === 'top'
            ? 'opacity-100 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.6)]'
            : 'opacity-0'
          }
        `}
      />

      {/* Drag handle */}
      <div
        ref={handleRef}
        className="flex items-center px-1.5 sm:px-2 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent transition-colors shrink-0 self-stretch"
      >
        <GripVertical size={16} />
      </div>

      {/* Thumbnail — hidden on small screens */}
      <div className="hidden sm:block w-[120px] md:w-[140px] lg:w-[160px] h-[80px] lg:h-[100px] shrink-0 overflow-hidden bg-muted border-r border-border relative">
        <div
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{
            width: '1200px',
            height: '800px',
            transform: 'scale(0.133)',
          }}
        >
          {SectionComponent && <SectionComponent content={section.content} />}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 capitalize ${sectionTypeColors[section.type] || 'bg-muted text-muted-foreground ring-border'}`}
          >
            {tTypes(section.type)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            #{section.order}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {getSectionSummary(section.type, section.content, tTypes)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 border-l border-border shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
          title={t('preview')}
          aria-label={t('preview')}
        >
          <Eye size={14} />
        </Button>
        <Link
          href={`/pages/${pageId}/sections/${section.id}/edit`}
          className="inline-flex items-center justify-center text-muted-foreground hover:text-blue-600 h-8 w-8 p-0 rounded-md hover:bg-accent transition-colors"
          title={t('edit')}
          aria-label={t('edit')}
        >
          <Pencil size={14} />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          className="hidden sm:inline-flex text-muted-foreground hover:text-green-600 h-8 w-8 p-0"
          title={t('duplicate')}
          aria-label={t('duplicate')}
        >
          <Copy size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-red-600 h-8 w-8 p-0"
          title={t('delete')}
          aria-label={t('delete')}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Drop indicator - bottom */}
      <div
        className={`
          absolute left-0 right-0 bottom-0 h-0.5 z-10 rounded-full
          transition-all duration-150 ease-out
          ${closestEdge === 'bottom'
            ? 'opacity-100 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.6)]'
            : 'opacity-0'
          }
        `}
      />
    </div>
  );
});
