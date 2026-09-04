"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PricingContent } from "@/types";

interface PricingEditorProps {
  content: PricingContent;
  onChange: (content: PricingContent) => void;
}

export default function PricingEditor({ content, onChange }: PricingEditorProps) {
  const t = useTranslations("pricingEditor");

  const updateField = (field: keyof PricingContent, value: any) => {
    onChange({ ...content, [field]: value });
  };

  const updatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...(content.plans || [])];
    newPlans[index] = { ...newPlans[index], [field]: value };
    updateField("plans", newPlans);
  };

  const addPlan = () => {
    const newPlans = [...(content.plans || []), {
      name: "New Plan",
      price: "$0",
      period: "month",
      description: "",
      features: ["Feature 1"],
      buttonText: "Get Started",
      buttonLink: "#",
    }];
    updateField("plans", newPlans);
  };

  const removePlan = (index: number) => {
    const newPlans = (content.plans || []).filter((_, i) => i !== index);
    updateField("plans", newPlans);
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...(content.plans || [])];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      features: [...(newPlans[planIndex].features || []), "New feature"],
    };
    updateField("plans", newPlans);
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const newPlans = [...(content.plans || [])];
    const newFeatures = [...(newPlans[planIndex].features || [])];
    newFeatures[featureIndex] = value;
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    updateField("plans", newPlans);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...(content.plans || [])];
    const newFeatures = (newPlans[planIndex].features || []).filter((_, i) => i !== featureIndex);
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    updateField("plans", newPlans);
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
        <div className="space-y-2">
          <Label>{t("description")}</Label>
          <Textarea
            value={content.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("plans")}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPlan}>
            {t("addPlan")}
          </Button>
        </div>

        {(content.plans || []).map((plan, planIndex) => (
          <div key={planIndex} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("plan")} {planIndex + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePlan(planIndex)}
                className="text-destructive"
              >
                {t("remove")}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("planName")}</Label>
                <Input
                  value={plan.name}
                  onChange={(e) => updatePlan(planIndex, "name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("price")}</Label>
                <Input
                  value={plan.price}
                  onChange={(e) => updatePlan(planIndex, "price", e.target.value)}
                  placeholder="$29"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("period")}</Label>
              <Input
                value={plan.period || ""}
                onChange={(e) => updatePlan(planIndex, "period", e.target.value)}
                placeholder="month"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={plan.highlighted || false}
                onChange={(e) => updatePlan(planIndex, "highlighted", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label className="text-sm">{t("highlighted")}</Label>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t("features")}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addFeature(planIndex)}
                >
                  {t("addFeature")}
                </Button>
              </div>
              {plan.features?.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(planIndex, featureIndex)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
