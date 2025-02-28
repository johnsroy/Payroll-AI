import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        
        {/* Animated gradient circles */}
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-100 opacity-50 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-indigo-100 opacity-50 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-24 left-1/3 w-64 h-64 rounded-full bg-purple-100 opacity-40 blur-3xl"
          animate={{
            x: [0, 15, 0],
            y: [0, -25, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}