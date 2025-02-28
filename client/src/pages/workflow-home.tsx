import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { 
  PlayIcon, 
  ArrowRightIcon,
  DatabaseIcon,
  BrainIcon,
  ClipboardCheckIcon,
  ZapIcon
} from 'lucide-react';

import { BackgroundParticles } from '../components/animations/BackgroundParticles';
import { AnimatedFeatureCard } from '../components/animations/AnimatedFeatureCard';
import { Step } from '../components/workflow/StepProgress';

export default function WorkflowHomePage() {
  const [location, setLocation] = useLocation();
  
  const startWorkflow = () => {
    // Start at the beginning of the workflow
    localStorage.setItem('payrollWorkflowStep', 'upload');
    localStorage.setItem('payrollWorkflowCompletedSteps', JSON.stringify([]));
    setLocation('/workflow/data-connection');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative py-16 bg-blue-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-4xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              PayrollPro AI Workflow
            </motion.h1>
            <motion.p 
              className="mt-4 text-blue-100 text-xl leading-relaxed"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Optimize your payroll operations with our powerful multi-agent AI system. 
              Connect your data, analyze patterns, receive recommendations, and implement 
              solutions through automation.
            </motion.p>
            
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button 
                onClick={startWorkflow}
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Start Payroll Workflow
              </button>
              
              <Link href="/agent-playground">
                <a className="inline-flex items-center ml-4 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold text-lg hover:bg-blue-400 shadow-lg hover:shadow-xl transition-all">
                  Try AI Playground
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </a>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Workflow Steps */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our 4-step workflow uses multiple specialized AI agents to optimize your payroll process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <WorkflowStepCard 
            step="upload"
            title="Connect Data" 
            description="Connect your data sources and upload relevant payroll files"
            icon={<DatabaseIcon className="h-8 w-8" />}
            color="blue"
            delay={0.1}
          />
          
          <WorkflowStepCard 
            step="analyze"
            title="AI Analysis" 
            description="Our multi-agent AI system analyzes your data for optimization opportunities"
            icon={<BrainIcon className="h-8 w-8" />}
            color="purple"
            delay={0.2}
          />
          
          <WorkflowStepCard 
            step="review"
            title="Review Recommendations" 
            description="Review and approve AI-generated recommendations"
            icon={<ClipboardCheckIcon className="h-8 w-8" />}
            color="amber"
            delay={0.3}
          />
          
          <WorkflowStepCard 
            step="implement"
            title="Implementation" 
            description="Implement approved changes through automated integrations"
            icon={<ZapIcon className="h-8 w-8" />}
            color="green"
            delay={0.4}
          />
        </div>
      </div>
      
      {/* Agent Powers */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Powered By Multiple AI Agents</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Each specialized agent handles different aspects of payroll optimization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedFeatureCard
              icon={<div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6H4M20 12H4M20 18H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>}
              title="Tax Calculation Agent"
              description="Analyzes tax implications and provides optimization strategies for tax withholding and compliance"
              index={0}
            />
            
            <AnimatedFeatureCard
              icon={<div className="p-3 bg-purple-100 rounded-full">
                <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V22M17 5H9.5M17 19H9.5M4.22 8.27C4.08 8.68 4 9.12 4 9.58C4 11.91 7.13 13.78 11 13.78C14.87 13.78 18 11.91 18 9.58C18 9.12 17.92 8.68 17.78 8.27M20 16C20 17.1 16.42 18 12 18C7.58 18 4 17.1 4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>}
              title="Expense Categorization Agent"
              description="Automatically categorizes expenses and identifies opportunities for cost reduction"
              index={1}
            />
            
            <AnimatedFeatureCard
              icon={<div className="p-3 bg-amber-100 rounded-full">
                <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>}
              title="Compliance Agent"
              description="Monitors payroll for regulatory compliance issues and suggests remediation actions"
              index={2}
            />
            
            <AnimatedFeatureCard
              icon={<div className="p-3 bg-green-100 rounded-full">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 12L10 15L17 8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>}
              title="Data Analysis Agent"
              description="Performs deep analysis of payroll data to identify patterns, anomalies, and trends"
              index={3}
            />
            
            <AnimatedFeatureCard
              icon={<div className="p-3 bg-red-100 rounded-full">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>}
              title="Research Agent"
              description="Retrieves up-to-date information on payroll regulations and industry best practices"
              index={4}
            />
            
            <AnimatedFeatureCard
              icon={<div className="p-3 bg-indigo-100 rounded-full">
                <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.99999 13.5L9.99999 16.5M13.5 7.5L13.5 16.5M6.5 10.5L6.5 16.5M17 4.5L17 16.5M21 21V3.00002C21 2.99442 21 2.98882 20.9999 2.98322C20.9862 2.42167 20.5284 1.96402 19.9669 1.95038C19.9613 1.95013 19.9557 1.95 19.95 1.95H3.00001C2.99441 1.95 2.9888 1.95012 2.9832 1.95037C2.42165 1.96401 1.964 2.42167 1.95037 2.98322C1.95012 2.98882 1.95 2.99442 1.95001 3.00002V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>}
              title="Reasoning Agent"
              description="Coordinates between agents and makes holistic recommendations based on combined insights"
              index={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkflowStepCardProps {
  step: Step;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'amber' | 'green';
  delay: number;
}

function WorkflowStepCard({ step, title, description, icon, color, delay }: WorkflowStepCardProps) {
  const [location, setLocation] = useLocation();
  
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    green: "bg-green-50 border-green-200 text-green-800",
  };
  
  const handleClick = () => {
    localStorage.setItem('payrollWorkflowStep', step);
    
    // Create completed steps based on the selected step
    let completedSteps: Step[] = [];
    if (step === 'analyze') completedSteps = ['upload'];
    if (step === 'review') completedSteps = ['upload', 'analyze'];
    if (step === 'implement') completedSteps = ['upload', 'analyze', 'review'];
    
    localStorage.setItem('payrollWorkflowCompletedSteps', JSON.stringify(completedSteps));
    
    // Navigate to the appropriate page
    setLocation('/workflow/data-connection');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`border-2 ${colorClasses[color]} rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all`}
      onClick={handleClick}
    >
      <div className={`inline-flex items-center justify-center p-2 rounded-full bg-${color}-100 mb-4`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className={`inline-block px-2.5 py-0.5 bg-${color}-100 text-${color}-800 rounded-full text-xs font-medium`}>
          Step {step === 'upload' ? '1' : step === 'analyze' ? '2' : step === 'review' ? '3' : '4'}
        </span>
        
        <button 
          className={`inline-flex items-center text-${color}-600 hover:text-${color}-800`}
          onClick={handleClick}
        >
          <span className="text-sm font-medium mr-1">View</span>
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}