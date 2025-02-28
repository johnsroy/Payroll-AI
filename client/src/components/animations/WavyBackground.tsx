import React, { ReactNode } from 'react';

interface WavyBackgroundProps {
  children: ReactNode;
  className?: string;
  waveColor?: string;
}

export function WavyBackground({ 
  children,
  className = '',
  waveColor = 'rgba(96, 165, 250, 0.2)' 
}: WavyBackgroundProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Wave SVG */}
        <div className="absolute inset-x-0 bottom-0 h-32">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full h-full"
          >
            <path 
              fill={waveColor} 
              fillOpacity="1" 
              d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,176C672,181,768,171,864,154.7C960,139,1056,117,1152,117.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full h-full opacity-50"
            style={{ transform: 'translateX(100px)' }}
          >
            <path 
              fill={waveColor} 
              fillOpacity="0.8" 
              d="M0,224L40,229.3C80,235,160,245,240,240C320,235,400,213,480,181.3C560,149,640,107,720,112C800,117,880,171,960,176C1040,181,1120,139,1200,122.7C1280,107,1360,117,1400,122.7L1440,128L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}