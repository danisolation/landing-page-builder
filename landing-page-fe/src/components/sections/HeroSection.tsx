'use client';

import { useInView } from '@/hooks/useInView';

export interface HeroSectionProps {
  content: {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
}

export default function HeroSection({ content }: HeroSectionProps) {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  const { ref: subRef, isInView: subVisible } = useInView();
  const { ref: btnRef, isInView: btnVisible } = useInView();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
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
        <div
          ref={titleRef}
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            {content.heading || 'Welcome'}
          </h1>
        </div>

        <div
          ref={subRef}
          style={{
            opacity: subVisible ? 1 : 0,
            transform: subVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out 0.15s, transform 0.8s ease-out 0.15s',
          }}
        >
          <p className="text-lg md:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {content.subheading}
          </p>
        </div>

        <div
          ref={btnRef}
          style={{
            opacity: btnVisible ? 1 : 0,
            transform: btnVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {content.buttonText && (
            <a
              href={content.buttonLink || '#'}
              className="inline-flex items-center justify-center bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg"
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

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
    </section>
  );
}
