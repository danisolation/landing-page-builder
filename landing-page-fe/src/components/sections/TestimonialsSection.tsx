'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';
import { useInView } from '@/hooks/useInView';
import Image from 'next/image';
import { Quote } from 'lucide-react';

interface TestimonialItem {
  quote?: string;
  name?: string;
  role?: string;
  avatar?: string;
}

export interface TestimonialsSectionProps {
  content: {
    subtitle?: string;
    title?: string;
    description?: string;
    items?: TestimonialItem[];
  };
  isEditing?: boolean;
  onContentChange?: (content: TestimonialsSectionProps['content']) => void;
}

export default function TestimonialsSection({ content, isEditing, onContentChange }: TestimonialsSectionProps) {
  const { ref: headerRef, isInView: headerVisible } = useInView();
  const { ref: gridRef, isInView: gridVisible } = useInView();

  const change = (patch: Partial<TestimonialsSectionProps['content']>) =>
    onContentChange?.({ ...content, ...patch });

  const updateItem = (index: number, patch: Partial<TestimonialItem>) =>
    change({ items: (content.items || []).map((it, i) => (i === index ? { ...it, ...patch } : it)) });

  return (
    <section className="@container py-(--lp-spacing) bg-muted">
      <div className="max-w-(--lp-width) mx-auto px-4">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="reveal text-center mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          {content.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wider text-(--lp-primary) mb-3">
              {content.subtitle}
            </p>
          )}
          <InlineTextEditor
            tag="h2"
            editing={isEditing}
            value={content.title || 'Testimonials'}
            onChange={(v) => change({ title: v })}
            placeholder="Section title"
            className="text-2xl @2xl:text-3xl @3xl:text-4xl font-bold text-foreground mb-4 break-words text-balance"
          />
          {content.description && (
            <InlineTextEditor
              tag="p"
              editing={isEditing}
              value={content.description}
              onChange={(v) => change({ description: v })}
              placeholder="Description"
              className="text-muted-foreground max-w-2xl mx-auto text-lg"
            />
          )}
        </div>

        {/* Testimonial Cards */}
        <div
          ref={gridRef}
          className="reveal grid grid-cols-1 @3xl:grid-cols-3 gap-8"
          style={{
            opacity: gridVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="relative bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-border"
              style={{
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease-out ${index * 0.12}s, transform 0.5s ease-out ${index * 0.12}s`,
              }}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-blue-100 dark:text-blue-900/50">
                <Quote size={32} />
              </div>

              {/* Quote text */}
              <InlineTextEditor
                tag="p"
                editing={isEditing}
                value={item.quote || ''}
                onChange={(v) => updateItem(index, { quote: v })}
                placeholder="Quote"
                multiline
                className="text-muted-foreground mb-6 leading-relaxed relative z-10 break-words"
              />

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    alt={item.name || ''}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-(--lp-primary) to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {item.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <InlineTextEditor
                    editing={isEditing}
                    value={item.name || ''}
                    onChange={(v) => updateItem(index, { name: v })}
                    placeholder="Name"
                    className="block font-semibold text-foreground text-sm truncate"
                  />
                  <InlineTextEditor
                    editing={isEditing}
                    value={item.role || ''}
                    onChange={(v) => updateItem(index, { role: v })}
                    placeholder="Role"
                    className="block text-xs text-muted-foreground truncate"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
