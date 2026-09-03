import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

/**
 * Robots.txt — hướng dẫn search engine crawl.
 * Admin routes bị block, public pages được phép.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/vi/login', '/vi/dashboard', '/vi/pages/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
