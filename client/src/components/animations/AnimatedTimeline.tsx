import React from 'react';
import { motion } from 'framer-motion';

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
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-blue-200 transform -translate-x-1/2"></div>
      
      <div className="space-y-12 relative">
        {items.map((item, index) => (
          <TimelineStep 
            key={index}
            number={item.number}
            title={item.title}
            description={item.description}
            index={index}
          />
        ))}
      </div>
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
  const isEven = index % 2 === 0;
  
  return (
    <div className={`flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      <motion.div 
        className={`md:w-1/2 mb-6 md:mb-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </motion.div>
      
      <motion.div 
        className="relative z-10 flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg shadow-md"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.2,
          type: "spring",
          stiffness: 200,
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {number}
      </motion.div>
      
      <div className="md:w-1/2"></div>
    </div>
  );
}

export default AnimatedTimeline;