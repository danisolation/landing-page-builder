'use client';

import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CtaSection from './CtaSection';
import StatsSection from './StatsSection';
import TestimonialsSection from './TestimonialsSection';
import PublicFooter from '@/components/public/PublicFooter';
import AnimatedSection from '@/components/public/AnimatedSection';
import { Button } from '@/components/ui/button';

const sectionComponents: Record<string, any> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
};

interface FullPagePreviewProps {
  page: {
    title: string;
    slug: string;
    sections?: any[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function FullPagePreview({ page, isOpen, onClose }: FullPagePreviewProps) {
  const params = useParams();
  const locale = params.locale as string;

  // Lock body scroll when modal is open
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-4 md:inset-6 lg:inset-10 bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-foreground">
                  {page.title}
                </h2>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  /{page.slug}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/${locale}/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-medium border border-border bg-card text-foreground hover:bg-accent px-3 py-1.5 rounded-md transition-colors"
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-auto bg-background">
              {page.sections?.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No sections yet</p>
                </div>
              ) : (
                <div>
                  {page.sections?.map((section: any) => {
                    const SectionComponent = sectionComponents[section.type];

                    if (!SectionComponent) {
                      return (
                        <div key={section.id} className="p-8 bg-yellow-50 dark:bg-yellow-900/20 text-center">
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            Section type &quot;{section.type}&quot; not supported
                          </p>
                        </div>
                      );
                    }

                    if (section.type === 'hero') {
                      return <SectionComponent key={section.id} content={section.content} />;
                    }

                    return (
                      <AnimatedSection key={section.id}>
                        <SectionComponent content={section.content} />
                      </AnimatedSection>
                    );
                  })}
                  <PublicFooter pageTitle={page.title} />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
