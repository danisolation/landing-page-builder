'use client';

import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CtaSection from './CtaSection';

interface SectionPreviewProps {
  type: string;
  content: any;
}

const sectionComponents: Record<string, any> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
};

export default function SectionPreview({ type, content }: SectionPreviewProps) {
  const SectionComponent = sectionComponents[type];

  if (!SectionComponent) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg text-center">
        <p className="text-yellow-700">
          Section type &quot;{type}&quot; chưa được hỗ trợ preview
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-3 py-2 text-sm text-gray-600 border-b">
        Preview: {type}
      </div>
      <div className="max-h-64 overflow-auto">
        <SectionComponent content={content} />
      </div>
    </div>
  );
}
