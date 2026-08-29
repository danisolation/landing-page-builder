'use client';

import { useInView } from '@/hooks/useInView';

export interface CtaSectionProps {
  content: {
    heading?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
}

export default function CtaSection({ content }: CtaSectionProps) {
  const { ref: textRef, isInView: textVisible } = useInView();
  const { ref: btnRef, isInView: btnVisible } = useInView();

  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
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
        <div
          ref={textRef}
          style={{
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            {content.heading || 'Ready to get started?'}
          </h2>
          {content.description && (
            <p className="text-blue-100/80 text-lg mb-8 max-w-xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        <div
          ref={btnRef}
          style={{
            opacity: btnVisible ? 1 : 0,
            transform: btnVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out 0.15s, transform 0.6s ease-out 0.15s',
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {content.buttonText && (
            <a
              href={content.buttonLink || '#'}
              className="inline-flex items-center justify-center bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg"
            >
              {content.buttonText}
            </a>
          )}
          {content.secondaryButtonText && (
            <a
              href={content.secondaryButtonLink || '#'}
              className="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              {content.secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
