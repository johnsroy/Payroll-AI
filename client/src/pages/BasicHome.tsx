import React, { useState } from 'react';
import { ArrowRight, Check, BarChart, Clock, Shield } from 'lucide-react';

export default function BasicHome() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">PayrollPro AI</span> for Modern Businesses
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Simplify your payroll process with our AI-powered platform. Save time, reduce errors, and stay compliant.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button 
                className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium text-lg transition-all duration-300 transform ${isHovered ? 'scale-105' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Get Started
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
              <button className="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-8 py-3 rounded-md font-medium text-lg transition-colors duration-300">
                Watch Demo
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center">
                <Check className="text-green-500 h-5 w-5 mr-2" />
                <span className="text-gray-700">No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="text-green-500 h-5 w-5 mr-2" />
                <span className="text-gray-700">14-day free trial</span>
              </div>
              <div className="flex items-center">
                <Check className="text-green-500 h-5 w-5 mr-2" />
                <span className="text-gray-700">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage payroll efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Calculations</h3>
              <p className="text-gray-600">
                Automatically calculate taxes, deductions, and benefits for accurate payroll processing.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Time Tracking</h3>
              <p className="text-gray-600">
                Integrated time tracking ensures employees get paid accurately for their work hours.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance</h3>
              <p className="text-gray-600">
                Stay compliant with automatic tax filings and updates to regulatory changes.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-blue-600 py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your payroll process?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of businesses that trust PayrollPro AI to handle their payroll needs.
          </p>
          <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md font-medium text-lg transition-colors duration-300">
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}