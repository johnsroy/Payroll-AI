import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient orbs in the background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-3xl"
          animate={{
            x: ['-20%', '10%', '-20%'],
            y: ['-10%', '20%', '-10%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-3xl"
          animate={{
            x: ['10%', '-10%', '10%'],
            y: ['10%', '40%', '10%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-3xl"
          animate={{
            x: ['-40%', '-20%', '-40%'],
            y: ['20%', '0%', '20%'],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}