import React from 'react';
import { Step } from './StepProgress';

interface WorkflowBannerProps {
  currentStep: Step;
  title: string;
  description: string;
}

export function WorkflowBanner({ currentStep, title, description }: WorkflowBannerProps) {
  const getBannerColor = () => {
    switch (currentStep) {
      case 'upload':
        return 'bg-blue-600';
      case 'analyze':
        return 'bg-blue-600';
      case 'review':
        return 'bg-amber-600';
      case 'implement':
        return 'bg-green-600';
      default:
        return 'bg-blue-600';
    }
  };
  
  const getTextColor = () => {
    switch (currentStep) {
      case 'upload':
        return 'text-blue-100';
      case 'analyze':
        return 'text-blue-100';
      case 'review':
        return 'text-amber-100';
      case 'implement':
        return 'text-green-100';
      default:
        return 'text-blue-100';
    }
  };

  return (
    <div className={`py-8 ${getBannerColor()} text-white overflow-hidden relative`}>
      <div className="absolute inset-0 opacity-10">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(300,300)">
            <path
              d="M140.5,-193.4C186.9,-170.3,231.5,-137.6,252.4,-94.3C273.2,-51,270.4,3,257.7,55.1C245,107.2,222.4,157.5,186,190.5C149.6,223.5,99.4,239.2,50.4,240.1C1.3,241.1,-46.5,227.2,-98.3,205.7C-150,184.2,-205.7,155,-220,109.9C-234.4,64.8,-207.3,3.9,-187.5,-47C-167.7,-97.9,-155.1,-138.8,-128,-170.6C-100.9,-202.4,-59.2,-225.2,-12.3,-228.8C34.7,-232.5,94.1,-216.5,140.5,-193.4Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className={`${getTextColor()} max-w-2xl`}>{description}</p>
        </div>
      </div>
    </div>
  );
}