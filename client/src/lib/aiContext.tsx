import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AgentType, AgentOrchestrator, OrchestratorConfig } from './agentOrchestrator';
import { AgentBrain } from './agentBrain';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agentType?: AgentType;
  agentName?: string;
  agentsConsulted?: AgentType[];
  reasoningChain?: any[];
}

interface AIContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  activeAgentType: AgentType | null;
  activeAgentName: string | null;
  reasoning: any[] | null;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  availableAgents: any[];
  setActiveAgent: (type: AgentType | null) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentType, setActiveAgentType] = useState<AgentType | null>(null);
  const [activeAgentName, setActiveAgentName] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(null);
  const [agentBrain, setAgentBrain] = useState<AgentBrain | null>(null);
  const [reasoning, setReasoning] = useState<any[] | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  // Initialize the agent orchestrator and available agents
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        // Get user ID from local storage or session (placeholder)
        const userId = localStorage.getItem('userId') || undefined;
        const companyId = localStorage.getItem('companyId') || undefined;
        
        // Configure orchestrator
        const config: OrchestratorConfig = {
          userId,
          companyId,
          conversationId
        };
        
        // Initialize orchestrator and agent brain
        const newOrchestrator = new AgentOrchestrator(config);
        const brain = new AgentBrain({
          ...config,
          enableInternetSearch: true,
          enableKnowledgeBase: true,
          retainMemory: true
        });
        
        // Get available agents
        const agents = newOrchestrator.getAvailableAgents();
        
        setOrchestrator(newOrchestrator);
        setAgentBrain(brain);
        setAvailableAgents(agents);
        
        // If conversationId not set, get it from the brain
        if (!conversationId) {
          setConversationId(brain.getConversationId());
        }
      } catch (err) {
        console.error('Error initializing agents:', err);
        setError('Failed to initialize AI agents. Please try again later.');
      }
    };
    
    initializeAgents();
  }, [conversationId]);

  // Handle sending a message and getting a response
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        content,
        role: 'user',
        timestamp: new Date()
      };
      
      // Add user message to the conversation
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Process the message
      if (agentBrain) {
        // Use the agent brain for multi-agent processing
        const brainResponse = await agentBrain.processQuery(content);
        
        // Create assistant message from the brain response
        const assistantMessage: Message = {
          id: uuidv4(),
          content: brainResponse.response,
          role: 'assistant',
          timestamp: new Date(),
          agentsConsulted: brainResponse.agentsConsulted,
          reasoningChain: brainResponse.reasoningChain
        };
        
        // Update reasoning chain
        setReasoning(brainResponse.reasoningChain);
        
        // Add assistant message to the conversation
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else if (orchestrator && activeAgentType) {
        // Use a specific agent if selected
        const response = await orchestrator.processQuery(content);
        
        // Create assistant message from the agent response
        const assistantMessage: Message = {
          id: uuidv4(),
          content: response.answer,
          role: 'assistant',
          timestamp: new Date(),
          agentType: response.agentType,
          agentName: activeAgentName
        };
        
        // Add assistant message to the conversation
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        // Fallback to general agent if none is selected
        throw new Error('No agent available for processing');
      }
    } catch (err) {
      console.error('Error processing message:', err);
      
      // Create error message
      const errorMessage: Message = {
        id: uuidv4(),
        content: `I'm sorry, but I encountered an error processing your request: ${err.message || 'Unknown error'}. Please try again or contact support if the issue persists.`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      // Add error message to the conversation
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setError(err.message || 'An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, orchestrator, agentBrain, activeAgentType, activeAgentName]);

  // Handle clearing the conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setReasoning(null);
    
    // Reset agent brain and orchestrator
    if (agentBrain) {
      agentBrain.reset();
    }
    
    if (orchestrator) {
      orchestrator.resetAllAgents();
    }
    
    // Generate new conversation ID
    const newConversationId = uuidv4();
    setConversationId(newConversationId);
  }, [agentBrain, orchestrator]);

  // Handle setting the active agent
  const setActiveAgent = useCallback((type: AgentType | null) => {
    setActiveAgentType(type);
    
    if (type && orchestrator) {
      const agentMetadata = orchestrator.getAgentMetadata(type);
      setActiveAgentName(agentMetadata?.name || null);
    } else {
      setActiveAgentName(null);
    }
  }, [orchestrator]);

  // Create context value
  const contextValue: AIContextType = {
    messages,
    isLoading,
    error,
    activeAgentType,
    activeAgentName,
    reasoning,
    sendMessage,
    clearConversation,
    availableAgents,
    setActiveAgent
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}