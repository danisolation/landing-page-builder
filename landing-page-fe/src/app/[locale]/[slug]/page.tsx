import { notFound } from 'next/navigation';
import { getPublicPageBySlug } from '@/lib/server-api';
import PublicPageClient from './PublicPageClient';

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;

  const page = await getPublicPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <PublicPageClient page={page} />;
}
