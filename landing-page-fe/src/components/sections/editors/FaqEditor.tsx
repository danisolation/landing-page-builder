"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FaqContent, FaqItem } from "@/types";

interface FaqEditorProps {
  content: FaqContent;
  onChange: (content: FaqContent) => void;
}

export default function FaqEditor({ content, onChange }: FaqEditorProps) {
  const t = useTranslations("faqEditor");

  const updateField = (field: keyof FaqContent, value: string | FaqItem[]) => {
    onChange({ ...content, [field]: value });
  };

  const updateItem = (index: number, field: "question" | "answer", value: string) => {
    const newItems = [...(content.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField("items", newItems);
  };

  const addItem = () => {
    const newItems = [...(content.items || []), { question: "", answer: "" }];
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
          <Label htmlFor="faq-subtitle">{t("subtitle")}</Label>
          <Input
            id="faq-subtitle"
            value={content.subtitle || ""}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder={t("subtitlePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-title">{t("title")}</Label>
          <Input
            id="faq-title"
            value={content.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder={t("titlePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-description">{t("description")}</Label>
          <Textarea
            id="faq-description"
            value={content.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* FAQ Items */}
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
              <Label htmlFor={`faq-question-${index}`}>{t("question")}</Label>
              <Input
                id={`faq-question-${index}`}
                value={item.question}
                onChange={(e) => updateItem(index, "question", e.target.value)}
                placeholder={t("questionPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`faq-answer-${index}`}>{t("answer")}</Label>
              <Textarea
                id={`faq-answer-${index}`}
                value={item.answer}
                onChange={(e) => updateItem(index, "answer", e.target.value)}
                rows={3}
                placeholder={t("answerPlaceholder")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
