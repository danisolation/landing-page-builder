"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import CtaSection from "./CtaSection";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import PublicFooter from "@/components/public/PublicFooter";
import AnimatedSection from "@/components/public/AnimatedSection";
import { Button } from "@/components/ui/button";
import type { Section, SectionType } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionComponents: Record<
  SectionType,
  React.ComponentType<{ content: any }>
> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
};

export interface FullPagePreviewProps {
  page: {
    title: string;
    slug: string;
    sections?: Section[];
  };
  isOpen: boolean;
  onClose: () => void;
  showOpenLink?: boolean;
}

export default function FullPagePreview({
  page,
  isOpen,
  onClose,
  showOpenLink = true,
}: FullPagePreviewProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("fullPagePreview");
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  // Focus trap: focus the dialog on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sort sections by order as safety net
  const sortedSections = useMemo(() => {
    if (!page.sections) return [];
    return [...page.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [page.sections]);

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
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-4 md:inset-6 lg:inset-10 bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Admin toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0 z-30">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-foreground">{page.title}</h2>
                {showOpenLink && (
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                    /{page.slug}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showOpenLink && (
                  <a
                    href={`/${locale}/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium border border-border bg-card text-foreground hover:bg-accent px-3 py-1.5 rounded-md transition-colors"
                  >
                    <ExternalLink size={14} />
                    {t("openInNewTab")}
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label={t("closePreview")}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Page preview content — scrollable */}
            <div className="flex-1 overflow-auto min-h-full bg-background scroll-smooth">
              {sortedSections.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>{t("noSections")}</p>
                </div>
              ) : (
                <>
                  {sortedSections.map((section) => {
                    const SectionComponent = sectionComponents[section.type];

                    if (!SectionComponent) {
                      return (
                        <div
                          key={section.id}
                          className="p-8 bg-yellow-50 dark:bg-yellow-900/20 text-center"
                        >
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            {t("unsupportedSection", { type: section.type })}
                          </p>
                        </div>
                      );
                    }

                    if (section.type === "hero") {
                      return (
                        <SectionComponent
                          key={section.id}
                          content={section.content}
                        />
                      );
                    }

                    return (
                      <AnimatedSection key={section.id}>
                        <SectionComponent content={section.content} />
                      </AnimatedSection>
                    );
                  })}

                  <PublicFooter pageTitle={page.title} />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
