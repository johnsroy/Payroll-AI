import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface WavyBackgroundProps {
  children: ReactNode;
  className?: string;
  waveColor?: string;
}

export function WavyBackground({ 
  children, 
  className = '',
  waveColor = 'rgba(79, 70, 229, 0.1)'
}: WavyBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Top wave decoration */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <svg
          className="w-full h-auto"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            d="M0 50C220 50 220 20 440 20C660 20 660 80 880 80C1100 80 1100 0 1320 0C1430 0 1440 25 1440 25V100H0V50Z"
            fill={waveColor}
          />
        </svg>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg
          className="w-full h-auto"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ transform: 'rotate(180deg)' }}
        >
          <motion.path
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            d="M0 50C220 50 220 20 440 20C660 20 660 80 880 80C1100 80 1100 0 1320 0C1430 0 1440 25 1440 25V100H0V50Z"
            fill={waveColor}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}