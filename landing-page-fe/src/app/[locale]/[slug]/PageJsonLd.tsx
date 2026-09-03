import type { Page } from '@/types';

interface PageJsonLdProps {
  page: Page;
  locale: string;
  siteUrl: string;
}

/**
 * JSON-LD structured data cho landing page.
 * Giúp Google hiểu nội dung và hiển thị rich results.
 */
export default function PageJsonLd({ page, locale, siteUrl }: PageJsonLdProps) {
  const canonical = page.canonicalUrl || `${siteUrl}/${locale}/${page.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.metaTitle || page.title,
    description: page.metaDescription || page.description,
    url: canonical,
    inLanguage: locale === 'vi' ? 'vi' : 'en',
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: page.title,
    },
    ...(page.ogImageUrl && {
      image: page.ogImageUrl,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
