import React from "react";
import { Link } from "wouter";

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
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2">
      <nav className="flex flex-col space-y-3 py-3">
        <div className="font-medium text-blue-600 mb-1">Features</div>
        {featuresDropdown.map((item, index) => (
          <Link 
            key={index}
            href={item.href} 
            className="text-gray-700 hover:text-blue-600 transition pl-3"
          >
            {item.name}
          </Link>
        ))}
        
        <div className="border-t border-gray-200 my-2"></div>
        
        {mainNavLinks.map((item, index) => (
          <Link 
            key={index}
            href={item.href} 
            className="text-gray-700 hover:text-blue-600 transition"
          >
            {item.name}
          </Link>
        ))}
        
        <div className="border-t border-gray-200 my-2"></div>
        
        <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
          Login
        </Link>
        <Link 
          href="/get-started-button" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-center hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </nav>
    </div>
  );
}