import HeroEditor from './editors/HeroEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import CtaEditor from './editors/CtaEditor';
import StatsEditor from './editors/StatsEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';

export const defaultContent: Record<string, any> = {
  hero: {
    heading: '',
    subheading: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
  },
  features: {
    subtitle: '',
    title: '',
    description: '',
    items: [],
  },
  cta: {
    heading: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
  },
  stats: {
    title: '',
    items: [],
  },
  testimonials: {
    subtitle: '',
    title: '',
    description: '',
    items: [],
  },
};

export const sectionEditors: Record<string, any> = {
  hero: HeroEditor,
  features: FeaturesEditor,
  cta: CtaEditor,
  stats: StatsEditor,
  testimonials: TestimonialsEditor,
};

export const sectionTypes = ['hero', 'features', 'cta', 'stats', 'testimonials'] as const;
