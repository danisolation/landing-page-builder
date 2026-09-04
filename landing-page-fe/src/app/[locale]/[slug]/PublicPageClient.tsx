'use client';

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
import type { Page, SectionType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionComponents: Record<SectionType, React.ComponentType<{ content: any }>> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
  pricing: PricingSection,
  faq: FaqSection,
  logoCloud: LogoCloudSection,
  team: HeroSection, // Placeholder
  gallery: HeroSection, // Placeholder
  contact: HeroSection, // Placeholder
  compare: HeroSection, // Placeholder
  banner: HeroSection, // Placeholder
};

export interface PublicPageClientProps {
  page: Page;
}

export default function PublicPageClient({ page }: PublicPageClientProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 scroll-smooth">
      <PublicNav pageTitle={page.title} />

      {page.sections?.map((section) => {
        const SectionComponent = sectionComponents[section.type];

        if (!SectionComponent) {
          return (
            <div key={section.id} className="p-8 bg-yellow-50 dark:bg-yellow-900/20 text-center">
              <p className="text-yellow-700 dark:text-yellow-400">
                Section type &quot;{section.type}&quot; is not supported
              </p>
            </div>
          );
        }

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
