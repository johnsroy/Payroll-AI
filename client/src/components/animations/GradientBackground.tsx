import React, { ReactNode } from 'react';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div className={`relative bg-white dark:bg-gray-900 ${className}`}>
      <div className="absolute inset-0 bg-white dark:bg-gray-900">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-indigo-100 to-transparent opacity-30 dark:from-indigo-900/30 dark:to-transparent rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-cyan-100 to-transparent opacity-30 dark:from-cyan-900/30 dark:to-transparent rounded-full filter blur-3xl"></div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}