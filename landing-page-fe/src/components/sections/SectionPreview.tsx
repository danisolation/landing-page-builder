'use client';

import { useTranslations } from 'next-intl';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CtaSection from './CtaSection';
import StatsSection from './StatsSection';
import TestimonialsSection from './TestimonialsSection';

interface SectionPreviewProps {
  type: string;
  content: any;
}

const sectionComponents: Record<string, any> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
};

export default function SectionPreview({ type, content }: SectionPreviewProps) {
  const t = useTranslations('sectionPreview');
  const SectionComponent = sectionComponents[type];

  if (!SectionComponent) {
    return (
      <div className="p-6 bg-amber-50 rounded-lg text-center border border-amber-200">
        <p className="text-sm text-amber-700">
          {t('unsupported', { type })}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide ml-1">
          {type}
        </span>
      </div>
      <div className="max-h-64 overflow-auto scrollbar-thin">
        <SectionComponent content={content} />
      </div>
    </div>
  );
}
