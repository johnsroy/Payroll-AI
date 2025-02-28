import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  ZapIcon, 
  FileIcon, 
  PlayIcon, 
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  TrendingUpIcon,
} from 'lucide-react';

import { BackgroundParticles } from '../../components/animations/BackgroundParticles';
import { StepProgress, Step } from '../../components/workflow/StepProgress';
import { WorkflowMenu } from '../../components/layout/WorkflowMenu';
import { ZapierIntegrationPanel } from '../../components/data-connection/ZapierIntegrationPanel';
import * as ZapierIntegration from '../../lib/zapierIntegration';

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
  automation?: {
    zapApp?: string;
    zapTemplate?: string;
    customIntegration?: boolean;
    manualSteps?: string[];
  };
}

export default function WorkflowImplementPage() {
  // Get state from localStorage for workflow persistence
  const getInitialStep = (): Step => {
    const savedStep = localStorage.getItem('payrollWorkflowStep');
    return (savedStep as Step) || 'implement';
  };
  
  const getCompletedSteps = (): Step[] => {
    const savedSteps = localStorage.getItem('payrollWorkflowCompletedSteps');
    return savedSteps ? JSON.parse(savedSteps) : ['upload', 'analyze', 'review'];
  };
  
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>(getInitialStep);
  const [completedSteps, setCompletedSteps] = useState<Step[]>(getCompletedSteps);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [zapierApps, setZapierApps] = useState<ZapierIntegration.ZapierApp[]>([]);
  const [isZapierConnected, setIsZapierConnected] = useState(false);
  
  // Save workflow state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('payrollWorkflowStep', currentStep);
    localStorage.setItem('payrollWorkflowCompletedSteps', JSON.stringify(completedSteps));
  }, [currentStep, completedSteps]);
  
  // Load Zapier apps
  useEffect(() => {
    const loadZapierApps = async () => {
      const apps = await ZapierIntegration.getPopularPayrollApps();
      setZapierApps(apps);
    };
    
    loadZapierApps();
  }, []);
  
  // Mock recommendations - these would typically be fetched from a state store or API
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 'rec-001',
      title: 'Optimize Tax Withholding Strategy',
      description: 'Based on the employee data, we detected potential for optimizing tax withholding strategies. Several employees appear to have excessive withholding that could be adjusted to provide better cash flow while maintaining compliance.',
      type: 'tax',
      priority: 'high',
      potentialSavings: 12500,
      implementationDifficulty: 'medium',
      status: 'approved', // Only approved recommendations would be shown here
      agentSource: 'Tax Calculation Agent',
      automation: {
        zapApp: 'QuickBooks Payroll',
        zapTemplate: 'Update Employee Withholding Template',
        manualSteps: [
          'Export recommended changes to CSV',
          'Review changes with accounting team',
          'Schedule implementation date',
          'Notify affected employees'
        ]
      }
    },
    {
      id: 'rec-002',
      title: 'Payroll Process Automation Opportunity',
      description: 'Your manual payroll processing is taking approximately 12 hours per pay period. By implementing automated payroll workflows and integrating with your existing systems, you could reduce processing time by up to 70%.',
      type: 'optimization',
      priority: 'medium',
      potentialSavings: 8750,
      implementationDifficulty: 'easy',
      status: 'implemented', // Some recommendations may already be implemented
      agentSource: 'Data Analysis Agent',
      automation: {
        zapApp: 'Workday',
        zapTemplate: 'Automated Timesheet Processing',
        customIntegration: true
      }
    },
    {
      id: 'rec-003',
      title: 'State Tax Filing Compliance Risk',
      description: 'We detected that your company has employees in 3 states where you may not be properly registered for payroll taxes. This creates compliance risks that should be addressed immediately.',
      type: 'compliance',
      priority: 'high',
      complianceRisk: 'Potential penalty exposure of $25,000+',
      implementationDifficulty: 'complex',
      status: 'approved',
      agentSource: 'Compliance Agent',
      automation: {
        manualSteps: [
          'Contact legal counsel for state registration',
          'File necessary paperwork with state authorities',
          'Configure payroll system for multi-state taxes',
          'Establish monitoring system for employee locations'
        ]
      }
    },
  ]);
  
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
      } else if (step === 'review') {
        setLocation('/workflow/review');
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
  
  const handleImplementRecommendation = (id: string) => {
    setRecommendations(prevRecs => 
      prevRecs.map(rec => 
        rec.id === id 
          ? { ...rec, status: 'implemented' } 
          : rec
      )
    );
  };
  
  const handleConnectZapier = () => {
    setIsZapierConnected(true);
    // In a real implementation, this would connect to the Zapier API
    console.log('Connecting to Zapier...');
  };
  
  const handleFinish = () => {
    // Mark the workflow as completed and navigate back to the home page
    const allSteps: Step[] = ['upload', 'analyze', 'review', 'implement'];
    setCompletedSteps(allSteps);
    setLocation('/');
    
    // In a real implementation, this might also save the workflow results to a database
    console.log('Workflow completed');
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
  
  // Calculate the number of implemented recommendations
  const implementedCount = recommendations.filter(rec => rec.status === 'implemented').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <WorkflowMenu />

      {/* Hero Header */}
      <div className="relative py-8 bg-green-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Implementation
            </motion.h1>
            <motion.p 
              className="mt-2 text-green-100 max-w-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Implement approved recommendations through integrations with your existing tools
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Implementation Progress</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {implementedCount} of {recommendations.length} recommendations implemented
                  </p>
                  
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${(implementedCount / recommendations.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    {recommendations.map((recommendation) => (
                      <div 
                        key={recommendation.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedRecommendation === recommendation.id 
                            ? 'bg-green-50 border-green-300' 
                            : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                        }`}
                        onClick={() => setSelectedRecommendation(recommendation.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {getRecommendationIcon(recommendation.type)}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{recommendation.title}</h4>
                              {recommendation.status === 'implemented' && (
                                <CheckIcon className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {recommendation.description.substring(0, 60)}...
                            </p>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBadgeColor(recommendation.implementationDifficulty)}`}>
                                {recommendation.implementationDifficulty}
                              </span>
                              {recommendation.potentialSavings && (
                                <span className="text-xs text-green-600">${recommendation.potentialSavings.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {implementedCount === recommendations.length && (
                    <div className="mt-6 text-center">
                      <button
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                        onClick={handleFinish}
                      >
                        <CheckIcon className="mr-1.5 h-4 w-4" />
                        Complete Workflow
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {!selectedRecommendation ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <FileIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Select a recommendation</h3>
                  <p className="mt-2 text-gray-500">
                    Select a recommendation from the list to view implementation options
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {recommendations.map((recommendation) => {
                    if (recommendation.id !== selectedRecommendation) return null;
                    
                    return (
                      <div key={recommendation.id}>
                        <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center">
                            {getRecommendationIcon(recommendation.type)}
                            <h3 className="ml-2 text-lg font-medium text-gray-900">{recommendation.title}</h3>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{recommendation.description}</p>
                        </div>
                        
                        <div className="p-6">
                          <h4 className="text-base font-medium text-gray-900 mb-4">Implementation Options</h4>
                          
                          {recommendation.automation?.zapApp && (
                            <div className="mb-6">
                              <div className="flex items-center mb-2">
                                <ZapIcon className="h-5 w-5 text-amber-500 mr-2" />
                                <h5 className="text-sm font-medium text-gray-900">Zapier Integration</h5>
                              </div>
                              
                              <div className="ml-7">
                                <p className="text-sm text-gray-600 mb-3">
                                  Use Zapier to automate this recommendation with {recommendation.automation.zapApp}
                                </p>
                                
                                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mb-3">
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                      <ZapIcon className="h-5 w-5 text-amber-500 mt-0.5" />
                                    </div>
                                    <div className="ml-3">
                                      <h6 className="text-sm font-medium text-amber-800">{recommendation.automation.zapTemplate}</h6>
                                      <p className="text-xs text-amber-700 mt-1">
                                        This template will connect your payroll data to {recommendation.automation.zapApp} and automate the necessary changes.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex">
                                  {!isZapierConnected ? (
                                    <button
                                      className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700 transition-colors"
                                      onClick={handleConnectZapier}
                                    >
                                      Connect Zapier
                                      <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                                    </button>
                                  ) : recommendation.status !== 'implemented' ? (
                                    <button
                                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                                      onClick={() => handleImplementRecommendation(recommendation.id)}
                                    >
                                      Set Up Integration
                                      <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md font-medium"
                                      disabled
                                    >
                                      <CheckIcon className="mr-1.5 h-4 w-4" />
                                      Implemented
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {recommendation.automation?.manualSteps && (
                            <div>
                              <div className="flex items-center mb-2">
                                <CheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                                <h5 className="text-sm font-medium text-gray-900">Manual Steps Required</h5>
                              </div>
                              
                              <div className="ml-7">
                                <p className="text-sm text-gray-600 mb-3">
                                  This recommendation requires some manual steps to fully implement
                                </p>
                                
                                <div className="space-y-2 mb-4">
                                  {recommendation.automation.manualSteps.map((step, index) => (
                                    <div key={index} className="flex items-start">
                                      <div className="flex-shrink-0 bg-blue-100 rounded-full h-5 w-5 flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-xs text-blue-800 font-medium">{index + 1}</span>
                                      </div>
                                      <p className="text-sm text-gray-700">{step}</p>
                                    </div>
                                  ))}
                                </div>
                                
                                {recommendation.status !== 'implemented' && (
                                  <button
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                                    onClick={() => handleImplementRecommendation(recommendation.id)}
                                  >
                                    Mark as Implemented
                                    <CheckIcon className="ml-1.5 h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {isZapierConnected && (
                <div className="mt-6">
                  <ZapierIntegrationPanel 
                    zapierApps={zapierApps}
                    onConnectZapier={handleConnectZapier}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}