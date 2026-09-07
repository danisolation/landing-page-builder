import {
  PanelTop,
  Sparkles,
  BarChart3,
  MessageSquareQuote,
  Megaphone,
  Tags,
  CircleHelp,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { SectionType } from "@/types";

// Shared icon map for section types (picker, drop zone, dashboards)
export const sectionIcons: Record<SectionType, LucideIcon> = {
  hero: PanelTop,
  features: Sparkles,
  stats: BarChart3,
  testimonials: MessageSquareQuote,
  cta: Megaphone,
  pricing: Tags,
  faq: CircleHelp,
  logoCloud: Building2,
};
