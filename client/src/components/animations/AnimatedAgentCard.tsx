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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md cursor-pointer 
                 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                 ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${agent.color}`}>
          <span className="text-xl">{agent.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{agent.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role}</p>
        </div>
      </div>
      
      <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">{agent.description}</p>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: isSelected ? '100%' : '0%' }}
        transition={{ duration: 0.3 }}
        className="h-1 bg-blue-500 mt-4 rounded-full"
      />
    </motion.div>
  );
}