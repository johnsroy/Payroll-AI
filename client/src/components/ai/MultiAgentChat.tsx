import React, { useState, useRef, useEffect } from 'react';

// Types for messages and agents
type AgentType = 'tax' | 'expense' | 'compliance' | 'data' | 'research' | 'reasoning';

interface Agent {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agentType?: AgentType;
  agentName?: string;
  agentsConsulted?: AgentType[];
}

// Sample agent definitions
const agents: Agent[] = [
  {
    type: 'tax',
    name: 'Tax Agent',
    description: 'Specialized in tax regulations and calculations',
    icon: '📊',
    color: 'bg-green-100 text-green-800',
  },
  {
    type: 'expense',
    name: 'Expense Agent',
    description: 'Handles expense categorization and analysis',
    icon: '💰',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    type: 'compliance',
    name: 'Compliance Agent',
    description: 'Ensures adherence to payroll regulations',
    icon: '✅',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    type: 'data',
    name: 'Data Analysis Agent',
    description: 'Analyzes payroll data for insights',
    icon: '📈',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    type: 'research',
    name: 'Research Agent',
    description: 'Finds relevant information from trusted sources',
    icon: '🔍',
    color: 'bg-red-100 text-red-800',
  },
  {
    type: 'reasoning',
    name: 'Reasoning Agent',
    description: 'Coordinates other agents and synthesizes responses',
    icon: '🧠',
    color: 'bg-indigo-100 text-indigo-800',
  },
];

// Sample suggestions
const suggestions = [
  "How do I calculate payroll taxes for remote employees?",
  "What are the compliance requirements for California-based employees?",
  "Generate a summary of our Q2 payroll expenses",
  "What tax forms do I need for a new hire?",
];

interface MultiAgentChatProps {
  initialMessages?: Message[];
  onUpdateConversation?: (messages: Message[]) => void;
  className?: string;
}

export default function MultiAgentChat({ 
  initialMessages = [],
  onUpdateConversation,
  className = ''
}: MultiAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentType, setActiveAgentType] = useState<AgentType | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Update parent component if needed
  useEffect(() => {
    if (onUpdateConversation) {
      onUpdateConversation(messages);
    }
  }, [messages, onUpdateConversation]);
  
  const handleSendMessage = async (content: string = inputValue) => {
    if (!content.trim()) return;
    
    setError(null);
    setIsLoading(true);
    setInputValue('');
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    // Add user message to conversation
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // In a real implementation, this would call an API endpoint
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Determine which agents to consult based on the query
      const relevantAgents = determineRelevantAgents(content);
      
      // Create assistant message with agent information
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateMockResponse(content, relevantAgents),
        role: 'assistant',
        timestamp: new Date(),
        agentType: 'reasoning',
        agentName: 'Reasoning Agent',
        agentsConsulted: relevantAgents,
      };
      
      // Add assistant message to conversation
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const clearConversation = () => {
    setMessages([]);
    setActiveAgentType(null);
    setError(null);
  };
  
  // Mock function to determine relevant agents based on content
  const determineRelevantAgents = (content: string): AgentType[] => {
    const lowerContent = content.toLowerCase();
    const relevantAgents: AgentType[] = [];
    
    if (lowerContent.includes('tax') || lowerContent.includes('taxes') || lowerContent.includes('withholding')) {
      relevantAgents.push('tax');
    }
    
    if (lowerContent.includes('expense') || lowerContent.includes('spending') || lowerContent.includes('cost')) {
      relevantAgents.push('expense');
    }
    
    if (lowerContent.includes('compliance') || lowerContent.includes('regulation') || lowerContent.includes('law')) {
      relevantAgents.push('compliance');
    }
    
    if (lowerContent.includes('data') || lowerContent.includes('analysis') || lowerContent.includes('report')) {
      relevantAgents.push('data');
    }
    
    if (lowerContent.includes('research') || lowerContent.includes('find') || lowerContent.includes('information')) {
      relevantAgents.push('research');
    }
    
    // Always include reasoning agent as it coordinates the response
    relevantAgents.push('reasoning');
    
    return relevantAgents;
  };
  
  // Mock function to generate a response based on content and agents
  const generateMockResponse = (content: string, relevantAgents: AgentType[]): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('tax')) {
      return "Based on my analysis of your payroll tax question, I've consulted our Tax and Compliance agents. For remote employees, you need to withhold taxes based on the state where they perform the work, not your company's location. Each state has different requirements, and some have reciprocity agreements. I recommend setting up state-specific tax profiles in your payroll system for each employee location.";
    }
    
    if (lowerContent.includes('compliance') || lowerContent.includes('california')) {
      return "I've analyzed your compliance question with our Compliance and Research agents. For California employees, you must adhere to several state-specific requirements, including: (1) Paid sick leave of at least 24 hours per year, (2) Mandatory meal breaks for shifts over 5 hours, (3) Overtime for over 8 hours/day or 40 hours/week, (4) Detailed wage statements, and (5) Final paycheck requirements upon termination. Would you like me to explain any of these in more detail?";
    }
    
    if (lowerContent.includes('expense') || lowerContent.includes('summary')) {
      return "I've analyzed your request with our Data Analysis and Expense agents. Based on your Q2 payroll data, here's a summary: Total Payroll: $856,320, Employee Count: 124, Average Salary: $82,900, Benefits Costs: $124,950, Taxes Paid: $198,460. The Data Analysis agent detected a 4.2% increase in overall payroll expenses compared to Q1, primarily driven by three new senior hires and a seasonal bonus program.";
    }
    
    if (lowerContent.includes('new hire') || lowerContent.includes('forms')) {
      return "According to our Tax and Compliance agents, for a new hire you'll need: (1) Form W-4 for federal tax withholding, (2) Form I-9 to verify employment eligibility, (3) State withholding forms (varies by state), (4) Direct deposit authorization, (5) Benefits enrollment forms, and (6) Employment agreement or offer letter. Make sure to keep these on file for at least 3 years after employment ends.";
    }
    
    return "I've analyzed your question using multiple AI agents specialized in payroll management. Based on current regulations and best practices, here's what you need to know: [Detailed response would be generated here based on your specific query]. Would you like me to elaborate on any part of this response or provide additional information?";
  };
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">AI Payroll Assistant</h2>
          <button 
            onClick={clearConversation}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            New Conversation
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-6 text-5xl">🤖</div>
            <h3 className="text-lg font-medium mb-1">How can I help with your payroll today?</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              I use specialized AI agents for tax calculations, compliance checking, expense management, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-left hover:bg-gray-50"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  {suggestion}
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
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border'
                  }`}
                >
                  {message.role === 'assistant' && message.agentsConsulted && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {message.agentsConsulted.map((agentType) => {
                        const agent = agents.find((a) => a.type === agentType);
                        return agent ? (
                          <span
                            key={agent.type}
                            className={`text-xs px-2 py-1 rounded-full ${agent.color}`}
                          >
                            {agent.icon} {agent.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="mt-1 text-xs text-right opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-lg px-4 py-2">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-t border-b border-red-200 px-4 py-2">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-end">
          <textarea
            className="flex-1 border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Ask about payroll, taxes, or compliance..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={isLoading}
          />
          <button
            className="ml-2 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
          >
            Send
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          <span>Powered by multi-agent AI system specialized in payroll management</span>
        </div>
      </div>
    </div>
  );
}