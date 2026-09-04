"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEditorState } from "./hooks/useEditorState";
import { sectionTypes } from "@/components/sections/section-constants";
import type { SectionType } from "@/types";

const sectionIcons: Record<SectionType, string> = {
  hero: "🏠",
  features: "✨",
  stats: "📊",
  testimonials: "💬",
  cta: "🎯",
  pricing: "💰",
  faq: "❓",
  logoCloud: "🏢",
  team: "👥",
  gallery: "🖼️",
  contact: "📧",
  compare: "⚖️",
  banner: "📢",
};

interface AddSectionDropZoneProps {
  index: number;
}

export default function AddSectionDropZone({ index }: AddSectionDropZoneProps) {
  const t = useTranslations("editor");
  const { addSection } = useEditorState();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddSection = (type: SectionType) => {
    addSection(type, index);
    setIsOpen(false);
  };

  return (
    <div className="relative py-4 flex items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <Button
            variant="outline"
            size="sm"
            className="relative z-10 rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus size={16} className="mr-2" />
            {t("addSection")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("chooseSectionType")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {sectionTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleAddSection(type)}
                className="flex flex-col items-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-colors"
              >
                <span className="text-xl mb-1">{sectionIcons[type]}</span>
                <span className="text-xs font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
