"use client";

import { useState } from "react";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useTranslations } from "next-intl";
import { showConfirm } from "@/components/ui/confirm-dialog";
import { GripVertical, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorState } from "./hooks/useEditorState";
import { cn } from "@/lib/utils";
import type { Section, SectionContent } from "@/types";

interface SectionBlockProps {
  section: Section;
  index: number;
  children: React.ReactNode;
  viewMode: "desktop" | "tablet" | "mobile";
  onDragOverlayChange?: (data: {
    sectionId: string;
    sectionType: Section["type"];
    sectionContent: SectionContent;
    sectionOrder: number;
  } | null) => void;
}

export default function SectionBlock({
  section,
  index,
  children,
  viewMode,
  onDragOverlayChange,
}: SectionBlockProps) {
  const t = useTranslations("editor");
  const { state, selectSection, deleteSection, duplicateSection, reorderSections } =
    useEditorState();
  const [isHovered, setIsHovered] = useState(false);

  const { cardRef, handleRef, isDragging, closestEdge } = useDragAndDrop({
    index,
    sectionId: section.id,
    sectionType: section.type,
    sectionContent: section.content,
    sectionOrder: section.order,
    onDragOverlayChange,
  });

  const isSelected = state.selectedSectionId === section.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm(
      t("deleteSectionTitle"),
      t("deleteSectionMsg")
    );
    if (confirmed) {
      deleteSection(section.id);
    }
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
      ref={cardRef}
      className={cn(
        "relative group transition-all",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        isDragging && "opacity-50"
      )}
      onClick={() => selectSection(section.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drop indicator */}
      {closestEdge && (
        <div
          className={cn(
            "absolute inset-x-0 h-1 bg-blue-500 rounded-full z-20",
            closestEdge === "top" ? "-top-1" : "-bottom-1"
          )}
        />
      )}

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
            className="h-8 w-8"
            onClick={handleMoveUp}
            disabled={index === 0}
            title={t("moveUp")}
            aria-label={t("moveUp")}
          >
            <ChevronUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleMoveDown}
            disabled={index === state.sections.length - 1}
            title={t("moveDown")}
            aria-label={t("moveDown")}
          >
            <ChevronDown size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDuplicate}
            title={t("duplicate")}
            aria-label={t("duplicate")}
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title={t("delete")}
            aria-label={t("delete")}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )}

      {/* Drag handle - visible on hover/selection */}
      <div
        ref={handleRef}
        className={cn(
          "absolute -left-8 top-1/2 -translate-y-1/2 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grab bg-background border shadow-sm hover:bg-muted",
          isSelected && "opacity-100",
          isDragging && "opacity-100 cursor-grabbing"
        )}
        title={t("dragToReorder")}
      >
        <GripVertical size={16} className="text-muted-foreground" />
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
