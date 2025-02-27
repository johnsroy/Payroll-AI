'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Upload, 
  RotateCcw, 
  Search, 
  Info, 
  Cpu, 
  BarChart, 
  FileSpreadsheet,
  PieChart,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AgentType } from '@/lib/agents/agentOrchestrator';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentsConsulted?: AgentType[];
  reasoning?: any[];
  sources?: any[];
  timestamp: Date;
}

interface AdvancedConversationProps {
  companyId?: string;
  initialMessages?: Message[];
  onUpdateConversation?: (messages: Message[]) => void;
}

export default function AdvancedConversation({
  companyId,
  initialMessages = [],
  onUpdateConversation,
}: AdvancedConversationProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'chat' | 'analysis' | 'research'>('chat');
  const [options, setOptions] = useState({
    model: 'gpt-4o',
    enableInternetSearch: true,
    enableKnowledgeBase: true,
    retainMemory: true
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && !selectedFile && isLoading) return;
    
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
      let response;
      
      if (mode === 'analysis' && selectedFile) {
        // Data analysis mode with file
        response = await processDataAnalysis(input, selectedFile);
        setSelectedFile(null);
      } else if (mode === 'research') {
        // Research mode
        response = await processResearch(input);
      } else {
        // Standard chat mode
        response = await processQuery(input);
      }
      
      if (response) {
        // Update conversation ID if it's a new conversation
        if (response.conversationId && !conversationId) {
          setConversationId(response.conversationId);
        }
        
        // Notify parent component if provided
        if (onUpdateConversation) {
          onUpdateConversation([...messages, userMessage, response]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to state
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'There was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process a standard query through the agent brain
  const processQuery = async (query: string) => {
    try {
      const response = await fetch('/api/agent-brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          conversationId,
          companyId,
          options,
          action: 'process_query'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add assistant message to state
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          agentsConsulted: data.agentsConsulted,
          reasoning: data.reasoning,
          sources: data.sources,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      } else {
        throw new Error(data.error || 'Failed to process query');
      }
    } catch (error) {
      console.error('Error in processQuery:', error);
      throw error;
    }
  };

  // Process a research request
  const processResearch = async (topic: string) => {
    try {
      const response = await fetch('/api/agent-brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: topic,
          conversationId,
          companyId,
          options: {
            ...options,
            includeContent: true
          },
          action: 'research_topic'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Format the research results as a markdown message
        let markdown = `## Research on: ${data.topic}\n\n`;
        markdown += `${data.summary}\n\n`;
        
        if (data.key_points && data.key_points.length > 0) {
          markdown += `### Key Points\n\n`;
          data.key_points.forEach((point: string) => {
            markdown += `- ${point}\n`;
          });
          markdown += '\n';
        }
        
        // Add assistant message to state
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: markdown,
          sources: data.sources,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      } else {
        throw new Error(data.error || 'Failed to conduct research');
      }
    } catch (error) {
      console.error('Error in processResearch:', error);
      throw error;
    }
  };

  // Process data analysis with file
  const processDataAnalysis = async (query: string, file: File) => {
    try {
      // First, read the file content
      const fileContent = await readFileContent(file);
      
      // Process the data
      const response = await fetch('/api/agent-brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query || 'Analyze this data and provide insights',
          data: fileContent,
          conversationId,
          companyId,
          options,
          action: 'analyze_data'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Format the analysis results as a markdown message
        let markdown = `## Data Analysis Results\n\n`;
        markdown += `### Summary\n${data.summary}\n\n`;
        
        if (data.insights && data.insights.length > 0) {
          markdown += `### Key Insights\n\n`;
          data.insights.forEach((insight: string) => {
            markdown += `- ${insight}\n`;
          });
          markdown += '\n';
        }
        
        if (data.statistics && Object.keys(data.statistics).length > 0) {
          markdown += `### Statistics\n\n`;
          markdown += '```json\n';
          markdown += JSON.stringify(data.statistics, null, 2);
          markdown += '\n```\n\n';
        }
        
        if (data.visualizationSuggestions && data.visualizationSuggestions.length > 0) {
          markdown += `### Visualization Suggestions\n\n`;
          data.visualizationSuggestions.forEach((suggestion: string) => {
            markdown += `- ${suggestion}\n`;
          });
        }
        
        // Add assistant message to state
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: markdown,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      } else {
        throw new Error(data.error || 'Failed to analyze data');
      }
    } catch (error) {
      console.error('Error in processDataAnalysis:', error);
      throw error;
    }
  };

  // Read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = (e) => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  };

  const handleReset = () => {
    // Reset conversation state
    setMessages([]);
    setConversationId(null);
    setInput('');
    setSelectedFile(null);
    
    // Notify parent component if provided
    if (onUpdateConversation) {
      onUpdateConversation([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // If in chat mode, switch to analysis mode
      if (mode === 'chat') {
        setMode('analysis');
      }
    }
  };

  const toggleReasoning = (messageId: string) => {
    setShowReasoning(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const toggleSources = (messageId: string) => {
    setShowSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const renderAgentLabel = (agents?: AgentType[]) => {
    if (!agents || agents.length === 0) return null;
    
    const agentNames: Record<AgentType, string> = {
      tax: 'Tax',
      expense: 'Expense',
      compliance: 'Compliance',
      general: 'General'
    };
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {agents.map(agent => (
          <span 
            key={agent} 
            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
          >
            <Cpu className="h-3 w-3 mr-1" />
            {agentNames[agent]}
          </span>
        ))}
      </div>
    );
  };

  const renderSources = (messageId: string, sources?: any[]) => {
    if (!sources || sources.length === 0) return null;
    
    if (!showSources[messageId]) {
      return (
        <button
          onClick={() => toggleSources(messageId)}
          className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800"
        >
          <Info className="h-3 w-3 mr-1" />
          Show {sources.length} sources
          <ChevronDown className="h-3 w-3 ml-1" />
        </button>
      );
    }
    
    return (
      <div className="mt-2">
        <button
          onClick={() => toggleSources(messageId)}
          className="mb-2 text-xs flex items-center text-blue-600 hover:text-blue-800"
        >
          <Info className="h-3 w-3 mr-1" />
          Hide sources
          <ChevronUp className="h-3 w-3 ml-1" />
        </button>
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="font-medium mb-1">Sources:</div>
          <ul className="space-y-1">
            {sources.map((source, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1">•</span>
                {source.type === 'internet_search' ? (
                  <span>
                    <a 
                      href={source.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {source.title}
                    </a>
                    <span className="text-gray-500"> ({source.source})</span>
                  </span>
                ) : (
                  <span>
                    {source.type === 'knowledge_base' ? 'Knowledge Base: ' : ''}
                    {source.content ? source.content.substring(0, 50) + '...' : source.title || 'Unnamed source'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderReasoning = (messageId: string, reasoning?: any[]) => {
    if (!reasoning || reasoning.length === 0) return null;
    
    if (!showReasoning[messageId]) {
      return (
        <button
          onClick={() => toggleReasoning(messageId)}
          className="mt-2 text-xs flex items-center text-purple-600 hover:text-purple-800"
        >
          <Zap className="h-3 w-3 mr-1" />
          Show reasoning steps
          <ChevronDown className="h-3 w-3 ml-1" />
        </button>
      );
    }
    
    return (
      <div className="mt-2">
        <button
          onClick={() => toggleReasoning(messageId)}
          className="mb-2 text-xs flex items-center text-purple-600 hover:text-purple-800"
        >
          <Zap className="h-3 w-3 mr-1" />
          Hide reasoning steps
          <ChevronUp className="h-3 w-3 ml-1" />
        </button>
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <div className="font-medium mb-1">Reasoning Process:</div>
          <ul className="space-y-2">
            {reasoning.map((step, index) => (
              <li key={index} className="border-l-2 border-purple-200 pl-2">
                <span className="font-medium text-purple-700">{step.step}</span>
                <div className="text-gray-600">
                  {typeof step.data === 'object' 
                    ? Object.entries(step.data).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500">{key}: </span>
                          {typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : String(value)
                          }
                        </div>
                      ))
                    : step.data
                  }
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">AI Brain Assistant</h2>
          
          <div className="flex items-center space-x-2">
            {/* Mode selector */}
            <div className="relative inline-block">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm rounded-md"
              >
                <option value="chat">Chat Mode</option>
                <option value="analysis">Data Analysis</option>
                <option value="research">Research</option>
              </select>
            </div>
            
            {/* Advanced options button */}
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
            >
              <Cpu className="h-4 w-4 mr-1" />
              Options
              {showOptions ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mode description */}
        <div className="mt-2 text-sm text-gray-600">
          {mode === 'chat' && (
            <p>
              <Zap className="h-4 w-4 inline mr-1 text-yellow-500" />
              Chat with the AI brain to get help with payroll, taxes, and business questions.
            </p>
          )}
          {mode === 'analysis' && (
            <p>
              <BarChart className="h-4 w-4 inline mr-1 text-green-500" />
              Upload data for analysis and get insights on your financial or payroll information.
            </p>
          )}
          {mode === 'research' && (
            <p>
              <Search className="h-4 w-4 inline mr-1 text-blue-500" />
              Research mode gathers information from multiple sources on payroll and tax topics.
            </p>
          )}
        </div>
        
        {/* Advanced options */}
        {showOptions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Advanced Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 flex items-center">
                  <input
                    type="checkbox"
                    checked={options.enableInternetSearch}
                    onChange={(e) => setOptions({...options, enableInternetSearch: e.target.checked})}
                    className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded mr-2"
                  />
                  Enable Internet Search
                </label>
                <p className="text-xs text-gray-500 ml-6">Allow the AI to search the internet for up-to-date information</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-700 flex items-center">
                  <input
                    type="checkbox"
                    checked={options.enableKnowledgeBase}
                    onChange={(e) => setOptions({...options, enableKnowledgeBase: e.target.checked})}
                    className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded mr-2"
                  />
                  Use Knowledge Base
                </label>
                <p className="text-xs text-gray-500 ml-6">Reference company knowledge base for relevant information</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-700 flex items-center">
                  <input
                    type="checkbox"
                    checked={options.retainMemory}
                    onChange={(e) => setOptions({...options, retainMemory: e.target.checked})}
                    className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded mr-2"
                  />
                  Retain Conversation Memory
                </label>
                <p className="text-xs text-gray-500 ml-6">Remember context from previous messages</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">AI Model</label>
                <select
                  value={options.model}
                  onChange={(e) => setOptions({...options, model: e.target.value})}
                  className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-blue focus:border-primary-blue rounded-md"
                >
                  <option value="gpt-4o">GPT-4o (Default)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus (Advanced)</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* File upload for data analysis */}
        {mode === 'analysis' && (
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Data File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv,.json,.xlsx,.xls,.txt"
              />
              {selectedFile && (
                <div className="text-sm flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-1 text-green-500" />
                  {selectedFile.name}
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: CSV, JSON, Excel, Text (up to 5MB)
            </p>
          </div>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Bot className="h-12 w-12 text-primary-blue" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">How can I help you today?</h3>
            <p className="text-gray-500 max-w-md mb-8">
              {mode === 'chat' && "Ask me about payroll calculations, tax information, expense categorization, or compliance requirements."}
              {mode === 'analysis' && "Upload a file to analyze your financial or payroll data and get insights."}
              {mode === 'research' && "Enter a topic to research payroll, tax, or financial information from multiple sources."}
            </p>
            
            {/* Quick suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {mode === 'chat' && (
                <>
                  <button 
                    onClick={() => setInput("How do I calculate federal income tax withholding for an employee making $75,000 annually?")}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
                  >
                    <Calendar className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>How do I calculate federal income tax withholding for an employee making $75,000 annually?</span>
                  </button>
                  <button 
                    onClick={() => setInput("What are the requirements for filing Form 941 this quarter?")}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
                  >
                    <FileSpreadsheet className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>What are the requirements for filing Form 941 this quarter?</span>
                  </button>
                </>
              )}
              {mode === 'analysis' && (
                <>
                  <button 
                    onClick={() => setInput("Find patterns in employee compensation and highlight any disparities")}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
                  >
                    <BarChart className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Find patterns in employee compensation and highlight any disparities</span>
                  </button>
                  <button 
                    onClick={() => setInput("Forecast cash flow based on this historical data")}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
                  >
                    <PieChart className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Forecast cash flow based on this historical data</span>
                  </button>
                </>
              )}
              {mode === 'research' && (
                <>
                  <button 
                    onClick={() => setInput("Research recent changes to 401(k) contribution limits and regulations")}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
                  >
                    <Search className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Research recent changes to 401(k) contribution limits and regulations</span>
                  </button>
                  <button 
                    onClick={() => setInput("Compare tax filing requirements for S-Corps vs LLCs")}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
                  >
                    <Search className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                    <span>Compare tax filing requirements for S-Corps vs LLCs</span>
                  </button>
                </>
              )}
            </div>
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
                    : message.role === 'system'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 mr-2" />
                  ) : message.role === 'system' ? (
                    <Info className="h-4 w-4 mr-2" />
                  ) : (
                    <Bot className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-sm font-medium">
                    {message.role === 'user' ? 'You' : 
                     message.role === 'system' ? 'System' : 'AI Assistant'}
                  </span>
                </div>
                <div className={`prose ${message.role === 'user' ? 'prose-invert' : ''} max-w-none prose-sm`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                
                {/* Agent labels */}
                {message.role === 'assistant' && renderAgentLabel(message.agentsConsulted)}
                
                {/* Sources info */}
                {message.role === 'assistant' && message.sources && renderSources(message.id, message.sources)}
                
                {/* Reasoning steps */}
                {message.role === 'assistant' && message.reasoning && renderReasoning(message.id, message.reasoning)}
                
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
            placeholder={
              mode === 'chat' ? "Type your message..." :
              mode === 'analysis' ? (selectedFile ? "Ask about this data or leave blank for general analysis" : "Upload a file first or switch modes") :
              "Enter a research topic..."
            }
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          />
          {mode === 'analysis' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 rounded-md"
              title="Upload file"
            >
              <Upload className="h-5 w-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && (!selectedFile || mode !== 'analysis'))}
            className="flex-shrink-0 bg-primary-blue text-white p-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
