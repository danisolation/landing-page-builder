import type { SectionType, SectionContent, HeroContent, FeaturesContent, CtaContent, StatsContent, TestimonialsContent, PricingContent, FaqContent, LogoCloudContent } from '@/types';
import HeroEditor from './editors/HeroEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import CtaEditor from './editors/CtaEditor';
import StatsEditor from './editors/StatsEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';
import PricingEditor from './editors/PricingEditor';
import FaqEditor from './editors/FaqEditor';
import LogoCloudEditor from './editors/LogoCloudEditor';

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
  pricing: {
    subtitle: 'Pricing',
    title: 'Simple, transparent pricing',
    description: 'Choose the plan that works for you',
    plans: [
      {
        name: 'Free',
        price: '$0',
        period: 'month',
        description: 'Perfect for trying out',
        features: ['1 landing page', 'Basic templates', 'Community support'],
        buttonText: 'Get Started',
        buttonLink: '#',
      },
      {
        name: 'Pro',
        price: '$19',
        period: 'month',
        description: 'Best for professionals',
        features: ['Unlimited pages', 'All templates', 'Custom domain', 'Priority support'],
        highlighted: true,
        buttonText: 'Start Free Trial',
        buttonLink: '#',
      },
      {
        name: 'Team',
        price: '$49',
        period: 'month',
        description: 'For growing teams',
        features: ['Everything in Pro', '5 team members', 'Analytics', 'API access'],
        buttonText: 'Contact Sales',
        buttonLink: '#',
      },
    ],
  } as PricingContent,
  faq: {
    subtitle: 'FAQ',
    title: 'Frequently Asked Questions',
    description: 'Got questions? We have answers.',
    items: [
      { question: 'What is BuildFlow?', answer: 'BuildFlow is a landing page builder that helps you create professional pages without coding.' },
      { question: 'Can I use my own domain?', answer: 'Yes! All paid plans support custom domains.' },
    ],
  } as FaqContent,
  logoCloud: {
    subtitle: 'Trusted by',
    title: 'Companies we work with',
    items: [
      { name: 'Acme Inc' },
      { name: 'Globex' },
      { name: 'Initech' },
      { name: 'Umbrella' },
    ],
  } as LogoCloudContent,
  team: {
    subtitle: 'Team',
    title: 'Meet our team',
    description: '',
    members: [],
  },
  gallery: {
    subtitle: 'Gallery',
    title: 'Our work',
    description: '',
    images: [],
    columns: 3,
  },
  contact: {
    subtitle: 'Contact',
    title: 'Get in touch',
    description: 'Have a question? Send us a message.',
    fields: ['name', 'email', 'message'],
    submitText: 'Send Message',
  },
  compare: {
    title: 'Compare plans',
    columns: ['Free', 'Pro', 'Enterprise'],
    features: [],
  },
  banner: {
    text: 'Announcement: New features available!',
    link: '#',
    linkText: 'Learn more',
    dismissible: true,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionEditors: Record<SectionType, React.ComponentType<{ content: any; onChange: (content: any) => void }>> = {
  hero: HeroEditor,
  features: FeaturesEditor,
  cta: CtaEditor,
  stats: StatsEditor,
  testimonials: TestimonialsEditor,
  pricing: PricingEditor,
  faq: FaqEditor,
  logoCloud: LogoCloudEditor,
  team: HeroEditor, // Fallback
  gallery: HeroEditor, // Fallback
  contact: HeroEditor, // Fallback
  compare: HeroEditor, // Fallback
  banner: HeroEditor, // Fallback
};

export const sectionTypes = ['hero', 'features', 'cta', 'stats', 'testimonials', 'pricing', 'faq', 'logoCloud', 'team', 'gallery', 'contact', 'compare', 'banner'] as const;
