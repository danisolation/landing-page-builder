"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EditorProvider, useEditorState } from "./hooks/useEditorState";
import EditorToolbar from "./EditorToolbar";
import EditorSidebar from "./EditorSidebar";
import LiveCanvas from "./LiveCanvas";
import type { Page, Section } from "@/types";

type ViewMode = "desktop" | "tablet" | "mobile";

interface VisualEditorProps {
  page: Page;
  onSave: (data: Partial<Page>) => Promise<void>;
  onPublish: (isPublished: boolean) => Promise<void>;
}

function VisualEditorContent({ page, onSave, onPublish }: VisualEditorProps) {
  const t = useTranslations("editor");
  const router = useRouter();
  const { state, setSections, dispatch } = useEditorState();

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize sections from page
  useEffect(() => {
    if (page.sections) {
      setSections(page.sections);
    }
  }, [page.sections, setSections]);

  // Auto-save with debounce
  useEffect(() => {
    if (!state.isDirty) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [state.sections, state.isDirty]);

  const handleAutoSave = useCallback(async () => {
    if (!state.isDirty || state.isSaving) return;

    dispatch({ type: "SET_SAVING", payload: true });

    try {
      // Save sections to API
      const sectionsData = state.sections.map((s) => ({
        id: s.id.startsWith("temp-") ? undefined : s.id,
        type: s.type,
        content: s.content,
        order: s.order,
      }));

      await onSave({ sections: sectionsData as any });
      dispatch({ type: "MARK_CLEAN" });
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.sections, state.isDirty, state.isSaving, dispatch, onSave]);

  const handleSave = async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const sectionsData = state.sections.map((s) => ({
        id: s.id.startsWith("temp-") ? undefined : s.id,
        type: s.type,
        content: s.content,
        order: s.order,
      }));

      await onSave({ sections: sectionsData as any });
      dispatch({ type: "MARK_CLEAN" });
      toast.success(t("saveSuccess"));
    } catch (error) {
      toast.error(t("saveFailed"));
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const handlePublish = async () => {
    try {
      await onPublish(!page.isPublished);
      toast.success(page.isPublished ? t("unpublished") : t("published"));
    } catch (error) {
      toast.error(t("publishFailed"));
    }
  };

  const handlePreview = () => {
    window.open(`/${page.slug}`, "_blank");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="h-screen flex flex-col">
      <EditorToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPreview={handlePreview}
        onSave={handleSave}
        onPublish={handlePublish}
        isPublished={page.isPublished}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <LiveCanvas viewMode={viewMode} />
      </div>
    </div>
  );
}

export default function VisualEditor(props: VisualEditorProps) {
  return (
    <EditorProvider>
      <VisualEditorContent {...props} />
    </EditorProvider>
  );
}
