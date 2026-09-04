"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GripVertical, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorState } from "./hooks/useEditorState";
import { cn } from "@/lib/utils";
import type { Section } from "@/types";

interface SectionBlockProps {
  section: Section;
  index: number;
  children: React.ReactNode;
  viewMode: "desktop" | "tablet" | "mobile";
}

export default function SectionBlock({
  section,
  index,
  children,
  viewMode,
}: SectionBlockProps) {
  const t = useTranslations("editor");
  const { state, selectSection, deleteSection, duplicateSection, reorderSections } =
    useEditorState();
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = state.selectedSectionId === section.id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSection(section.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSection(section.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      reorderSections(index, index - 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < state.sections.length - 1) {
      reorderSections(index, index + 1);
    }
  };

  return (
    <div
      className={cn(
        "relative group transition-all",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      onClick={() => selectSection(section.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover toolbar */}
      {(isHovered || isSelected) && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-background border rounded-lg shadow-lg px-2 py-1">
          <span className="text-xs text-muted-foreground px-2 capitalize">
            {section.type}
          </span>
          <div className="w-px h-4 bg-border" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleMoveUp}
            disabled={index === 0}
            title={t("moveUp")}
          >
            <ChevronUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleMoveDown}
            disabled={index === state.sections.length - 1}
            title={t("moveDown")}
          >
            <ChevronDown size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDuplicate}
            title={t("duplicate")}
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title={t("delete")}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )}

      {/* Drag handle */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing",
          isSelected && "opacity-100"
        )}
      >
        <GripVertical size={20} className="text-muted-foreground" />
      </div>

      {/* Section content wrapper */}
      <div
        className={cn(
          "transition-all",
          viewMode === "tablet" && "max-w-[768px] mx-auto",
          viewMode === "mobile" && "max-w-[375px] mx-auto"
        )}
      >
        {children}
      </div>
    </div>
  );
}
