/**
 * Configuration options for agents
 */
export interface AgentConfig {
  name: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Base class for all specialized agents
 */
export abstract class BaseAgent {
  protected name: string;
  
  constructor(config: AgentConfig) {
    this.name = config.name;
  }
  
  /**
   * Get the agent's name
   */
  public getName(): string {
    return this.name;
  }
  
  /**
   * Reset the agent state
   */
  public abstract reset(): void;
  
  /**
   * Process a query and return a response with confidence score
   */
  public abstract processQuery(query: string): Promise<{
    response: string;
    confidence: number;
    metadata?: any;
  }>;
}