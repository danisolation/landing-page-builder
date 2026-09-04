/**
 * Shared section components map for rendering sections across the app.
 * Import this in any file that needs to render section types.
 */
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CtaSection from '@/components/sections/CtaSection';
import StatsSection from '@/components/sections/StatsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import PricingSection from '@/components/sections/PricingSection';
import FaqSection from '@/components/sections/FaqSection';
import LogoCloudSection from '@/components/sections/LogoCloudSection';
import type { SectionType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionComponents: Record<SectionType, React.ComponentType<{ content: any }>> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
  pricing: PricingSection,
  faq: FaqSection,
  logoCloud: LogoCloudSection,
  // Placeholder for sections without dedicated renderer yet
  team: HeroSection,
  gallery: HeroSection,
  contact: HeroSection,
  compare: HeroSection,
  banner: HeroSection,
};
