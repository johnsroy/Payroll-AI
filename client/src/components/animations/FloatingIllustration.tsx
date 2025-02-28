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
  width = 200,
  height = 200,
  className = '',
  delay = 0
}: FloatingIllustrationProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ y: 0 }}
      animate={{ y: [0, -15, 0] }}
      transition={{
        duration: 6,
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
        className="object-contain"
      />
    </motion.div>
  );
}