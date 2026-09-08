'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';
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
  const updateItem = (index: number, patch: Partial<StatItem>) =>
    onContentChange?.({
      ...content,
      items: (content.items || []).map((it, i) => (i === index ? { ...it, ...patch } : it)),
    });

  return (
    <section className="@container py-(--lp-spacing) bg-background">
      <div className="max-w-(--lp-width) mx-auto px-4">
        {content.title && (
          <h2 className="reveal text-center mb-8 @2xl:mb-10 @3xl:mb-16">
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

        <div className="reveal grid grid-cols-2 @3xl:grid-cols-4 gap-4 @2xl:gap-6 @3xl:gap-8">
          {content.items?.map((item, index) => (
            <div key={index} className="text-center min-w-0">
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
