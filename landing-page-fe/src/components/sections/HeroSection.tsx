'use client';

import InlineTextEditor from '@/components/editor/InlineTextEditor';

export interface HeroSectionProps {
  content: {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
  isEditing?: boolean;
  onContentChange?: (content: HeroSectionProps['content']) => void;
}

export default function HeroSection({ content, isEditing, onContentChange }: HeroSectionProps) {
  const change = (patch: Partial<HeroSectionProps['content']>) =>
    onContentChange?.({ ...content, ...patch });

  return (
    <section className="@container relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-(--lp-primary) via-purple-600 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite_2s]" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-400/15 rounded-full blur-[80px] animate-[float_12s_ease-in-out_infinite_4s]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
        <div className="reveal">
          <InlineTextEditor
            tag="h1"
            editing={isEditing}
            value={content.heading || 'Welcome'}
            onChange={(v) => change({ heading: v })}
            placeholder="Heading"
            className="text-4xl @2xl:text-5xl @3xl:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight break-words text-balance"
          />
        </div>

        <div className="reveal">
          <InlineTextEditor
            tag="p"
            editing={isEditing}
            value={content.subheading || ''}
            onChange={(v) => change({ subheading: v })}
            placeholder="Subheading"
            multiline
            className="text-base @2xl:text-lg @3xl:text-xl text-blue-50 mb-8 @2xl:mb-10 max-w-2xl mx-auto leading-relaxed"
          />
        </div>

        <div className="reveal flex flex-col @2xl:flex-row gap-3 @2xl:gap-4 justify-center">
          {content.buttonText && (
            <a
              href={content.buttonLink || '#'}
              className="inline-flex items-center justify-center bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 px-6 py-3 @2xl:px-8 @2xl:py-4 rounded-full font-semibold text-base @2xl:text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg min-w-0 max-w-full"
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

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
    </section>
  );
}
