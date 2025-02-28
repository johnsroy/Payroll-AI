import React from 'react';
import { motion } from 'framer-motion';
import { Step } from './StepProgress';

interface WorkflowBannerProps {
  currentStep: Step;
  title: string;
  description: string;
}

export function WorkflowBanner({ currentStep, title, description }: WorkflowBannerProps) {
  const getStepInfo = () => {
    switch(currentStep) {
      case 'upload':
        return {
          color: 'blue',
          text: 'Connect your data sources to begin the optimization process',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          circleColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          headingColor: 'text-blue-800'
        };
      case 'analyze':
        return {
          color: 'purple',
          text: 'Our AI is analyzing your data to find optimization opportunities',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-500',
          circleColor: 'bg-purple-100',
          textColor: 'text-purple-600',
          headingColor: 'text-purple-800'
        };
      case 'review':
        return {
          color: 'amber',
          text: 'Review and approve AI-generated recommendations',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
          circleColor: 'bg-amber-100',
          textColor: 'text-amber-600',
          headingColor: 'text-amber-800'
        };
      case 'implement':
        return {
          color: 'green',
          text: 'Implement approved changes through our automated integrations',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          circleColor: 'bg-green-100',
          textColor: 'text-green-600',
          headingColor: 'text-green-800'
        };
    }
  };

  const stepInfo = getStepInfo();
  const stepNumber = currentStep === 'upload' ? '1' : 
                     currentStep === 'analyze' ? '2' : 
                     currentStep === 'review' ? '3' : '4';

  return (
    <div className={`${stepInfo.bgColor} border-l-4 ${stepInfo.borderColor} p-4 mb-8 rounded-md`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <motion.div 
            className={`h-8 w-8 rounded-full ${stepInfo.circleColor} flex items-center justify-center`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className={`${stepInfo.textColor} text-sm font-bold`}>
              {stepNumber}
            </span>
          </motion.div>
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-medium ${stepInfo.headingColor}`}>
            Step {stepNumber}: {title}
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>{description}</p>
            <p className="mt-1 font-medium">{stepInfo.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}