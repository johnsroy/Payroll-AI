import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-100 to-white opacity-80 z-0"
        animate={{
          background: [
            'linear-gradient(to bottom, #EFF6FF 0%, #DBEAFE 50%, #ffffff 100%)',
            'linear-gradient(to bottom, #EBF5FF 0%, #E1F0FF 50%, #ffffff 100%)',
            'linear-gradient(to bottom, #EFF6FF 0%, #DBEAFE 50%, #ffffff 100%)'
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default GradientBackground;