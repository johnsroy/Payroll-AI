'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Bot, Calculator, FileText, Briefcase, ChevronDown, ChevronUp, Users, Shield, ChartBar, X } from 'lucide-react';

export default function LandingPage() {
  // State for pricing toggle
  const [isAnnual, setIsAnnual] = useState(false);
  
  // State for FAQ accordion
  const [expandedFAQs, setExpandedFAQs] = useState({});
  
  // FAQ data
  const faqItems = [
    {
      question: "How accurate is the AI tax calculator?",
      answer: "Our AI tax calculator maintains a 99.7% accuracy rate across all federal and state tax calculations. The system stays updated with the latest tax rates, deductions, and regulations. In the rare case of a discrepancy, our system includes a tax accuracy guarantee."
    },
    {
      question: "Can PayrollAI handle employees in different states?",
      answer: "Yes! PayrollAI specializes in multi-state payroll processing. Our system automatically calculates the correct taxes for employees in different states, handles state-specific compliance requirements, and manages all the necessary tax filings for each state where your employees work."
    },
    {
      question: "How does the expense categorization work?",
      answer: "Our Expense Categorization Agent uses advanced AI to analyze transaction descriptions, amounts, and patterns to automatically categorize expenses. It identifies tax-deductible expenses, suggests the most appropriate categories, and learns from your corrections to improve over time. The system can integrate with most accounting software and bank feeds."
    },
    {
      question: "How long does implementation take?",
      answer: "Most businesses can be fully set up on PayrollAI within 1-2 days. Our system includes automated data import tools for common payroll platforms, making migration simple. For more complex implementations with custom integrations, our team typically completes setup within 5-7 business days."
    },
    {
      question: "Is my data secure with PayrollAI?",
      answer: "Absolutely. PayrollAI uses bank-level encryption (256-bit AES) for all data, both in transit and at rest. We maintain SOC 2 Type II compliance, regular penetration testing, and strict access controls. Our system never stores complete banking information and automatically redacts sensitive personal data in compliance with GDPR and CCPA regulations."
    },
    {
      question: "Does PayrollAI integrate with other software?",
      answer: "Yes, PayrollAI offers integrations with major accounting software (QuickBooks, Xero, Sage), HRIS platforms (BambooHR, Workday, ADP), time tracking systems (TSheets, Harvest, Toggl), and expense management tools (Expensify, Concur). We also offer an open API for custom integrations."
    }
  ];
  
  // Toggle function for FAQ accordion
  const toggleFAQ = (index) => {
    setExpandedFAQs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-primary-blue text-2xl font-bold">PayrollAI</span>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <Link href="#features" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Features
                </Link>
                <Link href="#how-it-works" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  How It Works
                </Link>
                <Link href="#pricing" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Pricing
                </Link>
                <Link href="#faq" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  FAQ
                </Link>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <Link href="/login" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Log in
              </Link>
              <Link href="/signup" className="ml-3 px-4 py-2 text-sm text-white bg-primary-blue hover:bg-primary-dark rounded-md">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 xl:mt-20">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Transform Your Payroll</span>
                  <span className="block text-primary-blue">With Intelligent AI</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  The future of payroll management is here. Our AI-powered system handles tax calculations, compliance, and expense categorization, giving you peace of mind and saving you hours every month.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-blue hover:bg-primary-dark md:py-4 md:text-lg md:px-10">
                      Get started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="#demo" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-blue bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                      See it in action
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-blue-50 hidden lg:block">
          <div className="h-full w-full flex items-center justify-center p-8">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform -rotate-1 border border-gray-200">
              <div className="flex items-center mb-4">
                <Bot className="h-8 w-8 text-primary-blue mr-2" />
                <h3 className="text-lg font-medium text-gray-900">AI Payroll Assistant</h3>
              </div>
              <div className="space-y-3">
                <div className="flex p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-primary-blue" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      How do I calculate taxes for my remote employees in different states?
                    </p>
                  </div>
                </div>
                <div className="flex p-3 bg-gray-100 rounded-lg">
                  <div className="flex-shrink-0">
                    <Bot className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      For remote employees, you'll need to withhold taxes for both their resident state and work state. Let me calculate the optimal tax strategy for your situation...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-blue font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Smart Payroll Management with Specialized AI Agents
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our system uses multiple specialized AI agents to handle all aspects of your payroll process.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Tax Calculator Agent */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-blue rounded-md shadow-lg">
                        <Calculator className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Tax Calculator</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Handles all tax calculations with precision. Calculates federal, state, and local taxes automatically based on employee location and status.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compliance Agent */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-blue rounded-md shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Compliance Advisor</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Stays up-to-date with changing regulations and alerts you to upcoming deadlines. Ensures your business remains compliant with all payroll laws.
                    </p>
                  </div>
                </div>
              </div>

              {/* Expense Agent */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-blue rounded-md shadow-lg">
                        <Briefcase className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Expense Categorizer</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Automatically categorizes business expenses and identifies tax deduction opportunities, saving you time and maximizing returns.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Analysis Agent */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-blue rounded-md shadow-lg">
                        <ChartBar className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Data Analyst</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Analyzes your payroll data to provide insights and forecasts. Helps you make informed decisions about your business finances.
                    </p>
                  </div>
                </div>
              </div>

              {/* Research Agent */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-blue rounded-md shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Research Assistant</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Gathers information from multiple sources to answer your complex payroll and tax questions with accurate, up-to-date information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Knowledge Management */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-blue rounded-md shadow-lg">
                        <Bot className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">AI Brain</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Central intelligence that coordinates all agents and learns from your business patterns to provide increasingly personalized service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-blue font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, Intelligent Payroll Management
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our AI-powered system makes payroll processing faster, more accurate, and stress-free.
            </p>
          </div>

          <div className="mt-16">
            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-0 left-1/2 w-0.5 h-full bg-gray-200 -ml-px"></div>
              
              {/* Step 1 */}
              <div className="relative md:flex items-center mb-16">
                <div className="md:w-1/2 md:pr-8 md:text-right">
                  <h3 className="text-lg font-medium text-gray-900">Connect Your Data</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Simply integrate your existing employee data, or start fresh with our easy setup wizard. Our system supports imports from all major payroll platforms.
                  </p>
                </div>
                <div className="mt-6 md:mt-0 md:absolute md:left-1/2 md:-ml-8 flex h-16 w-16 rounded-full bg-white border-4 border-primary-blue items-center justify-center">
                  <span className="text-xl font-bold text-primary-blue">1</span>
                </div>
                <div className="mt-6 md:mt-0 md:w-1/2 md:pl-8">
                  <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative md:flex items-center mb-16">
                <div className="md:w-1/2 md:pr-8 md:text-right">
                  <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 md:absolute md:left-1/2 md:-ml-8 flex h-16 w-16 rounded-full bg-white border-4 border-primary-blue items-center justify-center">
                  <span className="text-xl font-bold text-primary-blue">2</span>
                </div>
                <div className="mt-6 md:mt-0 md:w-1/2 md:pl-8">
                  <h3 className="text-lg font-medium text-gray-900">AI Analyzes & Adapts</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Our AI system analyzes your data, learns your patterns, and builds a customized payroll model for your business. It continuously improves with each payroll cycle.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative md:flex items-center mb-16">
                <div className="md:w-1/2 md:pr-8 md:text-right">
                  <h3 className="text-lg font-medium text-gray-900">Review AI Recommendations</h3>
                  <p className="mt-2 text-base text-gray-500">
                    The system prepares your payroll with tax calculations, compliance checks, and expense categorizations. You review and approve the AI recommendations.
                  </p>
                </div>
                <div className="mt-6 md:mt-0 md:absolute md:left-1/2 md:-ml-8 flex h-16 w-16 rounded-full bg-white border-4 border-primary-blue items-center justify-center">
                  <span className="text-xl font-bold text-primary-blue">3</span>
                </div>
                <div className="mt-6 md:mt-0 md:w-1/2 md:pl-8">
                  <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="relative md:flex items-center">
                <div className="md:w-1/2 md:pr-8 md:text-right">
                  <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 md:absolute md:left-1/2 md:-ml-8 flex h-16 w-16 rounded-full bg-white border-4 border-primary-blue items-center justify-center">
                  <span className="text-xl font-bold text-primary-blue">4</span>
                </div>
                <div className="mt-6 md:mt-0 md:w-1/2 md:pl-8">
                  <h3 className="text-lg font-medium text-gray-900">Automated Processing</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Once approved, the system processes payments, files necessary tax forms, and maintains compliance records. You receive detailed reports and insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-blue font-semibold tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Plans for businesses of all sizes
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Choose the plan that fits your business needs.
            </p>
          </div>

          {/* Monthly/Annual Toggle */}
          <div className="mt-12 flex justify-center">
            <div className="relative bg-white rounded-lg p-0.5 flex sm:mt-8">
              <button 
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`relative py-2 px-6 border border-transparent rounded-md text-sm font-medium ${
                  !isAnnual 
                    ? 'text-white bg-primary-blue' 
                    : 'text-gray-700 hover:text-gray-900 bg-white'
                } focus:outline-none`}
              >
                Monthly billing
              </button>
              <button 
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`ml-0.5 relative py-2 px-6 border border-transparent rounded-md text-sm font-medium ${
                  isAnnual 
                    ? 'text-white bg-primary-blue' 
                    : 'text-gray-700 hover:text-gray-900 bg-white'
                } focus:outline-none`}
              >
                Annual billing
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
            {/* Starter Plan */}
            <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Starter</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">${isAnnual ? '24' : '29'}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </p>
                {isAnnual && (
                  <p className="mt-1 text-sm text-green-500">Save $60 annually</p>
                )}
                <p className="mt-6 text-gray-500">Perfect for small businesses just getting started with payroll.</p>

                {/* Feature List */}
                <ul className="mt-6 space-y-4">
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Up to 10 employees</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Basic tax calculations</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Direct deposit</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Employee portal</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Email support</span>
                  </li>
                </ul>
              </div>

              <a
                href="#"
                className="mt-8 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 text-sm font-semibold text-gray-900 text-center hover:bg-gray-100"
              >
                Get started
              </a>
            </div>

            {/* Professional Plan */}
            <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
              <div className="absolute top-0 inset-x-0 transform translate-y-px">
                <div className="flex justify-center transform -translate-y-1/2">
                  <span className="inline-flex rounded-full bg-primary-blue px-4 py-1 text-sm font-semibold tracking-wider uppercase text-white">
                    Most popular
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Professional</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">${isAnnual ? '67' : '79'}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </p>
                {isAnnual && (
                  <p className="mt-1 text-sm text-green-500">Save $144 annually</p>
                )}
                <p className="mt-6 text-gray-500">Growing businesses with more complex payroll needs.</p>

                {/* Feature List */}
                <ul className="mt-6 space-y-4">
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Up to 50 employees</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Advanced tax calculations</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Multi-state payroll</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Expense categorization</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Compliance monitoring</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Phone & email support</span>
                  </li>
                </ul>
              </div>

              <a
                href="#"
                className="mt-8 block w-full bg-primary-blue border border-primary-blue rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-primary-dark"
              >
                Get started
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">${isAnnual ? '169' : '199'}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </p>
                {isAnnual && (
                  <p className="mt-1 text-sm text-green-500">Save $360 annually</p>
                )}
                <p className="mt-6 text-gray-500">For larger businesses with complex requirements.</p>

                {/* Feature List */}
                <ul className="mt-6 space-y-4">
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Unlimited employees</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Custom tax configurations</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">International payroll</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Advanced analytics</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Custom integrations</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">24/7 priority support</span>
                  </li>
                  <li className="flex">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-500">Dedicated account manager</span>
                  </li>
                </ul>
              </div>

              <a
                href="#"
                className="mt-8 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 text-sm font-semibold text-gray-900 text-center hover:bg-gray-100"
              >
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-blue font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by businesses everywhere
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="mt-16">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                      alt="Sarah Johnson" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">CFO, TechStart Inc.</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "We switched to PayrollAI six months ago, and it's been a game-changer. The AI tax calculator alone saved us over $12,000 in overpayments we would have missed. The compliance alerts have kept us ahead of changing regulations."
                </p>
                <div className="mt-6 flex text-yellow-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                      alt="Michael Rodriguez" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Michael Rodriguez</h4>
                    <p className="text-sm text-gray-500">Owner, Green Earth Landscaping</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "As a small business with seasonal workers across multiple states, payroll was a nightmare. The AI system handles all the varying state tax rates and filing requirements automatically. I'm saving at least 15 hours every month."
                </p>
                <div className="mt-6 flex text-yellow-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                    <img 
                      src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                      alt="Alicia Chen" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Alicia Chen</h4>
                    <p className="text-sm text-gray-500">HR Director, Quantum Retail</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The expense categorization feature is brilliant. It automatically flags potentially personal expenses and suggests the right business categories for everything else. The AI even caught a double-payment we would have missed."
                </p>
                <div className="mt-6 flex text-yellow-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-blue font-semibold tracking-wide uppercase">FAQ</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            {/* FAQ Accordion */}
            <dl className="space-y-6 divide-y divide-gray-200">
              {/* The FAQ items now have functional expand/collapse */}
              {faqItems.map((item, index) => (
                <div key={index} className="pt-6">
                  <dt className="text-lg">
                    <button 
                      onClick={() => toggleFAQ(index)}
                      className="text-left w-full flex justify-between items-start text-gray-900 focus:outline-none"
                    >
                      <span className="font-medium">{item.question}</span>
                      <span className="ml-6 h-7 flex items-center">
                        {expandedFAQs[index] ? (
                          <ChevronUp className="h-6 w-6 text-primary-blue" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-primary-blue" />
                        )}
                      </span>
                    </button>
                  </dt>
                  {expandedFAQs[index] && (
                    <dd className="mt-2 pr-12">
                      <p className="text-base text-gray-600">
                        {item.answer}
                      </p>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-blue">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your payroll?</span>
            <span className="block text-blue-100">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-blue bg-white hover:bg-blue-50">
                Get started
                <ArrowRight className="ml-3 -mr-1 h-5 w-5" />
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800">
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                About
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Blog
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Jobs
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Press
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Privacy
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Terms
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2025 PayrollAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
