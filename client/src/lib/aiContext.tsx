import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AgentOrchestrator, AgentType, OrchestratorConfig } from './agentOrchestrator';
import { isAuthenticated, getCurrentUser } from './supabase';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agentType?: AgentType;
  agentName?: string;
}

interface AIContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  activeAgentType: AgentType | null;
  activeAgentName: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  availableAgents: any[];
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentType, setActiveAgentType] = useState<AgentType | null>(null);
  const [activeAgentName, setActiveAgentName] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  // Initialize the orchestrator with user info when auth state changes
  useEffect(() => {
    const initializeOrchestrator = async () => {
      try {
        const isAuthed = await isAuthenticated();
        if (isAuthed) {
          const user = await getCurrentUser();
          if (user) {
            // In a real app, you would get the company ID from the user's profile
            const companyId = 'default-company'; // Placeholder
            
            const config: OrchestratorConfig = {
              userId: user.id,
              companyId,
              conversationId: currentConversationId
            };
            
            const newOrchestrator = new AgentOrchestrator(config);
            setOrchestrator(newOrchestrator);
            setAvailableAgents(newOrchestrator.getAvailableAgents());
          }
        } else {
          // Initialize without user context for anonymous use
          const newOrchestrator = new AgentOrchestrator();
          setOrchestrator(newOrchestrator);
          setAvailableAgents(newOrchestrator.getAvailableAgents());
        }
      } catch (error) {
        console.error('Error initializing orchestrator:', error);
        setError('Failed to initialize AI assistant. Please try again later.');
      }
    };

    initializeOrchestrator();
  }, [currentConversationId]);

  const sendMessage = async (content: string) => {
    if (!orchestrator) {
      setError('AI assistant is not initialized yet. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to state
      const userMessageId = Date.now().toString();
      const userMessage: Message = {
        id: userMessageId,
        content,
        role: 'user',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Process the message with appropriate agent
      const result = currentConversationId
        ? await orchestrator.continueConversation(content)
        : await orchestrator.processQuery(content);

      // Update conversation ID if new
      if (!currentConversationId && orchestrator.conversationId) {
        setCurrentConversationId(orchestrator.conversationId);
      }

      // Add assistant response to state
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response,
        role: 'assistant',
        timestamp: new Date(),
        agentType: result.agentType,
        agentName: result.agentName
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Update active agent info
      setActiveAgentType(result.agentType);
      setActiveAgentName(result.agentName);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to process your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    if (orchestrator) {
      orchestrator.resetAllAgents();
      setCurrentConversationId(undefined);
    }
    
    setMessages([]);
    setActiveAgentType(null);
    setActiveAgentName(null);
  };

  return (
    <AIContext.Provider value={{
      messages,
      isLoading,
      error,
      activeAgentType,
      activeAgentName,
      sendMessage,
      clearConversation,
      availableAgents
    }}>
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