"use client";

import { useTranslations } from "next-intl";
import { Layers, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditorState } from "./hooks/useEditorState";
import SectionPicker from "./SectionPicker";
import StylePanel from "./StylePanel";
import SectionEditor from "./SectionEditor";

type SidebarTab = "sections" | "style" | "edit";

interface EditorSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function EditorSidebar({ collapsed, onToggle }: EditorSidebarProps) {
  const t = useTranslations("editor");
  const { state } = useEditorState();

  const [activeTab, setActiveTab] = React.useState<SidebarTab>("sections");

  // Switch to edit tab when a section is selected
  React.useEffect(() => {
    if (state.selectedSectionId) {
      setActiveTab("edit");
    }
  }, [state.selectedSectionId]);

  if (collapsed) {
    return (
      <div className="w-14 border-r bg-background flex flex-col items-center py-4 gap-2">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronRight size={18} />
        </Button>
        <div className="w-8 h-px bg-border my-2" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setActiveTab("sections");
            onToggle();
          }}
          title={t("sections")}
        >
          <Layers size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setActiveTab("style");
            onToggle();
          }}
          title={t("style")}
        >
          <Settings size={18} />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === "sections" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("sections")}
          >
            <Layers size={16} className="mr-2" />
            {t("sections")}
          </Button>
          <Button
            variant={activeTab === "style" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("style")}
          >
            <Settings size={16} className="mr-2" />
            {t("style")}
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronLeft size={18} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "sections" && <SectionPicker />}
        {activeTab === "style" && <StylePanel />}
        {activeTab === "edit" && <SectionEditor />}
      </div>
    </div>
  );
}

import React from "react";
