'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';
import { GripVertical, Eye, Pencil, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CtaSection from './CtaSection';
import StatsSection from './StatsSection';
import TestimonialsSection from './TestimonialsSection';

const sectionComponents: Record<string, any> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
};

const typeColors: Record<string, string> = {
  hero: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 ring-purple-600/20 dark:ring-purple-400/20',
  features: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-400/20',
  cta: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-400/20',
  stats: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-400/20',
  testimonials: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 ring-pink-600/20 dark:ring-pink-400/20',
};

function getSectionSummary(type: string, content: any): string {
  switch (type) {
    case 'hero':
      return content.heading || '—';
    case 'features':
      return `${content.title || 'Features'} (${content.items?.length || 0} items)`;
    case 'cta':
      return content.heading || '—';
    case 'stats':
      return `${content.title || 'Stats'} (${content.items?.length || 0} items)`;
    case 'testimonials':
      return `${content.title || 'Testimonials'} (${content.items?.length || 0} items)`;
    default:
      return type;
  }
}

interface SectionCardProps {
  section: any;
  pageId: string;
  onPreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function SectionCard({
  section,
  pageId,
  onPreview,
  onDuplicate,
  onDelete,
}: SectionCardProps) {
  const t = useTranslations('sectionCard');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const SectionComponent = sectionComponents[section.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-0 border rounded-xl overflow-hidden
        transition-all duration-200 bg-card
        ${isDragging ? 'shadow-lg ring-2 ring-blue-400 opacity-90 z-50' : 'border-border hover:border-border/80 hover:shadow-sm'}
      `}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
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
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 capitalize ${typeColors[section.type] || 'bg-muted text-muted-foreground ring-border'}`}
          >
            {section.type}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            #{section.order}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {getSectionSummary(section.type, section.content)}
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
        >
          <Eye size={14} />
        </Button>
        <Link
          href={`/pages/${pageId}/sections/${section.id}/edit`}
          className="inline-flex items-center justify-center text-muted-foreground hover:text-blue-600 h-8 w-8 p-0 rounded-md hover:bg-accent transition-colors"
          title={t('edit')}
        >
          <Pencil size={14} />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          className="hidden sm:inline-flex text-muted-foreground hover:text-green-600 h-8 w-8 p-0"
          title={t('duplicate')}
        >
          <Copy size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-red-600 h-8 w-8 p-0"
          title={t('delete')}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
