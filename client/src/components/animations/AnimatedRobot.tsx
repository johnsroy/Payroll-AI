import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedRobot() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ y: 0 }}
        animate={{ 
          y: [0, -15, 0],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="relative z-10"
      >
        <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-full">
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            {/* Robot Body */}
            <motion.rect 
              fill="#4F46E5" 
              x="50" y="70" 
              width="100" height="90" 
              rx="10"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: [1, 1.05, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* Robot Head */}
            <rect fill="#4F46E5" x="65" y="30" width="70" height="50" rx="10" />
            
            {/* Robot Eyes */}
            <motion.g
              animate={{ 
                translateX: [0, 2, 0, -2, 0],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <circle fill="#FFFFFF" cx="85" cy="55" r="10" />
              <circle fill="#FFFFFF" cx="115" cy="55" r="10" />
              <circle fill="#000000" cx="85" cy="55" r="5" />
              <circle fill="#000000" cx="115" cy="55" r="5" />
            </motion.g>
            
            {/* Robot Mouth */}
            <motion.rect 
              fill="#FFFFFF" 
              x="80" y="75" 
              width="40" height="5" 
              rx="2.5"
              animate={{ 
                scaleX: [1, 0.7, 1],
                translateY: [0, 2, 0]
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.5, 1],
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
            
            {/* Robot Antenna */}
            <rect fill="#4F46E5" x="95" y="15" width="10" height="15" rx="5" />
            <motion.circle 
              fill="#FF5757" 
              cx="100" cy="15" 
              r="5"
              animate={{ 
                opacity: [1, 0.5, 1],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
            
            {/* Robot Arms */}
            <motion.rect 
              fill="#4F46E5" 
              x="30" y="80" 
              width="20" 
              height="10" 
              rx="5"
              animate={{ rotate: [0, -10, 0, 10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
              style={{ originX: 1, originY: 0.5 }}
            />
            <motion.rect 
              fill="#4F46E5" 
              x="150" y="80" 
              width="20" 
              height="10" 
              rx="5"
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
              style={{ originX: 0, originY: 0.5 }}
            />
            
            {/* Robot Legs */}
            <rect fill="#4F46E5" x="60" y="160" width="20" height="30" rx="5" />
            <rect fill="#4F46E5" x="120" y="160" width="20" height="30" rx="5" />
            
            {/* Robot Panel */}
            <rect fill="#FFFFFF" x="65" y="90" width="70" height="25" rx="5" />
            <motion.circle 
              fill="#62C6FF" 
              cx="80" cy="102.5" 
              r="5"
              animate={{ 
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.2
              }}
            />
            <motion.circle 
              fill="#FF5757" 
              cx="100" cy="102.5" 
              r="5"
              animate={{ 
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.4
              }}
            />
            <motion.circle 
              fill="#62FF8E" 
              cx="120" cy="102.5" 
              r="5"
              animate={{ 
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.6
              }}
            />
          </g>
        </svg>
      </motion.div>
      
      {/* Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/10 rounded-full blur-sm z-0"
        style={{ width: 100, height: 15 }}
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </div>
  );
}