"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { EditorProvider, useEditorState } from "./hooks/useEditorState";
import EditorToolbar from "./EditorToolbar";
import EditorSidebar from "./EditorSidebar";
import LiveCanvas from "./LiveCanvas";
import { createSection, updateSection, deleteSection } from "@/lib/api";
import { usePages } from "@/hooks/usePages";
import { defaultGlobalStyle } from "@/lib/global-style";
import type { GlobalStyle } from "./hooks/useEditorState";
import type { Page, Section } from "@/types";

type ViewMode = "desktop" | "tablet" | "mobile";

interface VisualEditorProps {
  page: Page;
  onPublish: (isPublished: boolean) => Promise<void>;
  isPublishing?: boolean;
  onOpenSettings: () => void;
  onOpenPreview: () => void;
}

function VisualEditorContent({
  page,
  onPublish,
  isPublishing,
  onOpenSettings,
  onOpenPreview,
}: VisualEditorProps) {
  const t = useTranslations("editor");
  const router = useRouter();
  const { state, setSections, dispatch, setGlobalStyle } = useEditorState();

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });
  // Re-run the debounce chain after a failed save
  const [retryTick, setRetryTick] = useState(0);

  const pageId = page.id;
  const baselineRef = useRef<Section[]>([]);
  const styleBaselineRef = useRef<string>(
    JSON.stringify({ ...defaultGlobalStyle, ...page.globalStyle }),
  );

  // Initialize sections + global style from the saved page
  useEffect(() => {
    if (page.sections) {
      baselineRef.current = page.sections;
      setSections(page.sections);
    }
    setGlobalStyle({ ...defaultGlobalStyle, ...page.globalStyle });
  }, [page.sections, page.globalStyle, setSections, setGlobalStyle]);

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

  // Persist StylePanel changes to the Page itself
  const { updatePageAsync } = usePages();
  const syncGlobalStyle = useCallback(
    async (style: GlobalStyle) => {
      const serialized = JSON.stringify(style);
      if (serialized === styleBaselineRef.current) return;
      await updatePageAsync({ id: pageId, data: { globalStyle: style } });
      styleBaselineRef.current = serialized;
    },
    [pageId, updatePageAsync]
  );

  const handleAutoSave = useCallback(async () => {
    if (!state.isDirty || state.isSaving) return;

    dispatch({ type: "SET_SAVING", payload: true });

    try {
      await syncSections(state.sections);
      await syncGlobalStyle(state.globalStyle);
      dispatch({ type: "MARK_CLEAN" });
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Surface the failure — silent data loss is unacceptable
      toast.error(t("saveFailed"));
      // Schedule a retry through the debounce effect
      setRetryTick((tick) => tick + 1);
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.sections, state.globalStyle, state.isDirty, state.isSaving, dispatch, syncSections, syncGlobalStyle, t]);

  // Auto-save with debounce
  useEffect(() => {
    if (!state.isDirty || state.isSaving) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [handleAutoSave, state.isDirty, state.isSaving, retryTick]);

  // Warn before leaving with unsaved changes (refresh/close)
  useEffect(() => {
    if (!state.isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.isDirty]);

  const handleSave = async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      await syncSections(state.sections);
      await syncGlobalStyle(state.globalStyle);
      dispatch({ type: "MARK_CLEAN" });
      toast.success(t("saveSuccess"));
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(t("saveFailed"));
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const handlePublish = async () => {
    try {
      await onPublish(!page.isPublished);
      toast.success(page.isPublished ? t("unpublished") : t("published"));
    } catch {
      toast.error(t("publishFailed"));
    }
  };

  // Drag-and-drop reorder monitor — sections drag via the handle on each
  // SectionBlock; drop target index determines the new position.
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) =>
        (source.data as Record<string, unknown>)?.type === "section-card",
      onDrop: ({ source, location }) => {
        const dropTarget = location.current.dropTargets[0];
        if (!dropTarget) return;

        const startIndex = (source.data as Record<string, unknown>)?.index as number;
        const finishIndex = (dropTarget.data as Record<string, unknown>)?.index as number;
        if (startIndex === undefined || finishIndex === undefined) return;
        if (startIndex === finishIndex) return;

        dispatch({
          type: "REORDER_SECTIONS",
          payload: { fromIndex: startIndex, toIndex: finishIndex },
        });
      },
    });
  }, [state.sections, dispatch]);

  return (
    <div className="h-screen flex flex-col">
      <EditorToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPreview={onOpenPreview}
        onSave={handleSave}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        isPublished={page.isPublished}
        pageTitle={page.title}
        onBack={() => router.push("/pages")}
        onOpenSettings={onOpenSettings}
      />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Backdrop for the mobile overlay sidebar */}
        {!sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
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
