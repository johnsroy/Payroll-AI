import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, AlertCircleIcon } from 'lucide-react';

export type Step = 'upload' | 'analyze' | 'review' | 'implement';

interface StepProgressProps {
  currentStep: Step;
  completedSteps: Step[];
  onStepClick?: (step: Step) => void;
  className?: string;
}

const steps: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload Data' },
  { key: 'analyze', label: 'AI Analysis' },
  { key: 'review', label: 'Review' },
  { key: 'implement', label: 'Implement' },
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
    const stepNumber = getStepNumber(step);
    const currentStepNumber = getStepNumber(currentStep);
    return isCompletedStep(step) || stepNumber === currentStepNumber || stepNumber === currentStepNumber - 1;
  };

  const getStepColor = (step: Step) => {
    if (isCompletedStep(step)) return 'bg-green-500 text-white';
    if (isCurrentStep(step)) return 'bg-blue-500 text-white';
    if (isClickableStep(step)) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-200 text-gray-400';
  };

  const getLineColor = (index: number) => {
    if (index >= steps.length - 1) return '';
    
    const currentStepNumber = getStepNumber(currentStep);
    const nextStepKey = steps[index + 1].key;
    
    if (isCompletedStep(nextStepKey)) return 'bg-green-500';
    if (currentStepNumber > index + 1) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const handleStepClick = (step: Step) => {
    if (onStepClick && isClickableStep(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className={`flex items-center justify-between w-full max-w-4xl mx-auto ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <motion.div 
            className="flex flex-col items-center space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getStepColor(step.key)} ${isClickableStep(step.key) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => handleStepClick(step.key)}
              whileHover={isClickableStep(step.key) ? { scale: 1.1 } : {}}
              whileTap={isClickableStep(step.key) ? { scale: 0.95 } : {}}
            >
              {isCompletedStep(step.key) ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                getStepNumber(step.key)
              )}
            </motion.button>
            <span className={`text-sm font-medium ${isCurrentStep(step.key) ? 'text-blue-700' : isCompletedStep(step.key) ? 'text-green-700' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </motion.div>
          
          {index < steps.length - 1 && (
            <motion.div 
              className={`flex-1 h-0.5 ${getLineColor(index)}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}