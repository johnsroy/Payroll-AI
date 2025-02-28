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
  width = 80,
  height = 80,
  className = '',
  delay = 0
}: FloatingIllustrationProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay
        }}
      >
        <img 
          src={src} 
          alt={alt} 
          width={width} 
          height={height}
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}