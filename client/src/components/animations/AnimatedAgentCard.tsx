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
  const { name, role, description, icon, color } = agent;
  
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md cursor-pointer transition-all
                ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg' : ''}
                hover:shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${color}`}
        >
          {icon}
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      
      {isSelected && (
        <motion.div
          className="mt-3 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}