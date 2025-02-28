import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedRobot() {
  return (
    <motion.div
      className="relative"
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      <div className="relative w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <div className="text-5xl">🤖</div>
      </div>
    </motion.div>
  );
}