import type { Page } from "@/types";

const API_URL = process.env.BACKEND_URL || "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Server-side fetch — no localStorage, no auth tokens.
 * Used by Server Components to fetch public page data.
 */
export async function getPublicPageBySlug(slug: string): Promise<Page | null> {
  const url = `${API_URL}/pages/slug/${slug}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) {
      console.error(
        `[server-api] ${res.status} ${res.statusText} for ${url} — check BACKEND_URL`,
      );
      return null;
    }

    const json: ApiResponse<Page> = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[server-api] fetch failed for ${url}:`, err);
    return null;
  }
}
