import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div 
      className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left py-2 focus:outline-none"
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
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
            <p className="mt-2 text-gray-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AnimatedFAQItem;