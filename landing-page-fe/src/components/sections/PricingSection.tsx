"use client";

import { useInView } from "@/hooks/useInView";
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
}

export default function PricingSection({ content }: PricingSectionProps) {
  const { ref, isInView } = useInView();

  return (
    <section className="py-20 px-4 bg-muted/30" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-12"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          {content.subtitle && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
              {content.subtitle}
            </p>
          )}
          {content.title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h2>
          )}
          {content.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.plans?.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-2xl p-6 transition-all",
                plan.highlighted
                  ? "bg-blue-600 text-white scale-105 shadow-xl shadow-blue-500/25"
                  : "bg-background border hover:shadow-lg"
              )}
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`,
              }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <h3 className={cn("text-lg font-semibold mb-2", plan.highlighted && "text-white")}>
                {plan.name}
              </h3>

              <div className="mb-4">
                <span className={cn("text-4xl font-bold", plan.highlighted && "text-white")}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={cn("text-sm", plan.highlighted ? "text-blue-100" : "text-muted-foreground")}>
                    /{plan.period}
                  </span>
                )}
              </div>

              {plan.description && (
                <p className={cn("text-sm mb-6", plan.highlighted ? "text-blue-100" : "text-muted-foreground")}>
                  {plan.description}
                </p>
              )}

              <ul className="space-y-3 mb-6">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={cn("mt-0.5", plan.highlighted ? "text-blue-200" : "text-blue-600")}>
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
