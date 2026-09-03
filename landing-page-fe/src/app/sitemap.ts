import type { MetadataRoute } from 'next';

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

interface PageListItem {
  slug: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Dynamic sitemap — tự động list tất cả published pages từ BE.
 * Google sẽ crawl file này định kỳ để discover pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['vi', 'en'];
  const entries: MetadataRoute.Sitemap = [];

  // Static routes
  for (const locale of locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Dynamic routes — published pages
  try {
    const res = await fetch(`${API_URL}/pages?isPublished=true&sortBy=updatedAt&sortOrder=desc`, {
      next: { revalidate: 300 }, // revalidate mỗi 5 phút
    });

    if (res.ok) {
      const json: ApiResponse<PageListItem[]> = await res.json();
      const pages = json.data;

      for (const page of pages) {
        for (const locale of locales) {
          entries.push({
            url: `${SITE_URL}/${locale}/${page.slug}`,
            lastModified: new Date(page.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch {
    // Nếu BE down, sitemap vẫn trả về static routes
  }

  return entries;
}
