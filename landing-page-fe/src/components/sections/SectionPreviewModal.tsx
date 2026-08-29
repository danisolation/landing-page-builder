'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CtaSection from './CtaSection';
import StatsSection from './StatsSection';
import TestimonialsSection from './TestimonialsSection';
import { Button } from '@/components/ui/button';
import type { SectionType, SectionContent } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionComponents: Record<SectionType, React.ComponentType<{ content: any }>> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
};

export interface SectionPreviewModalProps {
  type: SectionType;
  content: SectionContent;
  isOpen: boolean;
  onClose: () => void;
}

export default function SectionPreviewModal({ type, content, isOpen, onClose }: SectionPreviewModalProps) {
  const SectionComponent = sectionComponents[type];
  const t = useTranslations('sectionPreviewModal');
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Focus trap: focus the dialog on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-4 md:inset-6 lg:inset-10 bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0 z-10">
              <h2 className="font-semibold text-foreground capitalize">
                {t('previewTitle', { type })}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('closePreview')}>
                <X size={18} />
              </Button>
            </div>

            {/* Content — scrollable, full width */}
            <div className="flex-1 overflow-auto bg-background">
              {SectionComponent ? (
                <SectionComponent content={content} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {t('unsupported')}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
