'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPageBySlug } from '@/lib/api';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import CtaSection from '@/components/sections/CtaSection';

const sectionComponents: Record<string, any> = {
  hero: HeroSection,
  features: FeaturesSection,
  cta: CtaSection,
};

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPageBySlug(slug)
      .then(setPage)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600">Không tìm thấy trang</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {page.sections?.map((section: any) => {
        const SectionComponent = sectionComponents[section.type];

        if (!SectionComponent) {
          return (
            <div key={section.id} className="p-8 bg-yellow-50 text-center">
              <p>Section type &quot;{section.type}&quot; chưa được hỗ trợ</p>
            </div>
          );
        }

        return <SectionComponent key={section.id} content={section.content} />;
      })}
    </div>
  );
}
