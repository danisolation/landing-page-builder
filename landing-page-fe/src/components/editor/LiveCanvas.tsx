"use client";

import { useTranslations } from "next-intl";
import { useEditorState } from "./hooks/useEditorState";
import SectionBlock from "./SectionBlock";
import AddSectionDropZone from "./AddSectionDropZone";
import EditableSection from "./EditableSection";
import PublicFooter from "@/components/public/PublicFooter";
import type { Section } from "@/types";

type ViewMode = "desktop" | "tablet" | "mobile";

interface LiveCanvasProps {
  viewMode: ViewMode;
}

export default function LiveCanvas({ viewMode }: LiveCanvasProps) {
  const t = useTranslations("editor");
  const { state } = useEditorState();

  const renderSection = (section: Section, index: number) => {
    return (
      <SectionBlock key={section.id} section={section} index={index} viewMode={viewMode}>
        <EditableSection section={section} />
      </SectionBlock>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-muted/30 p-4">
      <div className="min-h-full bg-background rounded-lg shadow-sm overflow-hidden">
        {state.sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">{t("emptyPage")}</h3>
            <p className="text-sm mb-4">{t("emptyPageHint")}</p>
            <AddSectionDropZone index={0} />
          </div>
        ) : (
          <>
            <AddSectionDropZone index={0} />
            {state.sections.map((section, index) => (
              <div key={section.id}>
                {renderSection(section, index)}
                <AddSectionDropZone index={index + 1} />
              </div>
            ))}
            <PublicFooter />
          </>
        )}
      </div>
    </div>
  );
}
