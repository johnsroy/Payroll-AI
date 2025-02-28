import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { CheckSquareIcon, ClipboardListIcon, XCircleIcon, CheckCircleIcon } from 'lucide-react';
import { BackgroundParticles } from '../components/animations/BackgroundParticles';
import { WorkflowMenu } from '../components/layout/WorkflowMenu';
import { WorkflowBanner } from '../components/workflow/WorkflowBanner';
import { AIRecommendations } from '../components/analysis/AIRecommendations';

export default function ReviewPage() {
  type Recommendation = {
    id: string;
    title: string;
    description: string;
    type: 'tax' | 'payroll' | 'compliance' | 'optimization';
    priority: 'high' | 'medium' | 'low';
    potentialSavings?: number;
    complianceRisk?: string;
    implementationDifficulty: 'easy' | 'medium' | 'complex';
    status: 'pending' | 'approved' | 'rejected' | 'implemented';
  };

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
    },
  ]);

  const handleRecommendationStatusChange = (id: string, status: 'pending' | 'approved' | 'rejected' | 'implemented') => {
    setRecommendations(
      recommendations.map(rec => 
        rec.id === id ? { ...rec, status } : rec
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <WorkflowMenu />

      {/* Hero Header */}
      <div className="relative py-10 bg-indigo-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Review AI Recommendations
            </motion.h1>
            <motion.p 
              className="mt-2 text-indigo-100 text-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Assess the AI-generated insights and approve actions to implement
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current step information banner */}
        <WorkflowBanner 
          currentStep="review"
          title="Review Recommendations"
          description="Review and approve AI-generated recommendations for your payroll operations"
        />
        
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <ClipboardListIcon className="w-6 h-6 text-indigo-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">AI Recommendations</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Our AI has analyzed your payroll data and identified the following opportunities.
                Review each recommendation and decide whether to approve, reject, or implement it.
              </p>
              
              <div className="flex space-x-4 mb-8">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">High Priority</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">Medium Priority</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">Low Priority</span>
                </div>
              </div>
              
              <AIRecommendations 
                recommendations={recommendations} 
                onStatusChange={handleRecommendationStatusChange} 
              />
            </div>
          </motion.div>
          
          <div className="flex justify-between mt-6">
            <Link href="/ai-analysis" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Back to Analysis
            </Link>
            <Link href="/implementation" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Proceed to Implementation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}