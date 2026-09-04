"use client";

import { useTranslations } from "next-intl";
import { useEditorState } from "./hooks/useEditorState";
import { sectionEditors } from "@/components/sections/section-constants";

export default function SectionEditor() {
  const t = useTranslations("editor");
  const { state, updateSection, selectSection } = useEditorState();

  const selectedSection = state.sections.find((s) => s.id === state.selectedSectionId);

  if (!selectedSection) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">{t("selectSectionToEdit")}</p>
      </div>
    );
  }

  const EditorComponent = sectionEditors[selectedSection.type];

  const handleContentChange = (content: any) => {
    updateSection(selectedSection.id, content);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium capitalize">{selectedSection.type} {t("settings")}</h3>
        <button
          onClick={() => selectSection(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t("deselect")}
        </button>
      </div>

      {EditorComponent ? (
        <EditorComponent
          content={selectedSection.content}
          onChange={handleContentChange}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{t("noEditorAvailable")}</p>
      )}
    </div>
  );
}
