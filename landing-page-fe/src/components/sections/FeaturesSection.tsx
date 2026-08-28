'use client';

import { motion } from 'framer-motion';

interface FeatureItem {
  icon?: string;
  name?: string;
  description?: string;
}

interface FeaturesSectionProps {
  content: {
    subtitle?: string;
    title?: string;
    description?: string;
    items?: FeatureItem[];
  };
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function FeaturesSection({ content }: FeaturesSectionProps) {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-muted">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
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
        </motion.div>

        {/* Feature Cards Grid */}
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
              className="group relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-200/60 dark:hover:border-blue-700/40 transition-all duration-300"
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
