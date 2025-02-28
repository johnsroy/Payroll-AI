import React from 'react';
import { motion } from 'framer-motion';

export interface Agent {
  name: string;
  role: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface AnimatedAgentCardProps {
  agent: Agent;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AnimatedAgentCard({ 
  agent, 
  index,
  isSelected = false,
  onClick
}: AnimatedAgentCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: isSelected 
          ? '0 10px 25px -5px rgba(59, 130, 246, 0.5)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.05,
        type: 'spring',
        stiffness: 100,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors cursor-pointer
        ${isSelected 
          ? 'bg-blue-100 border-2 border-blue-500' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
        }`}
    >
      <div className="flex items-start gap-3">
        <motion.div 
          className={`w-10 h-10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${agent.color}`}
          whileHover={{ rotate: 15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
          {agent.icon}
        </motion.div>
        <div>
          <motion.div
            className="font-medium text-blue-700"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.2 }}
          >
            {agent.name}
          </motion.div>
          <motion.div 
            className="text-sm text-gray-600 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.3 }}
          >
            {agent.description}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}