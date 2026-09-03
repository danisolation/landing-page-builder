import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicPageBySlug } from '@/lib/server-api';
import PublicPageClient from './PublicPageClient';
import PageJsonLd from './PageJsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = await getPublicPageBySlug(slug);

  if (!page) return {};

  const title = page.metaTitle || page.title;
  const description = page.metaDescription || page.description;
  const canonical = page.canonicalUrl || `${SITE_URL}/${locale}/${slug}`;

  const metadata: Metadata = {
    title,
    ...(description && { description }),
    ...(page.keywords && { keywords: page.keywords }),

    // Canonical URL + hreflang for i18n SEO
    alternates: {
      canonical,
      languages: {
        vi: `${SITE_URL}/vi/${slug}`,
        en: `${SITE_URL}/en/${slug}`,
      },
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description && { description }),
      ...(page.ogImageUrl && { images: [page.ogImageUrl] }),
    },

    // Open Graph
    openGraph: {
      type: 'website',
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      url: canonical,
      title,
      ...(description && { description }),
      ...(page.ogImageUrl && { images: [{ url: page.ogImageUrl, width: 1200, height: 630 }] }),
    },

    // Robots control — unpublished pages get noindex
    ...(page.isPublished === false && {
      robots: { index: false, follow: false },
    }),
  };

  return metadata;
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const page = await getPublicPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <PageJsonLd page={page} locale={locale} siteUrl={SITE_URL} />
      <PublicPageClient page={page} />
    </>
  );
}
