import React from 'react';
import { motion } from 'framer-motion';

interface FloatingIllustrationProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  delay?: number;
}

export function FloatingIllustration({
  src,
  alt,
  width = 120,
  height = 120,
  className = '',
  delay = 0
}: FloatingIllustrationProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        delay
      }}
    >
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height}
        className="relative z-10"
      />
      
      {/* Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/10 rounded-full blur-sm z-0"
        style={{ width: width * 0.8, height: height * 0.1 }}
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          delay
        }}
      />
    </motion.div>
  );
}