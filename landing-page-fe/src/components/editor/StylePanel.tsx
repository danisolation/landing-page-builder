"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function StylePanel() {
  const t = useTranslations("editor");

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("primaryColor")}</Label>
        <div className="flex gap-2">
          <Input type="color" defaultValue="#3b82f6" className="w-12 h-10 p-1" />
          <Input defaultValue="#3b82f6" placeholder="Hex color" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("fontFamily")}</Label>
        <select className="w-full h-10 px-3 rounded-md border bg-background">
          <option value="inter">Inter</option>
          <option value="roboto">Roboto</option>
          <option value="poppins">Poppins</option>
          <option value="playfair">Playfair Display</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("sectionSpacing")}</Label>
        <input
          type="range"
          defaultValue={60}
          min={20}
          max={120}
          step={10}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("contentWidth")}</Label>
        <input
          type="range"
          defaultValue={1200}
          max={1400}
          min={800}
          step={50}
          className="w-full"
        />
      </div>
    </div>
  );
}
