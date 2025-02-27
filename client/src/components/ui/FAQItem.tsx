"use client";

import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleFAQ: () => void;
}

export default function FAQItem({ question, answer, isOpen, toggleFAQ }: FAQItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button 
        onClick={toggleFAQ}
        className="w-full flex justify-between items-center p-5 text-left font-medium focus:outline-none"
      >
        <span>{question}</span>
        <ChevronDown 
          className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5">
          <p className="text-text-light">{answer}</p>
        </div>
      </div>
    </div>
  );
}
