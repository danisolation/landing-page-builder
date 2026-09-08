import type { MetadataRoute } from 'next';

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

interface SitemapItem {
  slug: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Dynamic sitemap — lists all published pages from the BE.
 * Google crawls this file periodically to discover pages.
 *
 * Uses the dedicated public GET /pages/sitemap endpoint (no auth,
 * minimal payload: slug + updatedAt only).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${API_URL}/pages/sitemap`, {
      next: { revalidate: 300 }, // revalidate every 5 minutes
    });

    if (res.ok) {
      const json: ApiResponse<SitemapItem[]> = await res.json();
      for (const page of json.data) {
        entries.push({
          url: `${SITE_URL}/${page.slug}`,
          lastModified: new Date(page.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // If BE is down, sitemap still returns static routes
  }

  return entries;
}
