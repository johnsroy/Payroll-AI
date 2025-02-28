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
  waveColor = '#3b82f6' 
}: WavyBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Wave SVG animations */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <svg
            className="w-full h-auto"
            viewBox="0 0 1440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill={waveColor}
              fillOpacity="0.1"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill={waveColor}
              fillOpacity="0.2"
            />
          </svg>
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}