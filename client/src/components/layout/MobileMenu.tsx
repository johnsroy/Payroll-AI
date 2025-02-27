"use client";

import { useState } from "react";

interface NavLink {
  name: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  mainNavLinks: NavLink[];
  featuresDropdown: NavLink[];
}

export default function MobileMenu({ isOpen, mainNavLinks, featuresDropdown }: MobileMenuProps) {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const toggleFeatures = () => {
    setIsFeaturesOpen(!isFeaturesOpen);
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white shadow-md">
      <div className="px-4 py-3 space-y-3">
        <div>
          <button 
            onClick={toggleFeatures}
            className="flex justify-between w-full text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
          >
            Features
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transform transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </button>
          <div className={`${isFeaturesOpen ? 'block' : 'hidden'} pl-4 mt-1 space-y-2`}>
            {featuresDropdown.map((item, index) => (
              <a 
                key={index}
                href={item.href} 
                className="block text-text-dark hover:text-primary py-1"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
        
        {mainNavLinks.map((item, index) => (
          <a 
            key={index}
            href={item.href} 
            className="block text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
          >
            {item.name}
          </a>
        ))}
        
        <div className="border-t border-gray-200 pt-3 flex flex-col space-y-3">
          <a 
            href="#" 
            className="block text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
          >
            Login
          </a>
          <a 
            href="#" 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition text-center"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
