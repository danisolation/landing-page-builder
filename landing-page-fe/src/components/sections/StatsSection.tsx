'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';
import { useInView } from '@/hooks/useInView';
import CounterAnimation from '@/components/public/CounterAnimation';

interface StatItem {
  value: number;
  suffix?: string;
  label?: string;
}

export interface StatsSectionProps {
  content: {
    title?: string;
    items?: StatItem[];
  };
  isEditing?: boolean;
  onContentChange?: (content: StatsSectionProps['content']) => void;
}

export default function StatsSection({ content, isEditing, onContentChange }: StatsSectionProps) {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  const { ref: gridRef, isInView: gridVisible } = useInView();

  const updateItem = (index: number, patch: Partial<StatItem>) =>
    onContentChange?.({
      ...content,
      items: (content.items || []).map((it, i) => (i === index ? { ...it, ...patch } : it)),
    });

  return (
    <section className="@container py-(--lp-spacing) bg-background">
      <div className="max-w-(--lp-width) mx-auto px-4">
        {content.title && (
          <h2
            ref={titleRef}
            className="reveal text-center mb-8 @2xl:mb-10 @3xl:mb-16"
            style={{
              opacity: titleVisible ? 1 : 0,
              transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            <InlineTextEditor
              tag="span"
              editing={isEditing}
              value={content.title}
              onChange={(v) => onContentChange?.({ ...content, title: v })}
              placeholder="Section title"
              className="text-2xl @2xl:text-3xl @3xl:text-4xl font-bold text-foreground break-words text-balance"
            />
          </h2>
        )}

        <div
          ref={gridRef}
          className="reveal grid grid-cols-2 @3xl:grid-cols-4 gap-4 @2xl:gap-6 @3xl:gap-8"
          style={{
            opacity: gridVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="text-center min-w-0"
              style={{
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'scale(1)' : 'scale(0.9)',
                transition: `opacity 0.5s ease-out ${index * 0.15}s, transform 0.5s ease-out ${index * 0.15}s`,
              }}
            >
              <div className="text-3xl @2xl:text-4xl @3xl:text-5xl font-bold bg-gradient-to-r from-(--lp-primary) to-purple-600 bg-clip-text text-transparent mb-2">
                <CounterAnimation
                  target={item.value || 0}
                  suffix={item.suffix || ''}
                />
              </div>
              <InlineTextEditor
                tag="p"
                editing={isEditing}
                value={item.label || ''}
                onChange={(v) => updateItem(index, { label: v })}
                placeholder="Label"
                className="text-muted-foreground text-sm @3xl:text-base break-words"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
