import type { PageFilters } from "@/types";

// Query key factory for consistent cache keys
export const pageKeys = {
  all: ["pages"] as const,
  detail: (id: string) => ["pages", { id }] as const,
  filtered: (filters: PageFilters) => ["pages", filters] as const,
} as const;

export const sectionKeys = {
  all: ["sections"] as const,
  byPage: (pageId: string) => ["sections", { pageId }] as const,
  detail: (pageId: string, sectionId: string) =>
    ["sections", { pageId, sectionId }] as const,
} as const;

export const authKeys = {
  profile: ["auth", "profile"] as const,
} as const;
