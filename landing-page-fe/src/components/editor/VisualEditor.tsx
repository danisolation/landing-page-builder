"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EditorProvider, useEditorState } from "./hooks/useEditorState";
import EditorToolbar from "./EditorToolbar";
import EditorSidebar from "./EditorSidebar";
import LiveCanvas from "./LiveCanvas";
import { createSection, updateSection, deleteSection } from "@/lib/api";
import type { Page, Section } from "@/types";

type ViewMode = "desktop" | "tablet" | "mobile";

interface VisualEditorProps {
  page: Page;
  onPublish: (isPublished: boolean) => Promise<void>;
}

function VisualEditorContent({ page, onPublish }: VisualEditorProps) {
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

  const pageId = page.id;
  const baselineRef = useRef<Section[]>([]);

  // Initialize baseline for comparison
  useEffect(() => {
    if (page.sections) {
      baselineRef.current = page.sections;
      setSections(page.sections);
    }
  }, [page.sections, setSections]);

  // Sync sections to backend via sections API
  const syncSections = useCallback(
    async (sections: Section[]) => {
      const baseline = baselineRef.current;

      // Deleted: in baseline but not in current
      const currentIds = new Set(
        sections.filter((s) => !s.id.startsWith("temp-")).map((s) => s.id)
      );
      const toDelete = baseline.filter((s) => !currentIds.has(s.id));
      for (const s of toDelete) {
        await deleteSection(pageId, s.id);
      }

      // Created + updated (in index order so order is persisted)
      const synced: Section[] = [];
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        if (s.id.startsWith("temp-")) {
          const created = await createSection(pageId, {
            type: s.type,
            content: s.content,
            order: i,
          });
          synced.push(created);
        } else {
          const original = baseline.find((b) => b.id === s.id);
          const changed =
            !original ||
            original.order !== i ||
            JSON.stringify(original.content) !== JSON.stringify(s.content) ||
            original.type !== s.type;
          if (changed) {
            const updated = await updateSection(pageId, s.id, {
              type: s.type,
              content: s.content,
              order: i,
            });
            synced.push(updated);
          } else {
            synced.push(s);
          }
        }
      }

      baselineRef.current = synced;
      setSections(synced);
    },
    [pageId, setSections]
  );

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
      await syncSections(state.sections);
      dispatch({ type: "MARK_CLEAN" });
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.sections, state.isDirty, state.isSaving, dispatch, syncSections]);

  const handleSave = async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      await syncSections(state.sections);
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
