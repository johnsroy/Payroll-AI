import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface TimelineItem {
  number: number;
  title: string;
  description: string;
}

interface AnimatedTimelineProps {
  items: TimelineItem[];
}

export function AnimatedTimeline({ items }: AnimatedTimelineProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
      {items.map((item, index) => (
        <TimelineStep
          key={item.number}
          number={item.number}
          title={item.title}
          description={item.description}
          index={index}
        />
      ))}
    </div>
  );
}

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
  index: number;
}

function TimelineStep({ number, title, description, index }: TimelineStepProps) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center z-10 relative">
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{number}</span>
        </div>
        
        {/* Show connector line between steps, except for the last one */}
        {index < 2 && (
          <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-indigo-200 dark:bg-indigo-800 -z-10 transform -translate-y-1/2" style={{ width: 'calc(100% - 2rem)' }} />
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
}