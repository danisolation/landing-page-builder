"use client";

import { useState, useEffect } from "react";
import { useEditorState } from "./hooks/useEditorState";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import StatsSection from "@/components/sections/StatsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CtaSection from "@/components/sections/CtaSection";
import PricingSection from "@/components/sections/PricingSection";
import FaqSection from "@/components/sections/FaqSection";
import LogoCloudSection from "@/components/sections/LogoCloudSection";
import type { Section, SectionContent } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  features: FeaturesSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
  cta: CtaSection,
  pricing: PricingSection,
  faq: FaqSection,
  logoCloud: LogoCloudSection,
};

interface EditableSectionProps {
  section: Section;
}

export default function EditableSection({ section }: EditableSectionProps) {
  const { updateSection } = useEditorState();
  const [localContent, setLocalContent] = useState(section.content);

  useEffect(() => {
    setLocalContent(section.content);
  }, [section.content]);

  const handleContentChange = (newContent: SectionContent) => {
    setLocalContent(newContent);
    updateSection(section.id, newContent);
  };

  const SectionComponent = sectionComponents[section.type];

  if (!SectionComponent) {
    return (
      <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
        <p className="text-sm">Section type &quot;{section.type}&quot; preview coming soon</p>
        <p className="text-xs mt-2">You can still edit it in the sidebar</p>
      </div>
    );
  }

  return (
    <SectionComponent
      content={localContent}
      isEditing={true}
      onContentChange={handleContentChange}
    />
  );
}
