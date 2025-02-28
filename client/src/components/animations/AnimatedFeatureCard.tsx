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
    threshold: 0.1,
  });
  
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.2,
      }
    }
  };
  
  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">
        {description}
      </p>
    </motion.div>
  );
}