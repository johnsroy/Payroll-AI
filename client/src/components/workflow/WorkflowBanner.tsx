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
          text: 'Connect your data sources to begin the optimization process'
        };
      case 'analyze':
        return {
          color: 'purple',
          text: 'Our AI is analyzing your data to find optimization opportunities'
        };
      case 'review':
        return {
          color: 'amber',
          text: 'Review and approve AI-generated recommendations'
        };
      case 'implement':
        return {
          color: 'green',
          text: 'Implement approved changes through our automated integrations'
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className={`bg-${stepInfo.color}-50 border-l-4 border-${stepInfo.color}-500 p-4 mb-8 rounded-md`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <motion.div 
            className={`h-8 w-8 rounded-full bg-${stepInfo.color}-100 flex items-center justify-center`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className={`text-${stepInfo.color}-600 text-sm font-bold`}>
              {currentStep === 'upload' ? '1' : 
               currentStep === 'analyze' ? '2' : 
               currentStep === 'review' ? '3' : '4'}
            </span>
          </motion.div>
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-medium text-${stepInfo.color}-800`}>
            Step {currentStep === 'upload' ? '1' : 
                 currentStep === 'analyze' ? '2' : 
                 currentStep === 'review' ? '3' : '4'}: {title}
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