import React, { useState, useEffect, useRef } from 'react';
import { getAvailableAgents, processAgentQuery, AgentType, AgentMetadata } from '../lib/simpleAgentAPI';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: AgentType;
  agentName?: string;
  timestamp: Date;
};

const SimpleAgentPlayground: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentMetadata[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentType>('reasoning');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const availableAgents = await getAvailableAgents();
        setAgents(availableAgents);
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError('Failed to load available agents.');
      }
    };
    
    fetchAgents();
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Process query with selected agent
      const response = await processAgentQuery(userMessage.content, activeAgent);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: response.id || `assistant-${Date.now()}`,
        content: response.response,
        role: 'assistant',
        agentType: response.agentType,
        agentName: response.agentName,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error processing query:', err);
      setError('Failed to process your query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle agent selection
  const handleAgentChange = (agentType: AgentType) => {
    setActiveAgent(agentType);
  };

  // Suggested questions based on active agent
  const getSuggestedQuestions = (): string[] => {
    const suggestions: Record<AgentType, string[]> = {
      tax: [
        'Calculate payroll taxes for $75,000 annual salary in California',
        'What are the 2024 federal tax brackets?',
        'Explain the difference between W-2 and 1099 tax forms'
      ],
      expense: [
        'Is a business lunch tax deductible?',
        'Categorize this expense: $500 for new office chairs',
        'What expenses can I write off as a small business owner?'
      ],
      compliance: [
        'What are the payroll compliance requirements in New York?',
        'When is the deadline for quarterly tax filings?',
        'Explain FLSA overtime regulations'
      ],
      data: [
        'Analyze payroll trends for a 50-person company',
        'Compare payroll costs between departments',
        'What insights can you provide from employee compensation data?'
      ],
      research: [
        'Research recent changes to payroll tax laws',
        'Find information about employee classification regulations',
        'What are the latest payroll management best practices?'
      ],
      reasoning: [
        'Should our company switch from bi-weekly to monthly payroll?',
        'Analyze the pros and cons of outsourcing payroll services',
        'How can we optimize our payroll process for a remote team?'
      ]
    };
    
    return suggestions[activeAgent] || [];
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">PayrollPro AI Agent Playground</h1>
        <p className="text-gray-600">
          Interact with our specialized AI agents to get answers to your payroll questions
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Agent Selection Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="font-semibold text-lg mb-4">Available Agents</h2>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.type}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  activeAgent === agent.type
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleAgentChange(agent.type)}
              >
                <div className="font-medium">{agent.name}</div>
                <div className="text-sm text-gray-600">{agent.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="md:col-span-3 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          {/* Messages Container */}
          <div className="flex-grow p-4 overflow-y-auto" style={{ minHeight: '400px', maxHeight: '500px' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">Ask Our AI Agents</h3>
                <p className="max-w-md">
                  Select an agent and start typing your payroll questions. Our AI will provide specialized assistance.
                </p>
                
                {/* Suggested Questions */}
                <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-md">
                  {getSuggestedQuestions().map((question, index) => (
                    <button
                      key={index}
                      className="text-left px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
                      onClick={() => setInputValue(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {message.role === 'assistant' && message.agentName && (
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          {message.agentName}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center">
                    <div className="rounded-lg p-3 bg-red-100 text-red-700 text-sm">
                      {error}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input Form */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask the ${agents.find(a => a.type === activeAgent)?.name || 'AI'} a question...`}
                disabled={isLoading}
                className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
            
            {messages.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                <button
                  onClick={() => setMessages([])}
                  className="underline hover:text-gray-700"
                >
                  Clear conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAgentPlayground;