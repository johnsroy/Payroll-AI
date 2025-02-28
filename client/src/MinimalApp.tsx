import React from 'react';

const MinimalApp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 bg-blue-600 text-white">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">PayrollPro AI</h1>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">Welcome to PayrollPro AI</h1>
          <p className="text-xl text-gray-600 mb-6">
            The intelligent payroll management system powered by advanced AI agents
          </p>
          <div className="mt-6 space-y-4">
            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium">
              Get Started Free
            </button>
            <button className="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors font-medium">
              Watch Demo
            </button>
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-6 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">&copy; 2025 PayrollPro AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MinimalApp;