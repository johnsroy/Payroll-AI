'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Upload, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AgentType } from '@/lib/agents/agentOrchestrator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType?: AgentType;
  agentName?: string;
  timestamp: Date;
}

interface ConversationProps {
  companyId?: string;
  initialMessages?: Message[];
  onUpdateConversation?: (messages: Message[]) => void;
}

export default function Conversation({
  companyId,
  initialMessages = [],
  onUpdateConversation,
}: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<{
    type: AgentType;
    name: string;
    description: string;
  }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available agents on component mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch('/api/agent');
        const data = await response.json();
        
        if (data.agents) {
          setAvailableAgents(data.agents);
        }
      } catch (error) {
        console.error('Error fetching available agents:', error);
      }
    }

    fetchAgents();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to state
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send request to agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: input,
          conversationId,
          companyId,
          agentType: selectedAgent
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add assistant message to state
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          agentType: data.agentType,
          agentName: data.agentName,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update conversation ID if it's a new conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
        
        // Notify parent component if provided
        if (onUpdateConversation) {
          onUpdateConversation([...messages, userMessage, assistantMessage]);
        }
      } else {
        // Handle error
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${data.error || 'Something went wrong'}`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to state
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'There was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset conversation state
    setMessages([]);
    setConversationId(null);
    setSelectedAgent(null);
    setInput('');
    
    // Notify parent component if provided
    if (onUpdateConversation) {
      onUpdateConversation([]);
    }
  };

  const handleSelectAgent = (agentType: AgentType) => {
    setSelectedAgent(prevAgent => prevAgent === agentType ? null : agentType);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">AI Payroll Assistant</h2>
        
        {/* Agent Selection */}
        <div className="mt-2 flex flex-wrap gap-2">
          {availableAgents.map((agent) => (
            <button
              key={agent.type}
              onClick={() => handleSelectAgent(agent.type)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                selectedAgent === agent.type
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={agent.description}
            >
              <Bot className="h-4 w-4 mr-2" />
              {agent.name}
            </button>
          ))}
          
          {selectedAgent && (
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">How can I help you today?</h3>
            <p className="text-gray-500 max-w-md">
              Ask me about payroll calculations, tax information, expense categorization, or compliance requirements.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 mr-2" />
                  ) : (
                    <Bot className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-sm font-medium">
                    {message.role === 'user' ? 'You' : message.agentName || 'Assistant'}
                  </span>
                  {message.agentType && (
                    <span className="ml-2 text-xs opacity-75">
                      {message.agentType}
                    </span>
                  )}
                </div>
                <div className={`prose ${message.role === 'user' ? 'prose-invert' : ''} max-w-none`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className="text-xs opacity-75 text-right mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 rounded-md"
            title="Reset conversation"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          />
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 rounded-md"
            title="Upload file"
          >
            <Upload className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 bg-primary-blue text-white p-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
