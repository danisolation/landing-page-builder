"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEditorState } from "./hooks/useEditorState";

const fontOptions = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "playfair", label: "Playfair Display" },
];

export default function StylePanel() {
  const t = useTranslations("editor");
  const { state, updateGlobalStyle } = useEditorState();
  const { globalStyle } = state;

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium" htmlFor="primary-color">
          {t("primaryColor")}
        </Label>
        <div className="flex gap-2">
          <Input
            id="primary-color"
            type="color"
            value={globalStyle.primaryColor}
            onChange={(e) => updateGlobalStyle({ primaryColor: e.target.value })}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            value={globalStyle.primaryColor}
            onChange={(e) => updateGlobalStyle({ primaryColor: e.target.value })}
            placeholder="Hex color"
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium" htmlFor="font-family">
          {t("fontFamily")}
        </Label>
        <select
          id="font-family"
          value={globalStyle.fontFamily}
          onChange={(e) => updateGlobalStyle({ fontFamily: e.target.value })}
          className="w-full h-10 px-3 rounded-md border bg-background text-sm"
        >
          {fontOptions.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium" htmlFor="section-spacing">
          {t("sectionSpacing")}
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="section-spacing"
            type="range"
            value={globalStyle.sectionSpacing}
            min={20}
            max={160}
            step={10}
            onChange={(e) =>
              updateGlobalStyle({ sectionSpacing: Number(e.target.value) })
            }
            className="w-full accent-blue-500"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {globalStyle.sectionSpacing}px
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium" htmlFor="content-width">
          {t("contentWidth")}
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="content-width"
            type="range"
            value={globalStyle.contentWidth}
            max={1400}
            min={800}
            step={50}
            onChange={(e) =>
              updateGlobalStyle({ contentWidth: Number(e.target.value) })
            }
            className="w-full accent-blue-500"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {globalStyle.contentWidth}
          </span>
        </div>
      </div>
    </div>
  );
}
