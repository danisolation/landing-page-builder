'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';
import Image from 'next/image';
import { useInView } from '@/hooks/useInView';

export interface LogoCloudContent {
  subtitle?: string;
  title?: string;
  items: {
    name: string;
    url?: string;
    imageUrl?: string;
  }[];
}

export interface LogoCloudSectionProps {
  content: LogoCloudContent;
  isEditing?: boolean;
  onContentChange?: (content: LogoCloudSectionProps['content']) => void;
}

export default function LogoCloudSection({ content, isEditing, onContentChange }: LogoCloudSectionProps) {
  const { ref, isInView } = useInView();

  const updateItem = (index: number, patch: Partial<LogoCloudContent['items'][number]>) =>
    onContentChange?.({
      ...content,
      items: (content.items || []).map((it, i) => (i === index ? { ...it, ...patch } : it)),
    });

  return (
    <section className="@container py-(--lp-spacing) px-4 bg-muted/30" ref={ref}>
      <div className="max-w-5xl mx-auto text-center">
        {/* Header */}
        <div
          className="reveal mb-10"
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
          <InlineTextEditor
            tag="h2"
            editing={isEditing}
            value={content.title || ''}
            onChange={(v) => onContentChange?.({ ...content, title: v })}
            placeholder="Section title"
            className="text-2xl @3xl:text-3xl font-bold break-words text-balance"
          />
        </div>

        {/* Logos */}
        <div className="reveal flex flex-wrap items-center justify-center gap-8 @3xl:gap-12">
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
              style={{
                opacity: isInView ? 0.6 : 0,
                transform: isInView ? "scale(1)" : "scale(0.9)",
                transition: `opacity 0.4s ease-out ${index * 0.05}s, transform 0.4s ease-out ${index * 0.05}s`,
              }}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={120}
                  height={40}
                  className="h-8 @3xl:h-10 w-auto object-contain"
                />
              ) : (
                <InlineTextEditor
                  editing={isEditing}
                  value={item.name || ''}
                  onChange={(v) => updateItem(index, { name: v })}
                  placeholder="Logo name"
                  className="text-lg @3xl:text-xl font-semibold text-muted-foreground"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
