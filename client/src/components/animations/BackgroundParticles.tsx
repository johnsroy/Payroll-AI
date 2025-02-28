import React from 'react';
import { motion } from 'framer-motion';

export function BackgroundParticles() {
  // Creates an array of 50 particles with random positions
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 10
  }));

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500 opacity-30"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 50 - 25, 0],
            y: [0, Math.random() * 50 - 25, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Particle connections using SVG lines */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.slice(0, 20).map((particle, index) => (
          <React.Fragment key={`connection-${particle.id}`}>
            {particles.slice(index + 1, index + 5).map((connectedParticle) => (
              <motion.line
                key={`line-${particle.id}-${connectedParticle.id}`}
                x1={`${particle.x}%`}
                y1={`${particle.y}%`}
                x2={`${connectedParticle.x}%`}
                y2={`${connectedParticle.y}%`}
                stroke="#93c5fd"
                strokeWidth="1"
                strokeOpacity="0.2"
                animate={{
                  x1: [0, Math.random() * 2 - 1, 0],
                  y1: [0, Math.random() * 2 - 1, 0],
                  x2: [0, Math.random() * 2 - 1, 0],
                  y2: [0, Math.random() * 2 - 1, 0],
                }}
                transition={{
                  duration: (particle.duration + connectedParticle.duration) / 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
}