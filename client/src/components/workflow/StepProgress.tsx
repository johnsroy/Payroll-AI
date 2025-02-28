import React from 'react';
import { 
  FileUpIcon, 
  SearchIcon, 
  CheckSquareIcon, 
  PlayIcon, 
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
  { key: 'upload', label: 'Upload Data' },
  { key: 'analyze', label: 'Analyze' },
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
    if (!onStepClick) return false;
    
    // Allow clicking on completed steps or the current step + 1
    return isCompletedStep(step) || 
           getStepNumber(step) === getStepNumber(currentStep) + 1;
  };

  const getStepColor = (step: Step) => {
    if (isCompletedStep(step)) return 'bg-green-500 text-white border-green-500';
    if (isCurrentStep(step)) {
      switch (step) {
        case 'upload': return 'bg-blue-500 text-white border-blue-500';
        case 'analyze': return 'bg-blue-500 text-white border-blue-500';
        case 'review': return 'bg-amber-500 text-white border-amber-500';
        case 'implement': return 'bg-green-500 text-white border-green-500';
      }
    }
    return 'bg-white text-gray-400 border-gray-300';
  };

  const getConnectionColor = (step: Step) => {
    // This gets the color of the line connecting this step to the previous step
    const stepIndex = steps.findIndex(s => s.key === step);
    if (stepIndex === 0) return ''; // No connection before the first step
    
    const prevStep = steps[stepIndex - 1].key;
    if (isCompletedStep(prevStep)) return 'bg-green-500';
    
    return 'bg-gray-300';
  };

  const getStepIcon = (step: Step) => {
    if (isCompletedStep(step)) {
      return <CheckIcon className="w-5 h-5" />;
    }

    switch (step) {
      case 'upload':
        return <FileUpIcon className="w-5 h-5" />;
      case 'analyze':
        return <SearchIcon className="w-5 h-5" />;
      case 'review':
        return <CheckSquareIcon className="w-5 h-5" />;
      case 'implement':
        return <PlayIcon className="w-5 h-5" />;
    }
  };

  const handleStepClick = (step: Step) => {
    if (onStepClick && isClickableStep(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          {/* Step connection line */}
          {index > 0 && (
            <div className={`flex-1 h-1 ${getConnectionColor(step.key)}`} />
          )}

          {/* Step circle */}
          <div 
            className={`relative flex flex-col items-center group ${isClickableStep(step.key) ? 'cursor-pointer' : ''}`}
            onClick={() => handleStepClick(step.key)}
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors ${getStepColor(step.key)}`}>
              {getStepIcon(step.key)}
            </div>
            <div className="text-xs font-medium mt-2 text-center">
              {step.label}
            </div>
            
            {isClickableStep(step.key) && !isCurrentStep(step.key) && (
              <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 whitespace-nowrap">
                Click to navigate
              </div>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}