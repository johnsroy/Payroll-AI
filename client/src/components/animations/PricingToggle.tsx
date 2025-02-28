import React from 'react';
import { motion } from 'framer-motion';

interface PricingToggleProps {
  isAnnual: boolean;
  setIsAnnual: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PricingToggle({ isAnnual, setIsAnnual }: PricingToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-10">
      <span className={`text-lg ${!isAnnual ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
        Monthly
      </span>
      
      <motion.div 
        className="relative h-8 w-16 rounded-full bg-blue-100 p-1 cursor-pointer"
        onClick={() => setIsAnnual(!isAnnual)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div 
          className="absolute h-6 w-6 rounded-full bg-blue-600"
          animate={{ x: isAnnual ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
      
      <span className={`text-lg ${isAnnual ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
        Annual <span className="text-green-500 font-medium">Save 20%</span>
      </span>
    </div>
  );
}