import React from 'react';

function SimpleApp() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">PayrollPro AI</h1>
      <p className="text-lg mb-8">Advanced AI-powered payroll processing system</p>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Tax calculation with multi-state support</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Regulatory compliance monitoring</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Intelligent expense categorization</span>
          </li>
        </ul>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold mb-4">Get Started Today</h2>
        <p className="mb-4">Experience the power of AI in streamlining your payroll processes.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Start Free Trial
        </button>
      </div>
    </div>
  );
}

export default SimpleApp;