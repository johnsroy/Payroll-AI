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
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.5,
            delay: index * 0.1 
          } 
        }
      }}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover={{ y: -5 }}
    >
      <motion.div 
        className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1, rotate: [0, 10, 0] } : { scale: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.1 + 0.2
        }}
      >
        {icon}
      </motion.div>

      <motion.h3 
        className="text-xl font-semibold mb-2"
        initial={{ opacity: 0, x: -10 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {title}
      </motion.h3>

      <motion.p 
        className="text-gray-600 mb-4"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: index * 0.1 + 0.4 }}
      >
        {description}
      </motion.p>

      <motion.ul 
        className="text-sm text-gray-600 space-y-1"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: index * 0.1 + 0.5
            }
          }
        }}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.li 
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          • Specialized AI analysis
        </motion.li>
        <motion.li 
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          • Real-time updates
        </motion.li>
        <motion.li 
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          • Comprehensive reporting
        </motion.li>
      </motion.ul>
    </motion.div>
  );
}