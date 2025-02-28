import React from 'react';
import { motion } from 'framer-motion';

export function BackgroundParticles() {
  // Generate random particles data
  const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // random x position (0-100%)
      y: Math.random() * 100, // random y position (0-100%)
      size: Math.random() * 3 + 1, // random size (1-4px)
      duration: Math.random() * 20 + 10, // random animation duration (10-30s)
      delay: Math.random() * 5, // random animation delay (0-5s)
    }));
  };

  const particles = generateParticles(50);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: 0.2,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export default BackgroundParticles;