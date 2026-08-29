'use client';

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
}

export default function StatsSection({ content }: StatsSectionProps) {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  const { ref: gridRef, isInView: gridVisible } = useInView();

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        {content.title && (
          <h2
            ref={titleRef}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-10 sm:mb-16"
            style={{
              opacity: titleVisible ? 1 : 0,
              transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            {content.title}
          </h2>
        )}

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{
            opacity: gridVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="text-center"
              style={{
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'scale(1)' : 'scale(0.9)',
                transition: `opacity 0.5s ease-out ${index * 0.15}s, transform 0.5s ease-out ${index * 0.15}s`,
              }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                <CounterAnimation
                  target={item.value || 0}
                  suffix={item.suffix || ''}
                />
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
