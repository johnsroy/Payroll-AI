import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-blue-600 font-bold text-xl">PayrollPro AI</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features">
              <div className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">
                Features
              </div>
            </Link>
            <Link href="/pricing">
              <div className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">
                Pricing
              </div>
            </Link>
            <Link href="/data-connection">
              <div className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">
                Data Connection
              </div>
            </Link>
            <Link href="/ai-assistant">
              <div className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">
                AI Assistant
              </div>
            </Link>
            <div className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium focus:outline-none"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Resources
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <Link href="/blog">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      Blog
                    </div>
                  </Link>
                  <Link href="/support">
                    <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      Support
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <Link href="/contact">
              <div className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">
                Contact
              </div>
            </Link>
            <Link href="/login">
              <div className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">
                Log in
              </div>
            </Link>
            <Link href="/signup">
              <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                Sign up
              </div>
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/features">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                Features
              </div>
            </Link>
            <Link href="/pricing">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                Pricing
              </div>
            </Link>
            <Link href="/data-connection">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                Data Connection
              </div>
            </Link>
            <Link href="/ai-assistant">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                AI Assistant
              </div>
            </Link>
            <Link href="/blog">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                Blog
              </div>
            </Link>
            <Link href="/support">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                Support
              </div>
            </Link>
            <Link href="/contact">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                Contact
              </div>
            </Link>
            <Link href="/login">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                Log in
              </div>
            </Link>
            <Link href="/signup">
              <div className="block w-full px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                Sign up
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}