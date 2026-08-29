'use client';

import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            {content.heading || 'Ready to get started?'}
          </h2>
          {content.description && (
            <p className="text-blue-100/80 text-lg mb-8 max-w-xl mx-auto">
              {content.description}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {content.buttonText && (
            <a
              href={content.buttonLink || '#'}
              className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg"
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
        </motion.div>
      </div>
    </section>
  );
}
