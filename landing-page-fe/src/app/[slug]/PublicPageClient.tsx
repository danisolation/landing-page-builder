'use client';

import { useEffect } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CtaSection from '@/components/sections/CtaSection';
import StatsSection from '@/components/sections/StatsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import PricingSection from '@/components/sections/PricingSection';
import FaqSection from '@/components/sections/FaqSection';
import LogoCloudSection from '@/components/sections/LogoCloudSection';
import PublicNav from '@/components/public/PublicNav';
import PublicFooter from '@/components/public/PublicFooter';
import AnimatedSection from '@/components/public/AnimatedSection';
import { incrementPageView } from '@/lib/api';
import { fontStacks, pageStyleVars } from '@/lib/global-style';
import type { Page, SectionType } from '@/types';

const sectionComponents: Record<SectionType, React.ComponentType<{ content: any }>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
  pricing: PricingSection,
  faq: FaqSection,
  logoCloud: LogoCloudSection,
};

export interface PublicPageClientProps {
  page: Page;
}

export default function PublicPageClient({ page }: PublicPageClientProps) {
  // Fire-and-forget view counter (client only, never blocks rendering)
  useEffect(() => {
    incrementPageView(page.id);
  }, [page.id]);

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-950 scroll-smooth"
      style={{
        fontFamily: page.globalStyle?.fontFamily
          ? fontStacks[page.globalStyle.fontFamily]
          : undefined,
        ...pageStyleVars(page.globalStyle),
      }}
    >
      <PublicNav pageTitle={page.title} />

      {page.sections?.map((section) => {
        const SectionComponent = sectionComponents[section.type];

        // Hero section doesn't need animation wrapper (it has its own)
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
  );
}
