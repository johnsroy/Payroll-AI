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
  width = 100,
  height = 100,
  className = '',
  delay = 0
}: FloatingIllustrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`relative ${className}`}
    >
      <motion.div
        animate={{ 
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
      >
        <img 
          src={src} 
          alt={alt} 
          width={width} 
          height={height}
          className="object-contain"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </motion.div>
    </motion.div>
  );
}