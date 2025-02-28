import React from 'react';
import { Link } from 'wouter';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          PayrollPro AI
        </Link>
        <nav className="hidden md:flex space-x-4">
          <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
        </nav>
        <div>
          <Link href="/agents">
            <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
              AI Playground
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;