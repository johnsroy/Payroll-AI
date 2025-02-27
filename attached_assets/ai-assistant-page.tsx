'use client';

import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import Conversation from '@/components/ai/Conversation';
import { Bot, User, Calculator, FileText, Briefcase } from 'lucide-react';

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'examples' | 'settings'>('chat');
  
  const examples = [
    {
      category: 'Tax Calculations',
      icon: <Calculator className="h-5 w-5 text-blue-500" />,
      questions: [
        "How much federal income tax should I withhold for an employee making $75,000 annually in California?",
        "What are the current FICA tax rates for 2024?",
        "Calculate payroll taxes for a biweekly salary of $3,200 in New York",
        "How do I handle tax withholding for remote employees working in different states?"
      ]
    },
    {
      category: 'Compliance',
      icon: <FileText className="h-5 w-5 text-green-500" />,
      questions: [
        "What forms do I need to file for quarterly federal taxes?",
        "When is the deadline for W-2 submissions this year?",
        "What are the requirements for paid sick leave in California?",
        "How often do I need to update my company's labor law posters?"
      ]
    },
    {
      category: 'Expense Management',
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
      questions: [
        "Is a business meal with a potential client tax deductible?",
        "How should I categorize software subscription expenses?",
        "What's the difference between a business expense and a capital expenditure?",
        "Can I deduct home office expenses for my remote employees?"
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Conversation Area */}
          <div className="lg:flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-[600px] flex flex-col">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'chat'
                        ? 'border-primary-blue text-primary-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('chat')}
                  >
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 mr-2" />
                      AI Assistant
                    </div>
                  </button>
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'examples'
                        ? 'border-primary-blue text-primary-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('examples')}
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Examples
                    </div>
                  </button>
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'settings'
                        ? 'border-primary-blue text-primary-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </div>
                  </button>
                </nav>
              </div>

              {activeTab === 'chat' && (
                <Conversation
                  companyId="123" // Replace with actual company ID
                />
              )}

              {activeTab === 'examples' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Example questions to ask the AI Assistant
                  </h3>
                  
                  <div className="space-y-8">
                    {examples.map((category, idx) => (
                      <div key={idx}>
                        <div className="flex items-center mb-4">
                          {category.icon}
                          <h4 className="ml-2 text-md font-medium text-gray-900">
                            {category.category}
                          </h4>
                        </div>
                        <ul className="space-y-3 ml-7">
                          {category.questions.map((question, qIdx) => (
                            <li key={qIdx}>
                              <button
                                className="text-left text-primary-blue hover:text-primary-dark hover:underline"
                                onClick={() => {
                                  setActiveTab('chat');
                                  // Ideally, we would programmatically set this question in the chat input
                                  // This would require exposing a method from the Conversation component
                                }}
                              >
                                "{question}"
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Assistant Settings
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        Conversation History
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Control how long the AI remembers your conversation context.
                      </p>
                      <div className="flex items-center">
                        <input
                          id="remember-conversation"
                          type="checkbox"
                          className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                          defaultChecked={true}
                        />
                        <label htmlFor="remember-conversation" className="ml-2 block text-sm text-gray-700">
                          Remember conversation history
                        </label>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        Agent Preferences
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose your default AI assistant type.
                      </p>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center">
                          <input
                            id="agent-auto"
                            name="default-agent"
                            type="radio"
                            defaultChecked={true}
                            className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300"
                          />
                          <label htmlFor="agent-auto" className="ml-2 block text-sm text-gray-700">
                            Automatic (let the system choose the best agent)
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="agent-tax"
                            name="default-agent"
                            type="radio"
                            className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300"
                          />
                          <label htmlFor="agent-tax" className="ml-2 block text-sm text-gray-700">
                            Tax Calculator
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="agent-expense"
                            name="default-agent"
                            type="radio"
                            className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300"
                          />
                          <label htmlFor="agent-expense" className="ml-2 block text-sm text-gray-700">
                            Expense Categorizer
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="agent-compliance"
                            name="default-agent"
                            type="radio"
                            className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300"
                          />
                          <label htmlFor="agent-compliance" className="ml-2 block text-sm text-gray-700">
                            Compliance Advisor
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        Knowledge Base
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage what information the AI can access about your business.
                      </p>
                      <a 
                        href="/knowledge" 
                        className="inline-flex items-center text-primary-blue hover:text-primary-dark"
                      >
                        Manage Knowledge Base
                        <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:w-80 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                About the AI Assistant
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Our AI assistant uses specialized agents to help with different aspects of payroll management:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">•</span>
                  <span>
                    <strong>Tax Calculator</strong>: For tax calculations and filing information
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">•</span>
                  <span>
                    <strong>Expense Categorizer</strong>: For classifying and tracking expenses
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">•</span>
                  <span>
                    <strong>Compliance Advisor</strong>: For regulatory requirements and deadlines
                  </span>
                </li>
              </ul>
            </div>
            
            {/* Recent Conversations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Conversations
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-md hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Tax filing deadlines
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Yesterday, 3:24 PM
                  </p>
                </button>
                <button className="w-full text-left p-3 rounded-md hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Calculating overtime pay
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    February 24, 2025
                  </p>
                </button>
                <button className="w-full text-left p-3 rounded-md hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Employee benefits deductions
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    February 22, 2025
                  </p>
                </button>
              </div>
              <div className="mt-4 text-center">
                <button className="text-sm text-primary-blue hover:text-primary-dark">
                  View All Conversations
                </button>
              </div>
            </div>
            
            {/* Help Resources */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Help Resources
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-primary-blue hover:text-primary-dark">
                    Getting Started with AI Assistant
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-blue hover:text-primary-dark">
                    Payroll Calculation Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-blue hover:text-primary-dark">
                    Tax Filing Checklist
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-blue hover:text-primary-dark">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
