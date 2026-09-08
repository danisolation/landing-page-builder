'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';
import Image from 'next/image';

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
  const updateItem = (index: number, patch: Partial<LogoCloudContent['items'][number]>) =>
    onContentChange?.({
      ...content,
      items: (content.items || []).map((it, i) => (i === index ? { ...it, ...patch } : it)),
    });

  return (
    <section className="@container py-(--lp-spacing) px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto text-center">
        {/* Header */}
        <div className="reveal mb-10">
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
