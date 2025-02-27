import { AgentOrchestrator, AgentType } from './agentOrchestrator';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

interface AgentBrainConfig {
  userId?: string;
  companyId?: string;
  conversationId?: string;
  model?: string;
  enableInternetSearch?: boolean;
  enableKnowledgeBase?: boolean;
  retainMemory?: boolean;
}

/**
 * AgentBrain serves as the central coordination system for all agents,
 * handling complex requests that require multiple specialized agents,
 * memory management, and higher-order reasoning.
 */
export class AgentBrain {
  private userId?: string;
  private companyId?: string;
  private conversationId?: string;
  private orchestrator: AgentOrchestrator;
  private model: string;
  private enableInternetSearch: boolean;
  private enableKnowledgeBase: boolean;
  private retainMemory: boolean;
  private memory: any[] = [];
  private activeAgents: Map<AgentType, boolean> = new Map();
  private reasoningChain: any[] = [];
  private openai: OpenAI;

  constructor(config: AgentBrainConfig) {
    this.userId = config.userId;
    this.companyId = config.companyId;
    this.conversationId = config.conversationId || uuidv4();
    this.model = config.model || 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    
    // Initialize orchestrator
    this.orchestrator = new AgentOrchestrator({
      userId: this.userId,
      companyId: this.companyId,
      conversationId: this.conversationId
    });
    
    // Set flags
    this.enableInternetSearch = config.enableInternetSearch !== undefined ? config.enableInternetSearch : true;
    this.enableKnowledgeBase = config.enableKnowledgeBase !== undefined ? config.enableKnowledgeBase : true;
    this.retainMemory = config.retainMemory !== undefined ? config.retainMemory : true;
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  /**
   * Process a complex query by analyzing requirements and delegating to specialized agents
   */
  async processQuery(query: string): Promise<{
    response: string,
    agentsConsulted: AgentType[],
    reasoningChain: any[],
    conversationId: string
  }> {
    // Reset reasoning chain for this query
    this.reasoningChain = [];
    
    // First, analyze the query to determine which agents are needed
    this.addReasoningStep("Query Analysis", {
      query,
      timestamp: new Date().toISOString()
    });
    
    const queryAnalysis = await this.analyzeQuery(query);
    const requiredAgents = queryAnalysis.requiredAgents || ['general'];
    
    this.addReasoningStep("Agent Selection", {
      requiredAgents,
      rationale: queryAnalysis.rationale || "Default agent selection"
    });
    
    // Gather responses from each required agent
    const agentResponses: Record<AgentType, string> = {};
    const agentsConsulted: AgentType[] = [];
    
    for (const agentType of requiredAgents) {
      // Mark agent as active
      this.activeAgents.set(agentType, true);
      agentsConsulted.push(agentType);
      
      // Create agent-specific query if needed
      const agentSpecificQuery = queryAnalysis.agentQueries && queryAnalysis.agentQueries[agentType]
        ? this.createAgentSpecificQuery(query, agentType, queryAnalysis.agentQueries[agentType])
        : query;
      
      this.addReasoningStep(`${this.getAgentName(agentType)} Query`, {
        agentType,
        query: agentSpecificQuery
      });
      
      // Process query with the appropriate agent
      const agent = this.orchestrator.getAgent(agentType);
      const response = await agent.sendMessage(agentSpecificQuery);
      
      agentResponses[agentType] = response;
      
      this.addReasoningStep(`${this.getAgentName(agentType)} Response`, {
        agentType,
        response
      });
    }
    
    // Synthesize the responses into a coherent answer
    this.addReasoningStep("Response Synthesis", {
      agentResponses
    });
    
    const synthesizedResponse = await this.synthesizeResponses(query, agentResponses, requiredAgents);
    
    // Update memory
    if (this.retainMemory) {
      this.updateMemory(query, synthesizedResponse, agentsConsulted);
    }
    
    return {
      response: synthesizedResponse,
      agentsConsulted,
      reasoningChain: [...this.reasoningChain],
      conversationId: this.conversationId || ''
    };
  }

  /**
   * Analyze the query to determine required agents and processing steps
   */
  private async analyzeQuery(query: string): Promise<any> {
    const agentOptions = this.orchestrator.getAvailableAgents().map(agent => agent.type);
    const promptForOptionsFormatted = agentOptions.map(option => `- ${option}: ${this.getAgentName(option)}`).join('\n');
    
    const prompt = `I need to analyze a user query to determine which specialized payroll agents should handle it.

User Query: "${query}"

Available Agents:
${promptForOptionsFormatted}

For complex queries, we can use multiple agents in parallel.

Please provide a JSON response with the following:
1. requiredAgents: an array of agent types that should process this query
2. rationale: brief explanation of why these agents were selected
3. agentQueries: an object with specialized sub-queries for each agent (if needed)

Example JSON format:
{
  "requiredAgents": ["tax", "compliance"],
  "rationale": "The query involves both tax calculations and compliance requirements",
  "agentQueries": {
    "tax": "Calculate the tax implications of...",
    "compliance": "Check compliance requirements for..."
  }
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : { requiredAgents: ['general'] };
    } catch (error) {
      console.error('Error analyzing query:', error);
      return { requiredAgents: ['general'] };
    }
  }

  /**
   * Create a specialized query for a specific agent type
   */
  private createAgentSpecificQuery(originalQuery: string, agentType: AgentType, suggestedSubQuery: string): string {
    // If a suggested sub-query is provided, use it
    if (suggestedSubQuery) {
      // Ensure the query maintains context from the original
      return `Original question: "${originalQuery}"\n\nSpecific task for ${this.getAgentName(agentType)}: ${suggestedSubQuery}`;
    }
    
    // Otherwise return the original query
    return originalQuery;
  }

  /**
   * Synthesize responses from multiple agents into a coherent answer
   */
  private async synthesizeResponses(
    originalQuery: string,
    agentResponses: Record<AgentType, string>,
    requiredAgents: AgentType[]
  ): Promise<string> {
    // If only one agent was used, return its response directly
    if (requiredAgents.length === 1) {
      return agentResponses[requiredAgents[0]];
    }
    
    // Otherwise, synthesize the responses
    const agentResponsesText = requiredAgents
      .map(agent => `${this.getAgentName(agent)} Response:\n${agentResponses[agent]}`)
      .join('\n\n');
    
    const prompt = `I need to synthesize responses from multiple specialized payroll agents into a single coherent response.

Original User Query: "${originalQuery}"

${agentResponsesText}

Please create a comprehensive, well-structured response that:
1. Integrates insights from all agents
2. Addresses the original query fully
3. Avoids contradictions or redundancy
4. Maintains a consistent tone and style
5. Clearly identifies when different expertise areas are being addressed

Your synthesized response should be comprehensive but concise, focused on providing the most valuable information to answer the original query.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content || "Unable to synthesize a response";
    } catch (error) {
      console.error('Error synthesizing responses:', error);
      
      // Fallback: concatenate responses with headers
      return requiredAgents.map(agent => 
        `**${this.getAgentName(agent)} Perspective:**\n${agentResponses[agent]}`
      ).join('\n\n');
    }
  }

