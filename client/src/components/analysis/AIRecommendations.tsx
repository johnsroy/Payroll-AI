import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon, AlertTriangleIcon, LightbulbIcon, ShieldIcon, TrendingUpIcon } from 'lucide-react';

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
}

interface AIRecommendationsProps {
  recommendations: Recommendation[];
  onStatusChange: (id: string, status: Recommendation['status']) => void;
}

export function AIRecommendations({ 
  recommendations,
  onStatusChange
}: AIRecommendationsProps) {
  
  const getTypeIcon = (type: Recommendation['type']) => {
    switch(type) {
      case 'tax':
        return <LightbulbIcon className="w-5 h-5 text-yellow-500" />;
      case 'payroll':
        return <TrendingUpIcon className="w-5 h-5 text-blue-500" />;
      case 'compliance':
        return <ShieldIcon className="w-5 h-5 text-red-500" />;
      case 'optimization':
        return <TrendingUpIcon className="w-5 h-5 text-green-500" />;
      default:
        return <LightbulbIcon className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch(priority) {
      case 'high':
        return 'bg-indigo-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getDifficultyBadge = (difficulty: Recommendation['implementationDifficulty']) => {
    switch(difficulty) {
      case 'easy':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Easy</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'complex':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Complex</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {recommendations.map((recommendation, index) => (
        <motion.div
          key={recommendation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`border rounded-lg p-5 ${
            recommendation.status === 'approved' ? 'border-green-200 bg-green-50' :
            recommendation.status === 'rejected' ? 'border-red-200 bg-red-50' :
            'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start">
            <div className={`w-4 h-4 rounded-full ${getPriorityColor(recommendation.priority)} mt-1.5 mr-3 flex-shrink-0`}></div>
            
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {getTypeIcon(recommendation.type)}
                <h3 className="ml-2 text-lg font-semibold text-gray-900">{recommendation.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{recommendation.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {recommendation.potentialSavings && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <span className="text-sm text-gray-500">Potential Savings</span>
                    <p className="text-green-700 font-semibold">${recommendation.potentialSavings.toLocaleString()}</p>
                  </div>
                )}
                
                {recommendation.complianceRisk && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <span className="text-sm text-gray-500">Compliance Risk</span>
                    <p className="text-red-700 font-semibold flex items-center">
                      <AlertTriangleIcon className="w-4 h-4 mr-1" />
                      {recommendation.complianceRisk}
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-sm text-gray-500">Implementation</span>
                  <div className="mt-1">
                    {getDifficultyBadge(recommendation.implementationDifficulty)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                {recommendation.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => onStatusChange(recommendation.id, 'rejected')}
                      className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1 text-red-500" />
                      Reject
                    </button>
                    <button 
                      onClick={() => onStatusChange(recommendation.id, 'approved')}
                      className="flex items-center px-3 py-1.5 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 text-sm font-medium transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                      Approve
                    </button>
                  </>
                )}
                
                {recommendation.status === 'approved' && (
                  <>
                    <span className="text-green-600 flex items-center mr-2">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Approved
                    </span>
                    <button 
                      onClick={() => onStatusChange(recommendation.id, 'implemented')}
                      className="flex items-center px-3 py-1.5 border border-indigo-300 rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-sm font-medium transition-colors"
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-1" />
                      Implement
                    </button>
                  </>
                )}
                
                {recommendation.status === 'rejected' && (
                  <span className="text-red-600 flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Rejected
                  </span>
                )}
                
                {recommendation.status === 'implemented' && (
                  <span className="text-indigo-600 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Implemented
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}