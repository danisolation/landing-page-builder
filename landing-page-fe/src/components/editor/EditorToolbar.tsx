"use client";

import { useTranslations } from "next-intl";
import {
  Eye,
  Save,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  ChevronLeft,
} from "lucide-react";
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
  isPublishing?: boolean;
  isPublished: boolean;
  pageTitle: string;
  onBack: () => void;
  onOpenSettings: () => void;
}

const viewModes: { mode: ViewMode; icon: typeof Monitor; labelKey: string }[] = [
  { mode: "desktop", icon: Monitor, labelKey: "desktop" },
  { mode: "tablet", icon: Tablet, labelKey: "tablet" },
  { mode: "mobile", icon: Smartphone, labelKey: "mobile" },
];

export default function EditorToolbar({
  viewMode,
  onViewModeChange,
  onPreview,
  onSave,
  onPublish,
  isPublishing,
  isPublished,
  pageTitle,
  onBack,
  onOpenSettings,
}: EditorToolbarProps) {
  const t = useTranslations("editor");
  const tCommon = useTranslations("common");
  const { canUndo, canRedo, undo, redo, state } = useEditorState();

  return (
    <div className="border-b bg-background sticky top-0 z-50">
      <div className="min-h-14 px-3 sm:px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* Left: back, title, status */}
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            title={t("backToSections")}
            aria-label={t("backToSections")}
          >
            <ChevronLeft size={18} />
          </Button>
          <h1 className="font-medium truncate max-w-[140px] sm:max-w-[240px] text-sm sm:text-base">
            {pageTitle}
          </h1>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full shrink-0",
              isPublished
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
            )}
          >
            {isPublished ? tCommon("published") : tCommon("draft")}
          </span>
        </div>

        {/* Center: view modes + undo/redo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {viewModes.map(({ mode, icon: Icon, labelKey }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === mode
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
                title={t(labelKey)}
                aria-label={t(labelKey)}
                aria-pressed={viewMode === mode}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              title={t("undo")}
              aria-label={t("undo")}
            >
              <Undo2 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              title={t("redo")}
              aria-label={t("redo")}
            >
              <Redo2 size={18} />
            </Button>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Save status indicator - announced to screen readers */}
          <div aria-live="polite" className="flex items-center">
            {state.isDirty && (
              <span className="text-xs text-muted-foreground">{t("unsaved")}</span>
            )}
            {state.isSaving && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {t("saving")}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title={t("pageSettings")}
            aria-label={t("pageSettings")}
          >
            <Settings size={18} />
          </Button>

          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">{t("preview")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!state.isDirty || state.isSaving}
          >
            <Save size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">{t("save")}</span>
          </Button>

          <Button size="sm" onClick={onPublish} disabled={isPublishing}>
            {isPublishing ? t("saving") : isPublished ? t("unpublish") : t("publish")}
          </Button>
        </div>
      </div>
    </div>
  );
}
