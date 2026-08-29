import type { SectionType, SectionContent, HeroContent, FeaturesContent, CtaContent, StatsContent, TestimonialsContent } from '@/types';
import HeroEditor from './editors/HeroEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import CtaEditor from './editors/CtaEditor';
import StatsEditor from './editors/StatsEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';

export const defaultContent: Record<SectionType, SectionContent> = {
  hero: {
    heading: '',
    subheading: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
  } as HeroContent,
  features: {
    subtitle: '',
    title: '',
    description: '',
    items: [],
  } as FeaturesContent,
  cta: {
    heading: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
  } as CtaContent,
  stats: {
    title: '',
    items: [],
  } as StatsContent,
  testimonials: {
    subtitle: '',
    title: '',
    description: '',
    items: [],
  } as TestimonialsContent,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionEditors: Record<SectionType, React.ComponentType<{ content: any; onChange: (content: any) => void }>> = {
  hero: HeroEditor,
  features: FeaturesEditor,
  cta: CtaEditor,
  stats: StatsEditor,
  testimonials: TestimonialsEditor,
};

export const sectionTypes = ['hero', 'features', 'cta', 'stats', 'testimonials'] as const;
