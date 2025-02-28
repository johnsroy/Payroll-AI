import React from 'react';
import { Link } from 'wouter';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
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

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our AI-Powered Solutions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              PayrollPro AI offers a suite of specialized AI agents designed to handle every aspect of payroll management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tax Calculator Agent</h3>
              <p className="text-gray-600 mb-4">
                Handles all tax calculations with precision and accuracy, staying up-to-date with the latest tax regulations.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Federal and state tax calculations</li>
                <li>• FICA and Medicare withholdings</li>
                <li>• Year-end tax preparation</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Advisor Agent</h3>
              <p className="text-gray-600 mb-4">
                Stays up-to-date with changing regulations and alerts you to deadlines and compliance requirements.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Regulatory compliance monitoring</li>
                <li>• Deadline tracking and reminders</li>
                <li>• Compliance risk assessment</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Categorizer Agent</h3>
              <p className="text-gray-600 mb-4">
                Automatically categorizes expenses and identifies tax deduction opportunities to maximize savings.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Smart expense classification</li>
                <li>• Tax deduction identification</li>
                <li>• Custom categorization rules</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/agents">
              <span className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                Try Our AI Agents Now
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our multi-agent AI system works together to provide comprehensive payroll solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Data</h3>
              <p className="text-gray-600">
                Securely upload your payroll and financial data to our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our specialized AI agents analyze your data for insights and opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Review Recommendations</h3>
              <p className="text-gray-600">
                Review AI-generated insights, calculations, and compliance recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2">Implement Solutions</h3>
              <p className="text-gray-600">
                Apply the AI recommendations to optimize your payroll operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Payroll Management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using PayrollPro AI to streamline their payroll operations.
          </p>
          <Link href="/agents">
            <span className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-50 transition-colors cursor-pointer inline-block">
              Get Started Today
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;