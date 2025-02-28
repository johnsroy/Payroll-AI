import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  TrendingUpIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';

import { BackgroundParticles } from '../../components/animations/BackgroundParticles';
import { StepProgress, Step } from '../../components/workflow/StepProgress';
import { WorkflowMenu } from '../../components/layout/WorkflowMenu';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'tax' | 'payroll' | 'compliance' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  complianceRisk?: string;
  implementationDifficulty: 'easy' | 'medium' | 'complex';
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  agentSource: string;
  confidence: number;
  details: string;
}

export default function WorkflowReviewPage() {
  // Get state from localStorage for workflow persistence
  const getInitialStep = (): Step => {
    const savedStep = localStorage.getItem('payrollWorkflowStep');
    return (savedStep as Step) || 'review';
  };
  
  const getCompletedSteps = (): Step[] => {
    const savedSteps = localStorage.getItem('payrollWorkflowCompletedSteps');
    return savedSteps ? JSON.parse(savedSteps) : ['upload', 'analyze'];
  };
  
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>(getInitialStep);
  const [completedSteps, setCompletedSteps] = useState<Step[]>(getCompletedSteps);
  const [focusedRecommendation, setFocusedRecommendation] = useState<Recommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Save workflow state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('payrollWorkflowStep', currentStep);
    localStorage.setItem('payrollWorkflowCompletedSteps', JSON.stringify(completedSteps));
  }, [currentStep, completedSteps]);
  
  // Mock recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 'rec-001',
      title: 'Optimize Tax Withholding Strategy',
      description: 'Based on the employee data, we detected potential for optimizing tax withholding strategies. Several employees appear to have excessive withholding that could be adjusted to provide better cash flow while maintaining compliance.',
      type: 'tax',
      priority: 'high',
      potentialSavings: 12500,
      implementationDifficulty: 'medium',
      status: 'pending',
      agentSource: 'Tax Calculation Agent',
      confidence: 0.92,
      details: 'Analysis of tax withholding rates across all employees shows an average overpayment of 4.2% compared to industry benchmarks. Specifically, 12 employees in the Engineering department have withholding rates over 32%, which exceeds typical rates given their salary bands and dependent statuses. By adjusting these rates to more appropriate levels (28-30%), we estimate annual savings of approximately $12,500 without creating underpayment risk. Implementation requires updates to W-4 forms and payroll system adjustments.'
    },
    {
      id: 'rec-002',
      title: 'Payroll Process Automation Opportunity',
      description: 'Your manual payroll processing is taking approximately 12 hours per pay period. By implementing automated payroll workflows and integrating with your existing systems, you could reduce processing time by up to 70%.',
      type: 'optimization',
      priority: 'medium',
      potentialSavings: 8750,
      implementationDifficulty: 'easy',
      status: 'pending',
      agentSource: 'Data Analysis Agent',
      confidence: 0.87,
      details: 'Time analysis of your payroll processes shows significant manual intervention in data entry, verification, and report generation. Current processing averages 12.4 hours per bi-weekly cycle. By automating timesheet imports, tax calculations, and report generation through API integrations with your existing HR system, we estimate reducing this time to 3.7 hours (70% reduction). This translates to approximately 226 hours saved annually, valued at $8,750 based on current staff costs. Implementation requires setting up API connections and workflow automation rules, which should take 1-2 weeks with minimal disruption.'
    },
    {
      id: 'rec-003',
      title: 'State Tax Filing Compliance Risk',
      description: 'We detected that your company has employees in 3 states where you may not be properly registered for payroll taxes. This creates compliance risks that should be addressed immediately.',
      type: 'compliance',
      priority: 'high',
      complianceRisk: 'Potential penalty exposure of $25,000+',
      implementationDifficulty: 'complex',
      status: 'pending',
      agentSource: 'Compliance Agent',
      confidence: 0.96,
      details: 'Employee address data shows workers in Colorado, Washington, and Georgia, but we found no corresponding state tax registrations or filings in these jurisdictions. These states require employer registration for any employees working there, even remotely. Non-compliance penalties range from $500-1,000 per month of non-filing plus interest on unpaid taxes. Estimated total exposure exceeds $25,000 if left unaddressed. We recommend immediate registration in these states and establishing processes to monitor employee locations. Implementation will require coordination with legal counsel and state tax authorities.'
    },
  ]);
  
  const handleRecommendationAction = (id: string, action: 'approve' | 'reject' | 'implement') => {
    setRecommendations(prevRecs => 
      prevRecs.map(rec => 
        rec.id === id 
          ? { 
              ...rec, 
              status: action === 'approve' ? 'approved' : 
                     action === 'reject' ? 'rejected' : 'implemented' 
            } 
          : rec
      )
    );
    
    // Check if all recommendations have been addressed
    const updatedRecommendations = recommendations.map(rec => 
      rec.id === id 
        ? { 
            ...rec, 
            status: action === 'approve' ? 'approved' : 
                   action === 'reject' ? 'rejected' : 'implemented' 
          } 
        : rec
    );
    
    const allAddressed = updatedRecommendations.every(rec => rec.status !== 'pending');
    
    if (allAddressed) {
      // If all recommendations have been addressed, mark the review step as completed
      if (!completedSteps.includes('review')) {
        setCompletedSteps([...completedSteps, 'review']);
      }
    }
  };
  
  const handleViewDetails = (recommendation: Recommendation) => {
    setFocusedRecommendation(recommendation);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => setFocusedRecommendation(null), 300);
  };
  
  const handleStepClick = (step: Step) => {
    if (completedSteps.includes(step) || 
        step === currentStep || 
        completedSteps.includes(getPreviousStep(step))) {
      setCurrentStep(step);
      
      // Navigation
      if (step === 'upload') {
        setLocation('/workflow/data-connection');
      } else if (step === 'analyze') {
        setLocation('/workflow/data-connection');
      } else if (step === 'implement') {
        setLocation('/workflow/implement');
      }
    }
  };
  
  const getPreviousStep = (step: Step): Step => {
    switch (step) {
      case 'upload': return 'upload';
      case 'analyze': return 'upload';
      case 'review': return 'analyze';
      case 'implement': return 'review';
    }
  };
  
  const handleContinueToImplementation = () => {
    // Mark review step as completed
    if (!completedSteps.includes('review')) {
      setCompletedSteps([...completedSteps, 'review']);
    }
    
    // Move to the implementation step
    setCurrentStep('implement');
    setLocation('/workflow/implement');
  };
  
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'tax':
        return <LightbulbIcon className="w-5 h-5 text-amber-500" />;
      case 'compliance':
        return <AlertTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'optimization':
      case 'payroll':
        return <TrendingUpIcon className="w-5 h-5 text-green-500" />;
      default:
        return <LightbulbIcon className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };
  
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <WorkflowMenu />

      {/* Hero Header */}
      <div className="relative py-8 bg-amber-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Review Recommendations
            </motion.h1>
            <motion.p 
              className="mt-2 text-amber-100 max-w-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Review and approve AI-generated recommendations to optimize your payroll operations
            </motion.p>
          </div>
          
          <div className="mt-8">
            <StepProgress 
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
              className="mb-4"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">AI-Generated Recommendations</h2>
            <p className="text-sm text-gray-600 mt-1">
              Based on your data, our AI agents have identified the following optimization opportunities
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {recommendations.map((recommendation) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border rounded-lg overflow-hidden ${
                    recommendation.status === 'approved' ? 'border-blue-200 bg-blue-50' :
                    recommendation.status === 'rejected' ? 'border-gray-200 bg-gray-50' :
                    recommendation.status === 'implemented' ? 'border-green-200 bg-green-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getRecommendationIcon(recommendation.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{recommendation.title}</h3>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(recommendation.priority)}`}>
                              {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
                            </span>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(recommendation.status)}`}>
                              {recommendation.status.charAt(0).toUpperCase() + recommendation.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">{recommendation.description}</p>
                        
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          {recommendation.potentialSavings && (
                            <div className="inline-flex items-center text-sm text-gray-700">
                              <span className="font-medium">Potential Savings:</span>
                              <span className="ml-1 text-green-600">${recommendation.potentialSavings.toLocaleString()}</span>
                            </div>
                          )}
                          
                          {recommendation.complianceRisk && (
                            <div className="inline-flex items-center text-sm text-gray-700">
                              <span className="font-medium">Risk:</span>
                              <span className="ml-1 text-red-600">{recommendation.complianceRisk}</span>
                            </div>
                          )}
                          
                          <div className="inline-flex items-center text-sm text-gray-700">
                            <span className="font-medium">Difficulty:</span>
                            <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBadgeColor(recommendation.implementationDifficulty)}`}>
                              {recommendation.implementationDifficulty.charAt(0).toUpperCase() + recommendation.implementationDifficulty.slice(1)}
                            </span>
                          </div>
                          
                          <div className="inline-flex items-center text-sm text-gray-700">
                            <span className="font-medium">Source:</span>
                            <span className="ml-1">{recommendation.agentSource}</span>
                          </div>
                          
                          <div className="inline-flex items-center text-sm text-gray-700">
                            <span className="font-medium">Confidence:</span>
                            <span className="ml-1">{Math.round(recommendation.confidence * 100)}%</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <button 
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                            onClick={() => handleViewDetails(recommendation)}
                          >
                            View Details
                            <ChevronRightIcon className="ml-1 h-4 w-4" />
                          </button>
                          
                          {recommendation.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button 
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                onClick={() => handleRecommendationAction(recommendation.id, 'reject')}
                              >
                                <XIcon className="mr-1.5 h-4 w-4 text-gray-500" />
                                Reject
                              </button>
                              <button 
                                className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                                onClick={() => handleRecommendationAction(recommendation.id, 'approve')}
                              >
                                <CheckIcon className="mr-1.5 h-4 w-4 text-blue-500" />
                                Approve
                              </button>
                            </div>
                          )}
                          
                          {recommendation.status === 'approved' && (
                            <button 
                              className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm leading-5 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                              onClick={() => handleRecommendationAction(recommendation.id, 'implement')}
                            >
                              <ArrowRightIcon className="mr-1.5 h-4 w-4 text-green-500" />
                              Implement
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {recommendations.some(rec => rec.status === 'approved' || rec.status === 'implemented') && (
              <div className="mt-8 text-center">
                <button
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-md"
                  onClick={handleContinueToImplementation}
                >
                  Continue to Implementation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recommendation details modal */}
      {showDetails && focusedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                {getRecommendationIcon(focusedRecommendation.type)}
                <h3 className="text-lg font-semibold text-gray-900 ml-2">{focusedRecommendation.title}</h3>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseDetails}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Priority</div>
                  <div className={`text-base font-medium ${
                    focusedRecommendation.priority === 'high' ? 'text-red-600' :
                    focusedRecommendation.priority === 'medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {focusedRecommendation.priority.charAt(0).toUpperCase() + focusedRecommendation.priority.slice(1)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Implementation Difficulty</div>
                  <div className="text-base font-medium">
                    {focusedRecommendation.implementationDifficulty.charAt(0).toUpperCase() + focusedRecommendation.implementationDifficulty.slice(1)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className="text-base font-medium">
                    {Math.round(focusedRecommendation.confidence * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{focusedRecommendation.description}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Analysis</h4>
                <p className="text-gray-600 whitespace-pre-line">{focusedRecommendation.details}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">AI Reasoning</h4>
                <div className="text-sm text-blue-700">
                  <p>This recommendation was generated by the <strong>{focusedRecommendation.agentSource}</strong> with a confidence score of <strong>{Math.round(focusedRecommendation.confidence * 100)}%</strong>.</p>
                  <p className="mt-2">The agent analyzed your payroll data, identified patterns, and compared them against industry benchmarks to generate this recommendation.</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition-colors"
                onClick={handleCloseDetails}
              >
                Close
              </button>
              
              {focusedRecommendation.status === 'pending' && (
                <>
                  <button 
                    className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-md mr-2 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      handleRecommendationAction(focusedRecommendation.id, 'reject');
                      handleCloseDetails();
                    }}
                  >
                    Reject
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      handleRecommendationAction(focusedRecommendation.id, 'approve');
                      handleCloseDetails();
                    }}
                  >
                    Approve
                  </button>
                </>
              )}
              
              {focusedRecommendation.status === 'approved' && (
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  onClick={() => {
                    handleRecommendationAction(focusedRecommendation.id, 'implement');
                    handleCloseDetails();
                  }}
                >
                  Implement
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}