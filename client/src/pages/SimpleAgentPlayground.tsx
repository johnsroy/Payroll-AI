import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableAgents, processAgentQuery, AgentType, AgentMetadata } from '../lib/simpleAgentAPI';
import { AnimatedAgentCard, Agent } from '../components/animations/AnimatedAgentCard';
import { BackgroundParticles } from '../components/animations/BackgroundParticles';

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
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
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
    
    if (!inputValue.trim() || isSending) return;
    
    setIsSending(true);
    
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
      setIsSending(false);
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
  
  // Get agent icon
  const getAgentIcon = (type: AgentType) => {
    const icons: Record<AgentType, React.ReactNode> = {
      tax: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      expense: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      compliance: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      data: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      research: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      reasoning: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    };
    
    return icons[type] || null;
  };
  
  // Get agent color
  const getAgentColor = (type: AgentType) => {
    const colors: Record<AgentType, string> = {
      tax: 'bg-green-500',
      expense: 'bg-purple-500',
      compliance: 'bg-blue-500',
      data: 'bg-indigo-500',
      research: 'bg-yellow-500',
      reasoning: 'bg-red-500'
    };
    
    return colors[type] || 'bg-gray-500';
  };
  
  // Convert AgentMetadata to Agent for AnimatedAgentCard
  const mapAgentToCard = (agent: AgentMetadata, index: number): Agent => {
    return {
      name: agent.name,
      role: agent.type,
      description: agent.description,
      icon: getAgentIcon(agent.type),
      color: getAgentColor(agent.type)
    };
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <motion.div 
        className="container mx-auto max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold mb-3 text-blue-700">PayrollPro AI Agent Playground</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Interact with our specialized AI agents to get answers to your payroll questions and see how our multi-agent system can help your business
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Agent Selection Sidebar */}
          <div className="bg-white rounded-xl shadow-xl p-6 overflow-hidden h-fit">
            <motion.h2 
              className="font-semibold text-lg mb-4 text-blue-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Available Agents
            </motion.h2>
            
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {agents.map((agent, index) => (
                <AnimatedAgentCard
                  key={agent.type}
                  agent={mapAgentToCard(agent, index)}
                  index={index}
                  isSelected={activeAgent === agent.type}
                  onClick={() => handleAgentChange(agent.type)}
                />
              ))}
            </motion.div>
          </div>
          
          {/* Chat Interface */}
          <div className="md:col-span-3">
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-[600px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Messages Container */}
              <div className="flex-grow p-6 overflow-y-auto relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <BackgroundParticles />
                </div>
                
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <motion.div 
                      className="h-full flex flex-col items-center justify-center text-center text-gray-500"
                      key="empty-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.3 
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </motion.div>
                      
                      <motion.h3 
                        className="text-2xl font-medium mb-3 text-blue-700"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Ask Our AI Agents
                      </motion.h3>
                      
                      <motion.p 
                        className="max-w-md mb-8 text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        Select an agent and start typing your payroll questions. Our AI will provide specialized assistance.
                      </motion.p>
                      
                      {/* Suggested Questions */}
                      <motion.div 
                        className="grid grid-cols-1 gap-3 w-full max-w-md"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delayChildren: 0.6, staggerChildren: 0.1 }}
                      >
                        {getSuggestedQuestions().map((question, index) => (
                          <motion.button
                            key={index}
                            variants={itemVariants}
                            whileHover={{ 
                              scale: 1.03, 
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            }}
                            whileTap={{ scale: 0.97 }}
                            className="text-left px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all text-blue-700"
                            onClick={() => setInputValue(question)}
                          >
                            {question}
                          </motion.button>
                        ))}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            {message.role === 'assistant' && message.agentName && (
                              <div className="flex items-center gap-2 text-xs font-medium mb-2 text-blue-600">
                                <span className={`w-4 h-4 rounded-full ${getAgentColor(message.agentType || 'reasoning')} flex items-center justify-center`}>
                                  {getAgentIcon(message.agentType || 'reasoning')}
                                </span>
                                {message.agentName}
                              </div>
                            )}
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {isLoading && (
                        <motion.div 
                          className="flex justify-start"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-[80%]">
                            <div className="flex items-center gap-2 text-xs font-medium mb-2 text-blue-600">
                              <span className={`w-4 h-4 rounded-full ${getAgentColor(activeAgent)} flex items-center justify-center`}>
                                {getAgentIcon(activeAgent)}
                              </span>
                              {agents.find(a => a.type === activeAgent)?.name || 'AI Assistant'}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </AnimatePresence>
                
                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p>{error}</p>
                  </motion.div>
                )}
              </div>
              
              {/* Input Form */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <motion.input
                    ref={inputRef}
                    className="flex-grow px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask the ${agents.find(a => a.type === activeAgent)?.name || 'AI'} a question...`}
                    disabled={isLoading}
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                  />
                  <motion.button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !inputValue.trim()}
                    whileHover={!isLoading && inputValue.trim() ? { scale: 1.05 } : {}}
                    whileTap={!isLoading && inputValue.trim() ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </motion.button>
                </form>
                
                {messages.length > 0 && (
                  <motion.div 
                    className="mt-3 text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button
                      className="text-sm text-gray-500 hover:text-blue-600"
                      onClick={() => setMessages([])}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear conversation
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SimpleAgentPlayground;