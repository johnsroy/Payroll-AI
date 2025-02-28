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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-4 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {items.map((item, index) => (
        <TimelineStep
          key={item.number}
          number={item.number}
          title={item.title}
          description={item.description}
          index={index}
          isLast={index === items.length - 1}
        />
      ))}
    </motion.div>
  );
}

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
  index: number;
  isLast: boolean;
}

function TimelineStep({ number, title, description, index, isLast }: TimelineStepProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  return (
    <motion.div 
      ref={ref}
      className="flex flex-col items-center text-center"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ 
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      <motion.div 
        className="relative w-20 h-20 mb-6"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1, rotate: [0, 10, 0] } : {}}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.1 + 0.2
        }}
      >
        {/* Circle background with pulsing animation */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-blue-600"
          animate={{
            boxShadow: inView 
              ? ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 8px rgba(59, 130, 246, 0.2)', '0 0 0 0 rgba(59, 130, 246, 0)']
              : '0 0 0 0 rgba(59, 130, 246, 0)'
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: index * 0.2 + 0.3
          }}
        />
        
        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
          {number}
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-xl font-semibold mb-2 text-blue-700"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.5 }}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-gray-600"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.7 }}
      >
        {description}
      </motion.p>
      
      {/* Connector line (visible on mobile only) */}
      {!isLast && (
        <motion.div 
          className="w-0.5 h-8 bg-blue-200 my-4 md:hidden"
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.8 }}
        />
      )}
      
      {/* Connector line (visible on desktop only) */}
      {!isLast && (
        <div className="hidden md:block absolute left-1/2 top-10 w-full h-0.5">
          <motion.div 
            className="h-full bg-blue-200"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      )}
    </motion.div>
  );
}