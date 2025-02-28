import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <motion.div 
      className={`bg-gradient-to-b from-blue-50 via-white to-blue-50 relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated gradient circles */}
      <motion.div 
        className="absolute top-0 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 20, 0], 
          y: [0, 30, 0] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15,
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        className="absolute -bottom-8 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, -30, 0], 
          y: [0, -20, 0] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div 
        className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          x: [0, 40, 0], 
          y: [0, -40, 0] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 18,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {children}
    </motion.div>
  );
}