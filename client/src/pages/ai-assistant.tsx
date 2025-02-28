import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MultiAgentChat from '../components/ai/MultiAgentChat';

type AgentType = 'tax' | 'expense' | 'compliance' | 'data' | 'research' | 'reasoning';

interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  icon: React.ReactNode;
  capabilities: string[];
  color: string;
}

export default function AIAssistantPage() {
  const [, setLocation] = useLocation();
  
  // Check if user is authenticated
  React.useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      setLocation('/auth/login');
    }
  }, [setLocation]);

  // List of specialized agents
  const agents: Agent[] = [
    {
      id: 'tax',
      type: 'tax',
      name: 'Tax Agent',
      description: 'Specialized in tax regulations and calculations',
      icon: <span className="text-2xl">📊</span>,
      capabilities: [
        'Calculate payroll taxes',
        'Provide tax filing guidance',
        'Optimize tax withholding',
        'Track tax deadlines',
        'Explain tax regulations',
      ],
      color: 'border-green-200 bg-green-50',
    },
    {
      id: 'compliance',
      type: 'compliance',
      name: 'Compliance Agent',
      description: 'Ensures adherence to payroll regulations',
      icon: <span className="text-2xl">✅</span>,
      capabilities: [
        'Monitor regulatory changes',
        'Verify compliance requirements',
        'Provide compliance checklists',
        'Track reporting deadlines',
        'Generate compliance reports',
      ],
      color: 'border-purple-200 bg-purple-50',
    },
    {
      id: 'expense',
      type: 'expense',
      name: 'Expense Agent',
      description: 'Handles expense categorization and analysis',
      icon: <span className="text-2xl">💰</span>,
      capabilities: [
        'Categorize expenses',
        'Analyze spending patterns',
        'Identify cost-saving opportunities',
        'Track budget vs. actual',
        'Generate expense reports',
      ],
      color: 'border-blue-200 bg-blue-50',
    },
    {
      id: 'data',
      type: 'data',
      name: 'Data Analysis Agent',
      description: 'Analyzes payroll data for insights',
      icon: <span className="text-2xl">📈</span>,
      capabilities: [
        'Generate payroll reports',
        'Detect data anomalies',
        'Forecast payroll expenses',
        'Analyze workforce metrics',
        'Create visualization suggestions',
      ],
      color: 'border-yellow-200 bg-yellow-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
              <p className="text-gray-600">Multi-agent payroll assistant powered by AI</p>
            </div>
            <button 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => setLocation('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with agent info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Specialized AI Agents</h2>
              <p className="text-gray-600 mb-4">
                Our multi-agent system combines specialized AI agents to provide comprehensive payroll assistance.
              </p>
              
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div 
                    key={agent.id}
                    className={`border rounded-md p-4 ${agent.color}`}
                  >
                    <div className="flex items-center mb-2">
                      {agent.icon}
                      <div className="ml-3">
                        <h3 className="font-medium">{agent.name}</h3>
                        <p className="text-xs text-gray-500">{agent.description}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-700 mb-1">Capabilities:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {agent.capabilities.map((capability, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-2">How It Works</h2>
              <p className="text-sm text-gray-600 mb-4">
                When you ask a question, our system:
              </p>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-2">1</span>
                  <span>Analyzes your query and identifies relevant agents</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-2">2</span>
                  <span>Routes your question to specialized agents</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-2">3</span>
                  <span>Collects and integrates responses from each agent</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium mr-2">4</span>
                  <span>Provides a comprehensive answer with expertise from multiple domains</span>
                </li>
              </ol>
            </div>
          </div>
          
          {/* Chat interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[700px]">
              <MultiAgentChat />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}