"use client";

import { useTranslations } from "next-intl";
import { Eye, Save, Undo2, Redo2, Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorState } from "./hooks/useEditorState";
import { cn } from "@/lib/utils";

type ViewMode = "desktop" | "tablet" | "mobile";

interface EditorToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPreview: () => void;
  onSave: () => void;
  onPublish: () => void;
  isPublished: boolean;
}

export default function EditorToolbar({
  viewMode,
  onViewModeChange,
  onPreview,
  onSave,
  onPublish,
  isPublished,
}: EditorToolbarProps) {
  const t = useTranslations("editor");
  const { canUndo, canRedo, undo, redo, state } = useEditorState();

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left: View mode toggles */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("desktop")}
          className={cn(
            "p-2 rounded-md transition-colors",
            viewMode === "desktop" ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
          title={t("desktop")}
        >
          <Monitor size={18} />
        </button>
        <button
          onClick={() => onViewModeChange("tablet")}
          className={cn(
            "p-2 rounded-md transition-colors",
            viewMode === "tablet" ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
          title={t("tablet")}
        >
          <Tablet size={18} />
        </button>
        <button
          onClick={() => onViewModeChange("mobile")}
          className={cn(
            "p-2 rounded-md transition-colors",
            viewMode === "mobile" ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
          title={t("mobile")}
        >
          <Smartphone size={18} />
        </button>
      </div>

      {/* Center: Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title={t("undo")}
        >
          <Undo2 size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title={t("redo")}
        >
          <Redo2 size={18} />
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Save status indicator */}
        {state.isDirty && (
          <span className="text-xs text-muted-foreground">{t("unsaved")}</span>
        )}
        {state.isSaving && (
          <span className="text-xs text-blue-500">{t("saving")}</span>
        )}

        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye size={16} className="mr-2" />
          {t("preview")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={!state.isDirty || state.isSaving}
        >
          <Save size={16} className="mr-2" />
          {t("save")}
        </Button>

        <Button size="sm" onClick={onPublish}>
          {isPublished ? t("unpublish") : t("publish")}
        </Button>
      </div>
    </div>
  );
}
