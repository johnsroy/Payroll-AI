"use client";

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Clock } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { mainNavLinks, featuresDropdown } from "@/config/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`sticky top-0 bg-white z-50 ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Clock className="w-8 h-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-primary-dark">PayrollPro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <div className="relative group">
              <button className="flex items-center text-text-dark hover:text-primary transition px-2 py-1 rounded-md">
                Features
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1" 
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
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-1">
                  {featuresDropdown.map((item, index) => (
                    <a 
                      key={index}
                      href={item.href} 
                      className="block px-4 py-2 text-sm text-text-dark hover:bg-accent"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {mainNavLinks.map((item, index) => (
              <a 
                key={index}
                href={item.href} 
                className="text-text-dark hover:text-primary transition px-2 py-1 rounded-md"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-text-dark hover:text-primary transition">
              Login
            </a>
            <a 
              href="#" 
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className="text-text-dark p-2"
              aria-label="Toggle mobile menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        mainNavLinks={mainNavLinks}
        featuresDropdown={featuresDropdown}
      />
    </header>
  );
}
