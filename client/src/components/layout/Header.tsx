import React from 'react';

export default function Header() {
  return (
    <header className="py-4 px-6 bg-primary text-primary-foreground">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold">PayrollPro AI</span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
          <a href="#benefits" className="hover:text-white/80 transition-colors">Benefits</a>
          <a href="#demo" className="hover:text-white/80 transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="bg-white/10 text-white px-4 py-2 rounded-md hover:bg-white/20 transition-colors">
            Login
          </button>
          <button className="bg-white text-primary px-4 py-2 rounded-md hover:bg-white/90 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}