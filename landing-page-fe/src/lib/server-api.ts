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
  try {
    const res = await fetch(`${API_URL}/pages/slug/${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) return null;

    const json: ApiResponse<Page> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}
