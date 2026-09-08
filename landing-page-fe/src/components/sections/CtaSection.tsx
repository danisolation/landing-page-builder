'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';

export interface CtaSectionProps {
  content: {
    heading?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
  isEditing?: boolean;
  onContentChange?: (content: CtaSectionProps['content']) => void;
}

export default function CtaSection({ content, isEditing, onContentChange }: CtaSectionProps) {
  const change = (patch: Partial<CtaSectionProps['content']>) =>
    onContentChange?.({ ...content, ...patch });

  return (
    <section className="@container relative py-(--lp-spacing) overflow-hidden bg-gradient-to-br from-(--lp-primary) via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-400/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-purple-400/15 rounded-full blur-[100px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <div className="reveal">
          <InlineTextEditor
            tag="h2"
            editing={isEditing}
            value={content.heading || 'Ready to get started?'}
            onChange={(v) => change({ heading: v })}
            placeholder="Heading"
            className="text-2xl @2xl:text-3xl @3xl:text-4xl font-bold text-white mb-4 break-words text-balance"
          />
          {content.description && (
            <InlineTextEditor
              tag="p"
              editing={isEditing}
              value={content.description}
              onChange={(v) => change({ description: v })}
              placeholder="Description"
              className="text-blue-50 text-base @2xl:text-lg mb-6 @2xl:mb-8 max-w-xl mx-auto"
            />
          )}
        </div>

        <div className="reveal flex flex-col @2xl:flex-row gap-3 @2xl:gap-4 justify-center">
          {content.buttonText && (
            <a
              href={content.buttonLink || '#'}
              className="inline-flex items-center justify-center bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 px-6 py-3 @2xl:px-8 @2xl:py-4 rounded-full font-semibold text-base @2xl:text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg min-w-0 max-w-full"
            >
              <InlineTextEditor
                editing={isEditing}
                value={content.buttonText}
                onChange={(v) => change({ buttonText: v })}
                placeholder="Button text"
              />
            </a>
          )}
          {content.secondaryButtonText && (
            <a
              href={content.secondaryButtonLink || '#'}
              className="inline-flex items-center justify-center border-2 border-white/30 text-white px-6 py-3 @2xl:px-8 @2xl:py-4 rounded-full font-semibold text-base @2xl:text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 min-w-0 max-w-full"
            >
              <InlineTextEditor
                editing={isEditing}
                value={content.secondaryButtonText}
                onChange={(v) => change({ secondaryButtonText: v })}
                placeholder="Button text"
              />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
