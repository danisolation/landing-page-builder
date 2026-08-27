'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface TestimonialItem {
  quote?: string;
  name?: string;
  role?: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  content: {
    subtitle?: string;
    title?: string;
    description?: string;
    items?: TestimonialItem[];
  };
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function TestimonialsSection({ content }: TestimonialsSectionProps) {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {content.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
              {content.subtitle}
            </p>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {content.title || 'Testimonials'}
          </h2>
          {content.description && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              {content.description}
            </p>
          )}
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {content.items?.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700/50"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-blue-100 dark:text-blue-900/50">
                <Quote size={32} />
              </div>

              {/* Quote text */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed relative z-10">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {item.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
