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
import { createSection, updateSection, deleteSection, createTemplate } from "@/lib/api";
import { usePages } from "@/hooks/usePages";
import SaveTemplateDialog from "@/components/templates/SaveTemplateDialog";
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
  const tEdit = useTranslations("editPage");
  const router = useRouter();
  const { state, setSections, dispatch, setGlobalStyle } = useEditorState();

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });
  // Re-run the debounce chain after a failed save
  const [retryTick, setRetryTick] = useState(0);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const pageId = page.id;
  const baselineRef = useRef<Section[]>([]);
  const styleBaselineRef = useRef<string>(
    JSON.stringify({ ...defaultGlobalStyle, ...page.globalStyle }),
  );

  // Initialize sections + global style from the saved page — chỉ khi dữ liệu
  // đầu vào THẬT SỰ khác lần hydrate trước. Nhờ vậy:
  //  - isDirtytrue→false sau auto-save KHÔNG đưa state về snapshot cũ lúc mount
  //  - refetch khi đang có sửa đổi chưa lưu không đè lên nội dung trong bộ nhớ
  const hydratedRef = useRef("");
  useEffect(() => {
    if (state.isDirty || !page.sections) return;
    const incoming = JSON.stringify(page.sections);
    if (incoming === hydratedRef.current) return;
    hydratedRef.current = incoming;
    baselineRef.current = page.sections;
    setSections(page.sections);
    setGlobalStyle({ ...defaultGlobalStyle, ...page.globalStyle });
  }, [page.sections, page.globalStyle, setSections, setGlobalStyle, state.isDirty]);

  // Sync sections to backend via sections API
  const syncSections = useCallback(
    async (sections: Section[]) => {
      const baseline = baselineRef.current;
      // Temp id → id thật (để cập nhật selection đang trỏ section mới thêm)
      const idMap: Record<string, string> = {};

      // Deleted: in baseline but not in current
      const currentIds = new Set(
        sections.filter((s) => !s.id.startsWith("temp-")).map((s) => s.id),
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
          idMap[s.id] = created.id;
          synced.push(created);
        } else {
          const original = baseline.find((b) => b.id === s.id);
          const changed =
            !original ||
            original.order !== i ||
            JSON.stringify(original.content) !== JSON.stringify(s.content) ||
            original.type !== s.type;
          if (changed) {
            let updated: Section;
            try {
              updated = await updateSection(pageId, s.id, {
                type: s.type,
                content: s.content,
                order: i,
              });
            } catch (err: unknown) {
              // Snapshot undo/redo có thể chứa section đã bị xóa phía server
              // (vd: undo gỡ section mới thêm rồi redo) — tự tạo lại thay vì
              // để autosave kẹt vòng lặp 404.
              if (String(err instanceof Error ? err.message : err).includes("not found")) {
                updated = await createSection(pageId, {
                  type: s.type,
                  content: s.content,
                  order: i,
                });
              } else {
                throw err;
              }
            }
            synced.push(updated);
          } else {
            synced.push(s);
          }
        }
      }

      baselineRef.current = synced;
      // Dùng action riêng: giữ undo/redo history sau mỗi lần autosave
      dispatch({ type: "SET_SECTIONS_SYNCED", payload: synced, idMap });
    },
    [pageId, dispatch],
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
    [pageId, updatePageAsync],
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
  }, [
    state.sections,
    state.globalStyle,
    state.isDirty,
    state.isSaving,
    dispatch,
    syncSections,
    syncGlobalStyle,
    t,
  ]);

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

  // Chặn data loss: đồng bộ thay đổi chưa lưu (đang chờ debounce) trước khi
  // rời editor hoặc xuất bản — điều hướng client-side không chạy beforeunload.
  const flushPendingSave = useCallback(async () => {
    if (!state.isDirty) return;
    await syncSections(state.sections);
    await syncGlobalStyle(state.globalStyle);
    dispatch({ type: "MARK_CLEAN" });
  }, [state.isDirty, state.sections, state.globalStyle, syncSections, syncGlobalStyle, dispatch]);

  const handleBack = async () => {
    try {
      await flushPendingSave();
    } catch {
      toast.error(t("saveFailed"));
      return; // giữ người dùng lại khi lưu thất bại — tránh mất dữ liệu
    }
    router.push("/pages");
  };

  const handlePublish = async () => {
    try {
      await flushPendingSave();
    } catch {
      toast.error(t("saveFailed"));
      return;
    }
    // Toast thành công/thất bại do onPublish (trang edit) hiển thị —
    // toast ở đây nữa sẽ ra 2 thông báo "Đã xuất bản!" trùng nhau.
    await onPublish(!page.isPublished).catch(() => {});
  };

  // Save the current sections as a reusable template
  const handleSaveAsTemplate = async (name: string, description?: string) => {
    setIsSavingTemplate(true);
    try {
      await createTemplate({
        name,
        description,
        sections: state.sections.map((s, i) => ({
          type: s.type,
          content: s.content,
          order: i,
        })),
      });
      toast.success(tEdit("templateSaved"));
      setShowSaveTemplate(false);
    } catch {
      toast.error(tEdit("templateSaveFailed"));
    } finally {
      setIsSavingTemplate(false);
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

        const startIndex = (source.data as Record<string, unknown>)
          ?.index as number;
        const finishIndex = (dropTarget.data as Record<string, unknown>)
          ?.index as number;
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
        onBack={handleBack}
        onOpenSettings={onOpenSettings}
        onSaveAsTemplate={() => setShowSaveTemplate(true)}
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
      <SaveTemplateDialog
        isOpen={showSaveTemplate}
        isSaving={isSavingTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSave={handleSaveAsTemplate}
      />
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
