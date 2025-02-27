import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for all agent types
 */
export interface AgentConfig {
  userId?: string;
  companyId?: string;
  conversationId?: string;
  enableInternetSearch?: boolean;
  enableKnowledgeBase?: boolean;
  retainMemory?: boolean;
}

/**
 * Base agent class that all specialized agents extend
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected agentId: string;
  protected conversationId: string;
  
  constructor(config: AgentConfig = {}) {
    this.config = {
      enableInternetSearch: true,
      enableKnowledgeBase: true,
      retainMemory: true,
      ...config
    };
    
    this.agentId = uuidv4();
    this.conversationId = config.conversationId || uuidv4();
  }
  
  /**
   * Gets the agent ID
   */
  public getAgentId(): string {
    return this.agentId;
  }
  
  /**
   * Gets the conversation ID
   */
  public getConversationId(): string {
    return this.conversationId;
  }
  
  /**
   * Sets a new conversation ID
   */
  public setConversationId(conversationId: string): void {
    this.conversationId = conversationId;
  }
  
  /**
   * Updates agent configuration
   */
  public updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
  
  /**
   * Reset the agent to its initial state
   * (To be implemented by specific agent subclasses)
   */
  public abstract reset(): void;
}