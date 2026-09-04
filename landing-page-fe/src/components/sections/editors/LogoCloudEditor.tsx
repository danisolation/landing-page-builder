"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LogoCloudContent } from "@/types";

interface LogoCloudEditorProps {
  content: LogoCloudContent;
  onChange: (content: LogoCloudContent) => void;
}

export default function LogoCloudEditor({ content, onChange }: LogoCloudEditorProps) {
  const t = useTranslations("logoCloudEditor");

  const updateField = (field: keyof LogoCloudContent, value: any) => {
    onChange({ ...content, [field]: value });
  };

  const updateItem = (index: number, field: "name" | "imageUrl", value: string) => {
    const newItems = [...(content.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField("items", newItems);
  };

  const addItem = () => {
    const newItems = [...(content.items || []), { name: "Logo" + ((content.items?.length || 0) + 1) }];
    updateField("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = (content.items || []).filter((_, i) => i !== index);
    updateField("items", newItems);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>{t("subtitle")}</Label>
          <Input
            value={content.subtitle || ""}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder={t("subtitlePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("title")}</Label>
          <Input
            value={content.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder={t("titlePlaceholder")}
          />
        </div>
      </div>

      {/* Logo Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("items")}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            {t("addItem")}
          </Button>
        </div>

        {(content.items || []).map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("item")} {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-destructive"
              >
                {t("remove")}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("imageUrl")}</Label>
              <Input
                value={item.imageUrl || ""}
                onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
