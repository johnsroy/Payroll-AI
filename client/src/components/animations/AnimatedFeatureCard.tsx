import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface AnimatedFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index?: number;
}

export function AnimatedFeatureCard({ 
  icon, 
  title, 
  description,
  index = 0 
}: AnimatedFeatureCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
    >
      <div className="rounded-lg p-3 bg-indigo-50 dark:bg-indigo-900/30 w-fit mb-4 text-indigo-600 dark:text-indigo-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
      <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
        <span className="group-hover:underline transition-all">Learn more</span>
        <svg 
          className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" 
          fill="none"
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </div>
    </motion.div>
  );
}