'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPageBySlug } from '@/lib/api';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CtaSection from '@/components/sections/CtaSection';
import StatsSection from '@/components/sections/StatsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import PublicNav from '@/components/public/PublicNav';
import PublicFooter from '@/components/public/PublicFooter';
import AnimatedSection from '@/components/public/AnimatedSection';

const sectionComponents: Record<string, any> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
};

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => getPageBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Không tìm thấy trang</p>
          <a href="/" className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 scroll-smooth">
      <PublicNav pageTitle={page.title} />

      {page.sections?.map((section: any, index: number) => {
        const SectionComponent = sectionComponents[section.type];

        if (!SectionComponent) {
          return (
            <div key={section.id} className="p-8 bg-yellow-50 dark:bg-yellow-900/20 text-center">
              <p className="text-yellow-700 dark:text-yellow-400">
                Section type &quot;{section.type}&quot; chưa được hỗ trợ
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
