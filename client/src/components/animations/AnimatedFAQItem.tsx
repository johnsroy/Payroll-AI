import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AnimatedFAQItemProps {
  question: string;
  answer: string;
  initiallyOpen?: boolean;
}

export function AnimatedFAQItem({ 
  question, 
  answer,
  initiallyOpen = false
}: AnimatedFAQItemProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 text-left focus:outline-none"
      >
        <span className="text-lg font-medium text-gray-900 dark:text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-gray-600 dark:text-gray-300">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}