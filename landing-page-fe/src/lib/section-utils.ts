import type { SectionType } from "@/types";

export const sectionTypeColors: Record<SectionType, string> = {
  hero: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 ring-purple-600/20 dark:ring-purple-400/20",
  features:
    "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-400/20",
  cta: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-400/20",
  stats: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-400/20",
  testimonials:
    "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 ring-pink-600/20 dark:ring-pink-400/20",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getSectionSummary(
  type: SectionType,
  content: any,
  tTypes: (key: string) => string
): string {
  switch (type) {
    case "hero":
      return content.heading || "—";
    case "features":
      return `${content.title || tTypes("features")} (${content.items?.length || 0})`;
    case "cta":
      return content.heading || "—";
    case "stats":
      return `${content.title || tTypes("stats")} (${content.items?.length || 0})`;
    case "testimonials":
      return `${content.title || tTypes("testimonials")} (${content.items?.length || 0})`;
    default:
      return type;
  }
}
