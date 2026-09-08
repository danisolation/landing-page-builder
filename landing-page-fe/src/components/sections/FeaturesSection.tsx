'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';

interface FeatureItem {
  icon?: string;
  name?: string;
  description?: string;
}

export interface FeaturesSectionProps {
  content: {
    subtitle?: string;
    title?: string;
    description?: string;
    items?: FeatureItem[];
  };
  isEditing?: boolean;
  onContentChange?: (content: FeaturesSectionProps['content']) => void;
}

export default function FeaturesSection({ content, isEditing, onContentChange }: FeaturesSectionProps) {
  const change = (patch: Partial<FeaturesSectionProps['content']>) =>
    onContentChange?.({ ...content, ...patch });

  const updateItem = (index: number, patch: Partial<FeatureItem>) =>
    change({ items: (content.items || []).map((it, i) => (i === index ? { ...it, ...patch } : it)) });

  return (
    <section className="@container py-(--lp-spacing) bg-muted">
      <div className="max-w-(--lp-width) mx-auto px-4">
        {/* Section Header */}
        <div className="reveal text-center mb-16">
          {content.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wider text-(--lp-primary) mb-3">
              {content.subtitle}
            </p>
          )}
          <InlineTextEditor
            tag="h2"
            editing={isEditing}
            value={content.title || 'Features'}
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

        {/* Feature Cards Grid */}
        <div className="reveal grid grid-cols-1 @3xl:grid-cols-3 gap-8">
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="group relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-(--lp-primary) to-purple-600 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                {item.icon || '✨'}
              </div>

              {/* Text */}
              <InlineTextEditor
                tag="h3"
                editing={isEditing}
                value={item.name || ''}
                onChange={(v) => updateItem(index, { name: v })}
                placeholder="Feature name"
                className="text-lg font-semibold text-foreground mb-2 break-words"
              />
              <InlineTextEditor
                tag="p"
                editing={isEditing}
                value={item.description || ''}
                onChange={(v) => updateItem(index, { description: v })}
                placeholder="Feature description"
                multiline
                className="text-muted-foreground leading-relaxed break-words"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
