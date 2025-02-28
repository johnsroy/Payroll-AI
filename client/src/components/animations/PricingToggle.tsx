import React from 'react';
import { motion } from 'framer-motion';

interface PricingToggleProps {
  isAnnual: boolean;
  setIsAnnual: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PricingToggle({ isAnnual, setIsAnnual }: PricingToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12">
      <div 
        className={`font-medium text-base ${!isAnnual ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
      >
        Monthly
      </div>
      
      <div 
        onClick={() => setIsAnnual(!isAnnual)} 
        className="relative w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer flex items-center p-1"
      >
        <motion.div 
          animate={{ x: isAnnual ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-md"
        />
        <span className="sr-only">{isAnnual ? 'Annual' : 'Monthly'} billing</span>
      </div>
      
      <div className="flex items-center">
        <div 
          className={`font-medium text-base ${isAnnual ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Annual
        </div>
        <div className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-green-500 rounded-full">
          Save 20%
        </div>
      </div>
    </div>
  );
}