"use client";

import { useTranslations } from "next-intl";
import { useEditorState } from "./hooks/useEditorState";
import { sectionTypes } from "@/components/sections/section-constants";
import { sectionIcons } from "@/lib/section-icons";
import type { SectionType } from "@/types";

export default function SectionPicker() {
  const t = useTranslations("editor");
  const tTypes = useTranslations("sectionTypes");
  const { addSection, state } = useEditorState();

  const handleAddSection = (type: SectionType) => {
    addSection(type, state.sections.length);
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{t("addSection")}</h3>
      <div className="grid grid-cols-2 gap-2" role="list">
        {sectionTypes.map((type) => {
          const Icon = sectionIcons[type];
          const label = tTypes(type);
          return (
            <button
              key={type}
              onClick={() => handleAddSection(type)}
              className="flex flex-col items-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              role="listitem"
              aria-label={label}
            >
              <Icon size={20} className="mb-1.5 text-(--lp-primary)" aria-hidden="true" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
