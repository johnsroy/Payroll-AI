import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2Icon, 
  AlertCircleIcon, 
  ChevronRightIcon, 
  LineChartIcon, 
  FileTextIcon, 
  PieChartIcon, 
  DollarSignIcon, 
  ArrowUpCircleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon
} from 'lucide-react';

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'tax':
        return <DollarSignIcon className="w-5 h-5 text-green-600" />;
      case 'payroll':
        return <FileTextIcon className="w-5 h-5 text-blue-600" />;
      case 'compliance':
        return <AlertCircleIcon className="w-5 h-5 text-red-600" />;
      case 'optimization':
        return <LineChartIcon className="w-5 h-5 text-purple-600" />;
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
    }
  };

  const getDifficultyColor = (difficulty: Recommendation['implementationDifficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'complex':
        return 'text-red-600';
    }
  };

  const getStatusColor = (status: Recommendation['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'implemented':
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusActions = (status: Recommendation['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-100 text-green-700 p-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(expandedId!, 'approved');
              }}
            >
              <ThumbsUpIcon className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-100 text-red-700 p-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(expandedId!, 'rejected');
              }}
            >
              <ThumbsDownIcon className="w-4 h-4" />
            </motion.button>
          </div>
        );
      case 'approved':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(expandedId!, 'implemented');
            }}
          >
            Implement
          </motion.button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI Recommendations</h2>
        <div className="flex items-center space-x-2 text-sm">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            High Priority
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
            Medium
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            Low
          </span>
        </div>
      </div>

      {recommendations.map((recommendation) => (
        <motion.div
          key={recommendation.id}
          className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${expandedId === recommendation.id ? 'border-blue-400' : 'border-gray-200'}`}
          layout
        >
          <div 
            className={`flex items-center justify-between p-4 cursor-pointer ${expandedId === recommendation.id ? 'bg-blue-50' : 'bg-white'}`}
            onClick={() => setExpandedId(expandedId === recommendation.id ? null : recommendation.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-full">
                {getTypeIcon(recommendation.type)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{recommendation.title}</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className={`uppercase font-medium ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority} priority
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className={`uppercase font-medium ${getDifficultyColor(recommendation.implementationDifficulty)}`}>
                    {recommendation.implementationDifficulty} implementation
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-xs font-medium uppercase rounded-full ${getStatusColor(recommendation.status)}`}>
                {recommendation.status}
              </span>
              <ChevronRightIcon 
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === recommendation.id ? 'rotate-90' : ''}`} 
              />
            </div>
          </div>

          <AnimatePresence>
            {expandedId === recommendation.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200"
              >
                <div className="p-4 bg-gray-50">
                  <p className="text-gray-700 mb-4">{recommendation.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {recommendation.potentialSavings && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-1">
                          <DollarSignIcon className="w-4 h-4" />
                          <span>Potential Savings</span>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          ${recommendation.potentialSavings.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {recommendation.complianceRisk && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-1">
                          <AlertCircleIcon className="w-4 h-4" />
                          <span>Compliance Risk</span>
                        </div>
                        <p className="text-lg font-medium text-red-600">
                          {recommendation.complianceRisk}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 mb-1">
                        <ArrowUpCircleIcon className="w-4 h-4" />
                        <span>Implementation Status</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-lg font-medium ${recommendation.status === 'implemented' ? 'text-green-600' : 'text-gray-700'}`}>
                          {recommendation.status.charAt(0).toUpperCase() + recommendation.status.slice(1)}
                        </span>
                        {getStatusActions(recommendation.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}