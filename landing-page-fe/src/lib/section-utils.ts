import type { SectionType } from "@/types";

export const sectionTypeColors: Record<SectionType, string> = {
  hero: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 ring-purple-600/20 dark:ring-purple-400/20",
  features:
    "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-400/20",
  cta: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 ring-orange-600/20 dark:ring-orange-400/20",
  stats: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-400/20",
  testimonials:
    "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 ring-pink-600/20 dark:ring-pink-400/20",
  pricing: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20 dark:ring-yellow-400/20",
  faq: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 ring-cyan-600/20 dark:ring-cyan-400/20",
  logoCloud: "bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 ring-gray-600/20 dark:ring-gray-400/20",
  team: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 ring-indigo-600/20 dark:ring-indigo-400/20",
  gallery: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 ring-rose-600/20 dark:ring-rose-400/20",
  contact: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 ring-teal-600/20 dark:ring-teal-400/20",
  compare: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-400/20",
  banner: "bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-400 ring-lime-600/20 dark:ring-lime-400/20",
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
    case "pricing":
      return `${content.title || tTypes("pricing")} (${content.plans?.length || 0})`;
    case "faq":
      return `${content.title || tTypes("faq")} (${content.items?.length || 0})`;
    case "logoCloud":
      return `${content.title || tTypes("logoCloud")} (${content.items?.length || 0})`;
    default:
      return type;
  }
}
