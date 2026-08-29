'use client';

import { motion } from 'framer-motion';
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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function StatsSection({ content }: StatsSectionProps) {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        {content.title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-10 sm:mb-16"
          >
            {content.title}
          </motion.h2>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {content.items?.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
