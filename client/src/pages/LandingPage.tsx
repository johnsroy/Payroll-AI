import React, { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Check, 
  Bot, 
  Calculator, 
  FileText, 
  Briefcase, 
  Shield, 
  ChartBar
} from "lucide-react";
import { SimpleMockAIChat } from "@/components/ui/SimpleMockAIChat";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState<Record<number, boolean>>({});
  const [isAIChatExpanded, setIsAIChatExpanded] = useState(false);
  
  const faqItems = [
    {
      question: "How accurate is the AI tax calculator?",
      answer: "Our AI tax calculator maintains a 99.7% accuracy rate across all federal and state tax calculations. The system stays updated with the latest tax rates, deductions, and regulations."
    },
    {
      question: "Can PayrollAI handle employees in different states?",
      answer: "Yes! PayrollAI specializes in multi-state payroll processing. Our system automatically calculates the correct taxes for employees in different states and handles state-specific compliance requirements."
    },
    {
      question: "How does the expense categorization work?",
      answer: "Our Expense Categorization Agent uses advanced AI to analyze transaction descriptions, amounts, and patterns to automatically categorize expenses. It identifies tax-deductible expenses and suggests appropriate categories."
    },
    {
      question: "How long does implementation take?",
      answer: "Most businesses can be fully set up on PayrollAI within 1-2 days. Our system includes automated data import tools for common payroll platforms, making migration simple."
    }
  ];
  
  const toggleFAQ = (index: number) => {
    setExpandedFAQs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Transform Your Payroll <span className="text-blue-600">With Intelligent AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Our AI-powered system handles tax calculations, compliance, and expense categorization, 
                giving you peace of mind and saving you hours every month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <a className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Link>
                <a 
                  href="#demo" 
                  className="px-6 py-3 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center justify-center"
                >
                  See it in action
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="bg-white rounded-lg shadow-xl p-4 max-w-md border border-gray-200">
                <div className="flex items-center mb-4">
                  <Bot className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium">AI Payroll Assistant</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      How do I calculate taxes for my remote employees in different states?
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm">
                      For remote employees, you need to withhold taxes for both their resident state and work state. Let me calculate the optimal tax strategy for your situation...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              Smart Payroll Management with Specialized AI Agents
            </p>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Our system uses multiple specialized AI agents to handle all aspects of your payroll process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tax Calculator Agent */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tax Calculator</h3>
              <p className="text-gray-600">
                Handles all tax calculations with precision. Calculates federal, state, and local taxes automatically based on employee location and status.
              </p>
            </div>
            
            {/* Compliance Agent */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compliance Advisor</h3>
              <p className="text-gray-600">
                Stays up-to-date with changing regulations and alerts you to upcoming deadlines. Ensures your business remains compliant with all payroll laws.
              </p>
            </div>
            
            {/* Expense Agent */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expense Categorizer</h3>
              <p className="text-gray-600">
                Automatically categorizes business expenses and identifies tax deduction opportunities, saving you time and maximizing returns.
              </p>
            </div>
            
            {/* Data Analysis Agent */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <ChartBar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Data Analyst</h3>
              <p className="text-gray-600">
                Analyzes your payroll data to provide insights and forecasts. Helps you make informed decisions about your business finances.
              </p>
            </div>
            
            {/* Research Agent */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Research Assistant</h3>
              <p className="text-gray-600">
                Gathers information from multiple sources to answer your complex payroll and tax questions with accurate, up-to-date information.
              </p>
            </div>
            
            {/* AI Brain */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 text-white p-3 rounded-lg inline-block mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Brain</h3>
              <p className="text-gray-600">
                Central intelligence that coordinates all agents and learns from your business patterns to provide increasingly personalized service.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Demo Section */}
      <section id="demo" className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See PayrollAI in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try our AI Payroll Assistant demo to experience how it can transform your payroll operations.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <SimpleMockAIChat 
                expanded={isAIChatExpanded}
                onToggleExpand={() => setIsAIChatExpanded(!isAIChatExpanded)}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about PayrollAI.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="border-b border-gray-200 py-4"
              >
                <button
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                  <span className={`ml-6 flex-shrink-0 ${expandedFAQs[index] ? 'transform rotate-180' : ''}`}>
                    <ArrowRight className="h-5 w-5 text-blue-600 transform rotate-90" />
                  </span>
                </button>
                {expandedFAQs[index] && (
                  <div className="mt-2 pr-12">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Payroll Management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have simplified their payroll process with PayrollAI.
          </p>
          <Link href="/signup">
            <a className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center text-lg">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}