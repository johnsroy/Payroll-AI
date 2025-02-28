/**
 * Configuration options for agents
 */
export interface AgentConfig {
  name: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  memory?: boolean;
  conversationId?: string;
  userId?: string;
  companyId?: string;
}

/**
 * Message interface for agent conversations
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

/**
 * Tool call result from AI
 */
export interface ToolCallResult {
  name: string;
  arguments: any;
  result: any;
}

/**
 * Response structure from agent processing
 */
export interface AgentResponse {
  response: string;
  confidence: number;
  metadata?: any;
  toolCalls?: ToolCallResult[];
}

/**
 * Base class for all specialized agents
 */
export abstract class BaseAgent {
  protected name: string;
  protected systemPrompt: string;
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;
  protected tools: any[];
  protected memory: boolean;
  protected messages: Message[] = [];
  protected conversationId?: string;
  protected userId?: string;
  protected companyId?: string;
  
  constructor(config: AgentConfig) {
    this.name = config.name;
    this.systemPrompt = config.systemPrompt || `You are ${config.name}, an AI assistant specialized in payroll management.`;
    this.model = config.model || 'gpt-4o'; // Default model
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
    this.tools = config.tools || [];
    this.memory = config.memory !== undefined ? config.memory : true;
    this.conversationId = config.conversationId;
    this.userId = config.userId;
    this.companyId = config.companyId;
    
    // Initialize with system message
    if (this.memory) {
      this.messages.push({ 
        role: 'system', 
        content: this.systemPrompt 
      });
    }
    
    // Load conversation history if provided
    if (this.conversationId) {
      this.loadConversation(this.conversationId);
    }
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
  public reset(): void {
    this.messages = [{ 
      role: 'system', 
      content: this.systemPrompt 
    }];
  }
  
  /**
   * Process a query and return a response with confidence score
   */
  public abstract processQuery(query: string): Promise<AgentResponse>;
  
  /**
   * Load conversation history from storage
   */
  protected async loadConversation(conversationId: string): Promise<void> {
    // This should be implemented by subclasses to load conversation from storage
    console.log(`Loading conversation ${conversationId}`);
  }
  
  /**
   * Save conversation history to storage
   */
  protected async saveConversation(): Promise<void> {
    // This should be implemented by subclasses to save conversation to storage
    console.log('Saving conversation');
  }
  
  /**
   * Add a message to the conversation history
   */
  protected addMessage(role: 'user' | 'assistant' | 'function', content: string): void {
    if (this.memory) {
      this.messages.push({ role, content });
    }
  }
  
  /**
   * Get relevant context for a query from knowledge base or other sources
   */
  protected async getRelevantContext(query: string): Promise<string | null> {
    // This can be implemented by subclasses to retrieve context
    return null;
  }
  
  /**
   * Handle tool calls from the AI
   */
  protected async handleToolCalls(toolCalls: any[]): Promise<ToolCallResult[]> {
    // This should be implemented by subclasses
    return [];
  }
  
  /**
   * Calculate confidence score for a response
   */
  protected calculateConfidence(response: string, query: string): number {
    // Basic implementation - can be overridden by subclasses
    const uncertaintyPhrases = [
      "I'm not sure", 
      "I don't know", 
      "I'm uncertain", 
      "It's unclear", 
      "I can't determine",
      "might be",
      "could be",
      "possibly",
      "perhaps"
    ];
    
    // Check for uncertainty phrases
    const hasUncertainty = uncertaintyPhrases.some(phrase => 
      response.toLowerCase().includes(phrase.toLowerCase())
    );
    
    // Default confidence
    let confidence = hasUncertainty ? 0.6 : 0.9;
    
    // Reduce confidence for very short responses
    if (response.length < 50) {
      confidence *= 0.8;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }
  
  /**
   * Format a response from the agent
   */
  protected formatResponse(response: string): string {
    // Subclasses can override this to format responses
    return response;
  }
}