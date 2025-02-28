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
  waveColor = '#4f46e5' 
}: WavyBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* First wave */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-20 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
        }}
        transition={{ duration: 1.5 }}
      >
        <svg 
          className="absolute bottom-0 left-0 w-full h-full" 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <motion.path 
            initial={{ d: "M0,224L120,213.3C240,203,480,181,720,192C960,203,1200,245,1320,266.7L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z" }}
            animate={{ 
              d: [
                "M0,224L120,213.3C240,203,480,181,720,192C960,203,1200,245,1320,266.7L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
                "M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
                "M0,224L120,213.3C240,203,480,181,720,192C960,203,1200,245,1320,266.7L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
              ]
            }}
            transition={{ 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 20,
              ease: "easeInOut"
            }}
            fill={waveColor}
            fillOpacity="0.1"
          />
        </svg>
      </motion.div>

      {/* Second wave */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-16 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      >
        <svg 
          className="absolute bottom-0 left-0 w-full h-full" 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <motion.path 
            initial={{ d: "M0,224L120,229.3C240,235,480,245,720,240C960,235,1200,213,1320,202.7L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z" }}
            animate={{ 
              d: [
                "M0,224L120,229.3C240,235,480,245,720,240C960,235,1200,213,1320,202.7L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
                "M0,224L120,234.7C240,245,480,267,720,261.3C960,256,1200,224,1320,208L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
                "M0,224L120,229.3C240,235,480,245,720,240C960,235,1200,213,1320,202.7L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
              ]
            }}
            transition={{ 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 15,
              ease: "easeInOut"
            }}
            fill={waveColor}
            fillOpacity="0.2"
          />
        </svg>
      </motion.div>

      {/* Third wave */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-12 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.4 }}
      >
        <svg 
          className="absolute bottom-0 left-0 w-full h-full" 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <motion.path 
            initial={{ d: "M0,256L120,266.7C240,277,480,299,720,288C960,277,1200,235,1320,213.3L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z" }}
            animate={{ 
              d: [
                "M0,256L120,266.7C240,277,480,299,720,288C960,277,1200,235,1320,213.3L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
                "M0,256L120,261.3C240,267,480,277,720,272C960,267,1200,245,1320,234.7L1440,224L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
                "M0,256L120,266.7C240,277,480,299,720,288C960,277,1200,235,1320,213.3L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
              ]
            }}
            transition={{ 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 10,
              ease: "easeInOut"
            }}
            fill={waveColor}
            fillOpacity="0.3"
          />
        </svg>
      </motion.div>

      {children}
    </div>
  );
}