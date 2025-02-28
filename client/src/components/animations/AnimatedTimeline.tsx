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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
      {/* Progress line */}
      <div className="hidden md:block absolute left-1/2 top-8 bottom-0 w-0.5 bg-blue-100 transform -translate-x-1/2 -z-10"/>
      
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
  );
}

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
  index: number;
}

function TimelineStep({ number, title, description, index }: TimelineStepProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.3,
      }
    }
  };
  
  return (
    <motion.div 
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="text-center"
    >
      <motion.div 
        className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <span className="text-blue-600 font-bold text-xl">{number}</span>
        
        {index < 3 && (
          <motion.div 
            className="hidden md:block absolute w-full right-0 h-0.5 bg-blue-100 -z-10"
            style={{ 
              right: '-100%',
              top: '50%',
              width: 'calc(100% + 2rem)',
              transformOrigin: 'left'
            }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ delay: index * 0.3 + 0.5, duration: 0.8 }}
          />
        )}
      </motion.div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">
        {description}
      </p>
    </motion.div>
  );
}