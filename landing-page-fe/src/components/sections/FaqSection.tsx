"use client";

import { useState } from "react";
import InlineTextEditor from "@/components/editor/InlineTextEditor";
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
  isEditing?: boolean;
  onContentChange?: (content: FaqSectionProps['content']) => void;
}

export default function FaqSection({ content, isEditing, onContentChange }: FaqSectionProps) {
  const { ref, isInView } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="@container py-(--lp-spacing) px-4" ref={ref}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div
          className="reveal text-center mb-12"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
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
            <InlineTextEditor
              tag="p"
              editing={isEditing}
              value={content.description}
              onChange={(v) => onContentChange?.({ ...content, description: v })}
              placeholder="Description"
              className="text-muted-foreground"
            />
          )}
        </div>

        {/* FAQ Items */}
        <div className="reveal space-y-3">
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
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors min-h-[44px]"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span className="font-medium pr-4 min-w-0 break-words">{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={`overflow-hidden transition-all ${
                  openIndex === index ? "max-h-[60rem]" : "max-h-0"
                }`}
              >
                <p className="px-4 pb-4 text-muted-foreground break-words">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
