import React from 'react';
import { Route, Switch } from 'wouter';
import AgentPlaygroundPage from './pages/agent-playground';

const SimpleApp: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PayrollPro AI</h1>
          <nav className="hidden md:flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-blue-600">Features</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">About</a>
          </nav>
          <div>
            <a href="/agents" className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
              AI Playground
            </a>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Switch>
          <Route path="/agents">
            <AgentPlaygroundPage />
          </Route>
          <Route path="/">
            <div className="container mx-auto p-4 mt-8">
              <h2 className="text-3xl font-bold mb-4">Welcome to PayrollPro AI</h2>
              <p className="text-gray-600 mb-6">
                Our AI-powered system revolutionizes payroll management with specialized agents for tax calculation, 
                compliance tracking, and expense categorization.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">Tax Calculator</h3>
                  <p>Handles all tax calculations with precision and accuracy.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">Compliance Advisor</h3>
                  <p>Stays up-to-date with changing regulations and alerts you to deadlines.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">Expense Categorizer</h3>
                  <p>Automatically categorizes expenses and identifies tax deduction opportunities.</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <a 
                  href="/agents" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try the AI Playground
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </main>
      
      <footer className="bg-gray-800 text-white p-6 mt-12">
        <div className="container mx-auto">
          <p>&copy; 2025 PayrollPro AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleApp;