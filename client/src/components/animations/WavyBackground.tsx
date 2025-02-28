import React, { ReactNode } from 'react';

interface WavyBackgroundProps {
  children: ReactNode;
  className?: string;
  waveColor?: string;
}

export function WavyBackground({ 
  children, 
  className = '',
  waveColor = 'rgba(79, 70, 229, 0.1)'
}: WavyBackgroundProps) {
  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute top-0 w-full h-full transform rotate-180"
          style={{ fill: waveColor }}
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
          style={{ fill: waveColor }}
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>
    </div>
  );
}