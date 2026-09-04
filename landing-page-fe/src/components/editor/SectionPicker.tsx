"use client";

import { useTranslations } from "next-intl";
import { useEditorState } from "./hooks/useEditorState";
import { sectionTypes } from "@/components/sections/section-constants";
import type { SectionType } from "@/types";

const sectionInfo: Record<SectionType, { icon: string; label: string; description: string }> = {
  hero: { icon: "🏠", label: "Hero", description: "Main banner with heading and CTA" },
  features: { icon: "✨", label: "Features", description: "Grid of features with icons" },
  stats: { icon: "📊", label: "Stats", description: "Numbers and statistics" },
  testimonials: { icon: "💬", label: "Testimonials", description: "Customer quotes and reviews" },
  cta: { icon: "🎯", label: "CTA", description: "Call to action section" },
  pricing: { icon: "💰", label: "Pricing", description: "Pricing plans comparison" },
  faq: { icon: "❓", label: "FAQ", description: "Accordion FAQ section" },
  logoCloud: { icon: "🏢", label: "Logo Cloud", description: "Partner/company logos" },
  team: { icon: "👥", label: "Team", description: "Team members showcase" },
  gallery: { icon: "🖼️", label: "Gallery", description: "Image grid gallery" },
  contact: { icon: "📧", label: "Contact", description: "Contact form section" },
  compare: { icon: "⚖️", label: "Compare", description: "Feature comparison table" },
  banner: { icon: "📢", label: "Banner", description: "Announcement bar" },
};

export default function SectionPicker() {
  const t = useTranslations("editor");
  const { addSection, state } = useEditorState();

  const handleAddSection = (type: SectionType) => {
    addSection(type, state.sections.length);
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{t("addSection")}</h3>
      <div className="grid grid-cols-2 gap-2">
        {sectionTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleAddSection(type)}
            className="flex flex-col items-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-colors"
          >
            <span className="text-xl mb-1">{sectionInfo[type].icon}</span>
            <span className="text-xs font-medium">{sectionInfo[type].label}</span>
            <span className="text-[10px] text-muted-foreground text-center mt-0.5">
              {sectionInfo[type].description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
