import React from 'react';
import { Link } from 'wouter';

const SimpleLandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Intelligent Payroll Management Powered by AI
              </h1>
              <p className="text-xl mb-8">
                Streamline your payroll operations with our advanced multi-agent AI system. Save time, reduce errors, and gain valuable insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/agents">
                  <span className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-center cursor-pointer inline-block">
                    Try AI Playground
                  </span>
                </Link>
                <a href="#features" className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium text-center">
                  Explore Features
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our AI-Powered Solutions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                PayrollPro AI offers a suite of specialized AI agents designed to handle every aspect of payroll management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border rounded-lg p-6">
                <div className="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Tax Calculator Agent</h3>
                <p className="text-gray-600">
                  Handles all tax calculations with precision and accuracy, staying up-to-date with the latest tax regulations.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <div className="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Compliance Advisor Agent</h3>
                <p className="text-gray-600">
                  Stays up-to-date with changing regulations and alerts you to deadlines and compliance requirements.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <div className="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Expense Categorizer Agent</h3>
                <p className="text-gray-600">
                  Automatically categorizes expenses and identifies tax deduction opportunities to maximize savings.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link href="/agents">
                <span className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  Try Our AI Agents Now
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SimpleLandingPage;