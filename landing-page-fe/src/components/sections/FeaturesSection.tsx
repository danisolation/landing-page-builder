'use client';

import { useInView } from '@/hooks/useInView';

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
}

export default function FeaturesSection({ content }: FeaturesSectionProps) {
  const { ref: headerRef, isInView: headerVisible } = useInView();
  const { ref: gridRef, isInView: gridVisible } = useInView();

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-muted">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="text-center mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          {content.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
              {content.subtitle}
            </p>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.title || 'Features'}
          </h2>
          {content.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {content.description}
            </p>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          style={{
            opacity: gridVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="group relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-200/60 dark:hover:border-blue-700/40 transition-all duration-300"
              style={{
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`,
              }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                {item.icon || '✨'}
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
