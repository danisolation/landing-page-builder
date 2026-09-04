"use client";

import { useInView } from "@/hooks/useInView";

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
}

export default function LogoCloudSection({ content }: LogoCloudSectionProps) {
  const { ref, isInView } = useInView();

  return (
    <section className="py-16 px-4 bg-muted/30" ref={ref}>
      <div className="max-w-5xl mx-auto text-center">
        {/* Header */}
        <div
          className="mb-10"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          {content.subtitle && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
              {content.subtitle}
            </p>
          )}
          {content.title && (
            <h2 className="text-2xl md:text-3xl font-bold">{content.title}</h2>
          )}
        </div>

        {/* Logos */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {content.items?.map((item, index) => (
            <div
              key={index}
              className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
              style={{
                opacity: isInView ? 0.6 : 0,
                transform: isInView ? "scale(1)" : "scale(0.9)",
                transition: `opacity 0.4s ease-out ${index * 0.05}s, transform 0.4s ease-out ${index * 0.05}s`,
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-8 md:h-10 w-auto object-contain"
                />
              ) : (
                <span className="text-lg md:text-xl font-semibold text-muted-foreground">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
