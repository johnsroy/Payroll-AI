import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileIcon, 
  BarChart2Icon, 
  CheckSquareIcon, 
  ZapIcon, 
  ArrowRightIcon,
  CheckIcon
} from 'lucide-react';

export type Step = 'upload' | 'analyze' | 'review' | 'implement';

interface StepProgressProps {
  currentStep: Step;
  completedSteps: Step[];
  onStepClick?: (step: Step) => void;
  className?: string;
}

const steps: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'analyze', label: 'Analysis' },
  { key: 'review', label: 'Review' },
  { key: 'implement', label: 'Implement' }
];

export function StepProgress({ 
  currentStep, 
  completedSteps, 
  onStepClick,
  className = ''
}: StepProgressProps) {
  const getStepNumber = (step: Step) => {
    return steps.findIndex(s => s.key === step) + 1;
  };
  
  const isCurrentStep = (step: Step) => currentStep === step;
  const isCompletedStep = (step: Step) => completedSteps.includes(step);
  const isClickableStep = (step: Step) => {
    if (isCurrentStep(step) || isCompletedStep(step)) return true;
    
    // Allow clicking the next step after the last completed step
    const lastCompletedStepIndex = Math.max(
      ...completedSteps.map(s => getStepNumber(s) - 1),
      -1
    );
    const stepIndex = getStepNumber(step) - 1;
    
    return stepIndex === lastCompletedStepIndex + 1;
  };
  
  const getStepColor = (step: Step) => {
    if (isCurrentStep(step)) {
      switch (step) {
        case 'upload': return 'text-blue-600 border-blue-600 bg-blue-50';
        case 'analyze': return 'text-blue-600 border-blue-600 bg-blue-50';
        case 'review': return 'text-amber-600 border-amber-600 bg-amber-50';
        case 'implement': return 'text-green-600 border-green-600 bg-green-50';
      }
    }
    
    if (isCompletedStep(step)) {
      switch (step) {
        case 'upload': return 'text-blue-600 border-blue-600 bg-blue-600';
        case 'analyze': return 'text-blue-600 border-blue-600 bg-blue-600';
        case 'review': return 'text-amber-600 border-amber-600 bg-amber-600';
        case 'implement': return 'text-green-600 border-green-600 bg-green-600';
      }
    }
    
    return 'text-gray-400 border-gray-300 bg-white';
  };
  
  const getConnectionColor = (step: Step) => {
    const stepIndex = getStepNumber(step) - 1;
    const prevStep = steps[stepIndex - 1]?.key;
    
    if (!prevStep) return '';
    
    if (isCompletedStep(step)) {
      switch (step) {
        case 'upload': return 'bg-blue-600';
        case 'analyze': return 'bg-blue-600';
        case 'review': return 'bg-amber-600';
        case 'implement': return 'bg-green-600';
      }
    }
    
    if (isCurrentStep(step) && isCompletedStep(prevStep)) {
      switch (step) {
        case 'upload': return 'bg-blue-600';
        case 'analyze': return 'bg-blue-600';
        case 'review': return 'bg-amber-600';
        case 'implement': return 'bg-green-600';
      }
    }
    
    return 'bg-gray-300';
  };
  
  const getStepIcon = (step: Step) => {
    switch (step) {
      case 'upload':
        return isCompletedStep(step) ? 
          <CheckIcon className="h-6 w-6 text-white" /> :
          <FileIcon className="h-6 w-6" />;
      case 'analyze':
        return isCompletedStep(step) ? 
          <CheckIcon className="h-6 w-6 text-white" /> :
          <BarChart2Icon className="h-6 w-6" />;
      case 'review':
        return isCompletedStep(step) ? 
          <CheckIcon className="h-6 w-6 text-white" /> :
          <CheckSquareIcon className="h-6 w-6" />;
      case 'implement':
        return isCompletedStep(step) ? 
          <CheckIcon className="h-6 w-6 text-white" /> :
          <ZapIcon className="h-6 w-6" />;
    }
  };
  
  const handleStepClick = (step: Step) => {
    if (onStepClick && isClickableStep(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            {/* Step */}
            <motion.button
              className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                getStepColor(step.key)
              } ${
                isClickableStep(step.key) ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => handleStepClick(step.key)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.15, duration: 0.3 }}
              whileHover={isClickableStep(step.key) ? { scale: 1.05 } : {}}
            >
              {getStepIcon(step.key)}
            </motion.button>
            
            {/* Connector */}
            {index < steps.length - 1 && (
              <motion.div 
                className={`flex-1 h-1 max-w-24 mx-1 ${getConnectionColor(steps[index + 1].key)}`}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: index * 0.15 + 0.1, duration: 0.4 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-2">
        {steps.map((step, index) => (
          <motion.div
            key={`label-${step.key}`}
            className={`text-sm font-medium transition-colors ${
              isCurrentStep(step.key) ? 'text-gray-900' :
              isCompletedStep(step.key) ? 'text-gray-700' : 'text-gray-500'
            } w-12 text-center`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.2, duration: 0.3 }}
          >
            {step.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}