"use client";

import InlineTextEditor from "@/components/editor/InlineTextEditor";
import { cn } from "@/lib/utils";

export interface PricingContent {
  subtitle?: string;
  title?: string;
  description?: string;
  plans: {
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    highlighted?: boolean;
    buttonText?: string;
    buttonLink?: string;
  }[];
}

export interface PricingSectionProps {
  content: PricingContent;
  isEditing?: boolean;
  onContentChange?: (content: PricingSectionProps['content']) => void;
}

export default function PricingSection({ content, isEditing, onContentChange }: PricingSectionProps) {
  const updatePlan = (index: number, patch: Partial<PricingContent['plans'][number]>) =>
    onContentChange?.({
      ...content,
      plans: (content.plans || []).map((p, i) => (i === index ? { ...p, ...patch } : p)),
    });

  return (
    <section className="@container py-(--lp-spacing) px-4 bg-muted/30">
      <div className="max-w-(--lp-width) mx-auto">
        {/* Header */}
        <div className="reveal text-center mb-12">
          {content.subtitle && (
            <p className="text-sm font-medium text-(--lp-primary) mb-2">
              {content.subtitle}
            </p>
          )}
          {content.title && (
            <InlineTextEditor
              tag="h2"
              editing={isEditing}
              value={content.title}
              onChange={(v) => onContentChange?.({ ...content, title: v })}
              placeholder="Section title"
              className="text-2xl @2xl:text-3xl @3xl:text-4xl font-bold mb-4 break-words text-balance"
            />
          )}
          {content.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="reveal grid grid-cols-1 @3xl:grid-cols-3 gap-4 @2xl:gap-6">
          {content.plans?.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-2xl p-6 transition-all",
                plan.highlighted
                  ? "bg-(--lp-primary) text-white scale-105 shadow-xl shadow-blue-500/25"
                  : "bg-background border hover:shadow-lg"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <InlineTextEditor
                tag="h3"
                editing={isEditing}
                value={plan.name}
                onChange={(v) => updatePlan(index, { name: v })}
                placeholder="Plan name"
                className={cn("text-lg font-semibold mb-2 break-words", plan.highlighted && "text-white")}
              />

              <div className="mb-4">
                <InlineTextEditor
                  editing={isEditing}
                  value={plan.price}
                  onChange={(v) => updatePlan(index, { price: v })}
                  placeholder="$0"
                  className="text-4xl font-bold"
                />
                {plan.period && (
                  <InlineTextEditor
                    editing={isEditing}
                    value={plan.period}
                    onChange={(v) => updatePlan(index, { period: v })}
                    placeholder="month"
                    className={cn("text-sm", plan.highlighted ? "text-blue-100" : "text-muted-foreground")}
                  />
                )}
              </div>

              {plan.description && (
                <InlineTextEditor
                  tag="p"
                  editing={isEditing}
                  value={plan.description}
                  onChange={(v) => updatePlan(index, { description: v })}
                  placeholder="Plan description"
                  multiline
                  className={cn("text-sm mb-6", plan.highlighted ? "text-blue-100" : "text-muted-foreground")}
                />
              )}

              <ul className="space-y-3 mb-6">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={cn("mt-0.5", plan.highlighted ? "text-blue-200" : "text-(--lp-primary)")}>
                      ✓
                    </span>
                    <span className={plan.highlighted ? "text-blue-50" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.buttonLink || "#"}
                className={cn(
                  "block text-center py-3 rounded-lg font-medium transition-colors",
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {plan.buttonText || "Get Started"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