  /**
   * Get a human-readable name for an agent type
   */
  private getAgentName(agentType: AgentType): string {
    const agentMetadata = this.orchestrator.getAgentMetadata(agentType);
    return agentMetadata ? agentMetadata.name : 'Unknown Agent';
  }

  /**
   * Add a step to the reasoning chain
   */
  private addReasoningStep(step: string, data: any): void {
    this.reasoningChain.push({
      step,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update the memory with a new interaction
   */
  private updateMemory(query: string, response: string, agents: AgentType[]): void {
    const memoryEntry = {
      id: uuidv4(),
      query,
      response,
      agents,
      timestamp: new Date().toISOString()
    };
    
    this.memory.push(memoryEntry);
    
    // Limit memory size (keep last 10 interactions)
    if (this.memory.length > 10) {
      this.memory = this.memory.slice(-10);
    }
  }

  /**
   * Get the current memory
   */
  getMemory(): any[] {
    return [...this.memory];
  }

  /**
   * Get the current conversation ID
   */
  getConversationId(): string | undefined {
    return this.conversationId;
  }

  /**
   * Get the reasoning chain for the last processed query
   */
  getReasoningChain(): any[] {
    return [...this.reasoningChain];
  }

  /**
   * Get the list of active agents
   */
  getActiveAgents(): AgentType[] {
    return Array.from(this.activeAgents.entries())
      .filter(([_, active]) => active)
      .map(([agentType, _]) => agentType);
  }

  /**
   * Reset the agent brain
   */
  reset(): void {
    this.memory = [];
    this.reasoningChain = [];
    this.activeAgents.clear();
    this.orchestrator.resetAllAgents();
  }
}