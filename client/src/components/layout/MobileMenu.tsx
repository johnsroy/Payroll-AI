"use client";

import { useState } from "react";
import { Link } from "wouter";
import { resourcesDropdown, companyDropdown } from "@/config/navigation";

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
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const toggleFeatures = () => {
    setIsFeaturesOpen(!isFeaturesOpen);
  };

  const toggleResources = () => {
    setIsResourcesOpen(!isResourcesOpen);
  };

  const toggleCompany = () => {
    setIsCompanyOpen(!isCompanyOpen);
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white shadow-md">
      <div className="px-4 py-3 space-y-3">
        {/* Features Dropdown */}
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
              <Link 
                key={index}
                href={item.href} 
                className="block text-text-dark hover:text-primary py-1"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Resources Dropdown */}
        <div>
          <button 
            onClick={toggleResources}
            className="flex justify-between w-full text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
          >
            Resources
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transform transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} 
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
          <div className={`${isResourcesOpen ? 'block' : 'hidden'} pl-4 mt-1 space-y-2`}>
            {resourcesDropdown.map((item, index) => (
              <Link 
                key={index}
                href={item.href} 
                className="block text-text-dark hover:text-primary py-1"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Main Navigation Links */}
        {mainNavLinks.map((item, index) => (
          <Link 
            key={index}
            href={item.href} 
            className="block text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
          >
            {item.name}
          </Link>
        ))}
        
        {/* Company Dropdown */}
        <div>
          <button 
            onClick={toggleCompany}
            className="flex justify-between w-full text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
          >
            Company
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transform transition-transform ${isCompanyOpen ? 'rotate-180' : ''}`} 
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
          <div className={`${isCompanyOpen ? 'block' : 'hidden'} pl-4 mt-1 space-y-2`}>
            {companyDropdown.map((item, index) => (
              <Link 
                key={index}
                href={item.href} 
                className="block text-text-dark hover:text-primary py-1"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="border-t border-gray-200 pt-3 flex flex-col space-y-3">
          <Link 
            href="/login" 
            className="block text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
          >
            Login
          </Link>
          <Link 
            href="/get-started-button" 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition text-center"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
