'use client';

import { useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CtaSection from './CtaSection';
import StatsSection from './StatsSection';
import TestimonialsSection from './TestimonialsSection';
import type { SectionType, SectionContent } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionComponents: Record<SectionType, React.ComponentType<{ content: any }>> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
};

const typeColors: Record<string, string> = {
  hero: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400',
  features: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  cta: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
  stats: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400',
  testimonials: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400',
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function getSectionSummary(type: SectionType, content: any): string {
  switch (type) {
    case 'hero':
      return content.heading || '—';
    case 'features':
      return `${content.title || 'Features'} (${content.items?.length || 0})`;
    case 'cta':
      return content.heading || '—';
    case 'stats':
      return `${content.title || 'Stats'} (${content.items?.length || 0})`;
    case 'testimonials':
      return `${content.title || 'Testimonials'} (${content.items?.length || 0})`;
    default:
      return type;
  }
}

export interface DragOverlayProps {
  data: {
    sectionId: string;
    sectionType: SectionType;
    sectionContent: SectionContent;
    sectionOrder: number;
  };
}

export default function DragOverlay({ data }: DragOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount then trigger entrance animation
    requestAnimationFrame(() => {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el || !mounted) return;

    let animFrame: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY - 20}px, 0) scale(${visible ? 1.03 : 0.95})`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mounted, visible]);

  const SectionComponent = sectionComponents[data.sectionType];

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        transform: 'translate3d(-100px, -100px, 0) scale(0.95)',
        transition: 'transform 0.2s cubic-bezier(0.18, 0.67, 0.6, 1.22), box-shadow 0.2s ease, opacity 0.2s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="
          flex items-center gap-0 border border-blue-400 dark:border-blue-500
          rounded-xl overflow-hidden bg-card
          shadow-[0_20px_60px_-12px_rgba(0,0,0,0.35),0_0_20px_-4px_rgba(59,130,246,0.3)]
          dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6),0_0_20px_-4px_rgba(96,165,250,0.3)]
        "
        style={{ width: 'max(400px, 50vw)', maxWidth: '700px' }}
      >
        {/* Drag handle indicator */}
        <div className="flex items-center px-1.5 sm:px-2 text-blue-500 dark:text-blue-400 shrink-0 self-stretch bg-blue-50/50 dark:bg-blue-950/30">
          <GripVertical size={16} />
        </div>

        {/* Thumbnail */}
        <div className="hidden sm:block w-[120px] md:w-[140px] lg:w-[160px] h-[80px] lg:h-[100px] shrink-0 overflow-hidden bg-muted border-r border-border relative">
          <div
            className="absolute top-0 left-0 origin-top-left pointer-events-none"
            style={{
              width: '1200px',
              height: '800px',
              transform: 'scale(0.133)',
            }}
          >
            {SectionComponent && <SectionComponent content={data.sectionContent} />}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 capitalize ${typeColors[data.sectionType] || 'bg-muted text-muted-foreground ring-border'}`}
            >
              {data.sectionType}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              #{data.sectionOrder}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {getSectionSummary(data.sectionType, data.sectionContent)}
          </p>
        </div>
      </div>
    </div>
  );
}
