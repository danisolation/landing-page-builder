"use client";

import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import { ChevronDown } from "lucide-react";

export interface FaqContent {
  subtitle?: string;
  title?: string;
  description?: string;
  items: {
    question: string;
    answer: string;
  }[];
}

export interface FaqSectionProps {
  content: FaqContent;
}

export default function FaqSection({ content }: FaqSectionProps) {
  const { ref, isInView } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4" ref={ref}>
      <div className="max-w-3xl mx-auto">
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
            <p className="text-muted-foreground">{content.description}</p>
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.4s ease-out ${index * 0.05}s, transform 0.4s ease-out ${index * 0.05}s`,
              }}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium pr-4">{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-4 pb-4 text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
