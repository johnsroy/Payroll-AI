import { BaseAgent, AgentResponse } from './baseAgent';
import { v4 as uuidv4 } from 'uuid';
import { generateMessage } from './anthropic';
import { searchWithPerplexity } from './perplexity';

/**
 * Supported agent types in the system
 */
export type AgentType = 'tax' | 'expense' | 'compliance' | 'data' | 'research' | 'reasoning';

/**
 * Metadata for each agent type
 */
export interface AgentMetadata {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  icon?: string;
}

/**
 * Configuration for the orchestrator
 */
export interface OrchestratorConfig {
  userId?: string;
  companyId?: string;
  conversationId?: string;
  enableInternetSearch?: boolean;
  cacheResults?: boolean;
}

/**
 * Represents the structure of an agent's contribution
 */
export interface AgentContribution {
  agentType: AgentType;
  agentName: string;
  response: string;
  confidence: number;
  metadata?: any;
}

/**
 * Represents the orchestrated response from multiple agents
 */
export interface OrchestratedResponse {
  id: string;
  query: string;
  response: string;
  confidence: number;
  timestamp: Date;
  agentContributions: AgentContribution[];
  primaryAgent?: AgentType;
  metadata?: any;
}

/**
 * AgentOrchestrator coordinates the communication between specialized agents
 * and integrates their responses for complex queries
 */
export class AgentOrchestrator {
  private agents: Map<AgentType, BaseAgent> = new Map();
  private agentMetadata: Map<AgentType, AgentMetadata> = new Map();
  private userId?: string;
  private companyId?: string;
  private conversationId?: string;
  private enableInternetSearch: boolean;
  private cacheResults: boolean;
  private responseCache: Map<string, OrchestratedResponse> = new Map();
  
  constructor(config: OrchestratorConfig = {}) {
    this.userId = config.userId;
    this.companyId = config.companyId;
    this.conversationId = config.conversationId;
    this.enableInternetSearch = config.enableInternetSearch || false;
    this.cacheResults = config.cacheResults || true;
    
    // Initialize agent metadata
    this.initializeAgentMetadata();
  }
  
  /**
   * Initialize metadata for all available agent types
   */
  private initializeAgentMetadata(): void {
    this.agentMetadata.set('tax', {
      type: 'tax',
      name: 'Tax Calculator',
      description: 'Specialized in tax calculations and tax laws',
      capabilities: ['Tax rate calculation', 'Tax deduction identification', 'Tax law interpretation'],
      icon: '💰'
    });
    
    this.agentMetadata.set('expense', {
      type: 'expense',
      name: 'Expense Categorizer',
      description: 'Specialized in categorizing and analyzing expenses',
      capabilities: ['Expense categorization', 'Deduction eligibility', 'Receipt analysis'],
      icon: '📊'
    });
    
    this.agentMetadata.set('compliance', {
      type: 'compliance',
      name: 'Compliance Advisor',
      description: 'Specialized in payroll compliance and regulations',
      capabilities: ['Regulatory compliance', 'Deadline tracking', 'Form requirements'],
      icon: '🛡️'
    });
    
    this.agentMetadata.set('data', {
      type: 'data',
      name: 'Data Analyst',
      description: 'Specialized in analyzing payroll and financial data',
      capabilities: ['Statistical analysis', 'Trend identification', 'Data visualization'],
      icon: '📈'
    });
    
    this.agentMetadata.set('research', {
      type: 'research',
      name: 'Research Specialist',
      description: 'Specialized in researching financial information',
      capabilities: ['Information retrieval', 'Source verification', 'Knowledge summarization'],
      icon: '🔍'
    });
    
    this.agentMetadata.set('reasoning', {
      type: 'reasoning',
      name: 'Reasoning Agent',
      description: 'Specialized in complex reasoning and decision-making',
      capabilities: ['Problem analysis', 'Decision support', 'Scenario evaluation'],
      icon: '🧠'
    });
  }
  
  /**
   * Register an agent with the orchestrator
   */
  public registerAgent(type: AgentType, agent: BaseAgent): void {
    this.agents.set(type, agent);
  }
  
  /**
   * Get an agent by type, creating it if it doesn't exist
   */
  public getAgent(type: AgentType): BaseAgent | undefined {
    return this.agents.get(type);
  }
  
  /**
   * Determine which agent type is most suited for a given query
   */
  private async routeQuery(query: string): Promise<AgentType[]> {
    try {
      // Use Claude to determine the most relevant agent(s) for this query
      const prompt = `Given the following query, determine which type(s) of specialized agent would be most appropriate to handle it. 
      
Query: "${query}"

Available agent types:
${Array.from(this.agentMetadata.values()).map(agent => 
  `- ${agent.type}: ${agent.name} - ${agent.description}`
).join('\n')}

Return only the agent type(s) as an array in valid JSON format. For example: ["tax", "compliance"] if both are relevant.`;

      const systemPrompt = `You are a routing system that determines which specialized agent should handle user queries about payroll, taxes, expenses, and compliance. Respond only with valid JSON containing an array of agent types. Be selective and only include truly relevant agents.`;
      
      const response = await generateMessage(prompt, {
        systemPrompt,
        temperature: 0.1,
        model: 'claude-3-7-sonnet-20250219'
      });
      
      try {
        const agentTypes = JSON.parse(response) as AgentType[];
        // Validate all agent types
        const validAgentTypes = agentTypes.filter(type => 
          this.agentMetadata.has(type as AgentType)
        ) as AgentType[];
        
        return validAgentTypes.length > 0 ? validAgentTypes : ['reasoning'];
      } catch (e) {
        console.error('Error parsing agent types:', e);
        return ['reasoning']; // Default to reasoning agent if parsing fails
      }
    } catch (e) {
      console.error('Error routing query:', e);
      return ['reasoning']; // Default to reasoning agent on error
    }
  }
  
  /**
   * Process a query using multiple specialized agents and integrate their responses
   */
  public async processQuery(query: string): Promise<OrchestratedResponse> {
    // Check cache first if caching is enabled
    const cacheKey = `${query}_${this.userId || ''}_${this.companyId || ''}`;
    if (this.cacheResults && this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey)!;
    }
    
    // Determine which agents to use for this query
    const relevantAgentTypes = await this.routeQuery(query);
    
    // Collect responses from relevant agents
    const contributions: AgentContribution[] = [];
    
    // Collect internet search results if enabled
    let searchResults = '';
    if (this.enableInternetSearch && 
        (query.includes('latest') || 
         query.includes('current') || 
         query.includes('recent') || 
         query.includes('update') ||
         query.includes('news') ||
         query.includes('2024') ||
         query.includes('2025'))) {
      try {
        searchResults = await searchWithPerplexity(query);
        contributions.push({
          agentType: 'research',
          agentName: 'Internet Search',
          response: searchResults,
          confidence: 0.95 // High confidence for real-time information
        });
      } catch (e) {
        console.error('Error performing internet search:', e);
        // Continue without search results
      }
    }
    
    // Collect responses from all relevant agents
    for (const agentType of relevantAgentTypes) {
      const agent = this.getAgent(agentType);
      if (agent) {
        try {
          const agentResponse = await agent.processQuery(query);
          contributions.push({
            agentType,
            agentName: agent.getName(),
            response: agentResponse.response,
            confidence: agentResponse.confidence,
            metadata: agentResponse.metadata
          });
        } catch (e) {
          console.error(`Error from ${agentType} agent:`, e);
          // Continue with other agents
        }
      }
    }
    
    // If no contributions, use reasoning agent as fallback
    if (contributions.length === 0) {
      const reasoningAgent = this.getAgent('reasoning');
      if (reasoningAgent) {
        try {
          const agentResponse = await reasoningAgent.processQuery(query);
          contributions.push({
            agentType: 'reasoning',
            agentName: reasoningAgent.getName(),
            response: agentResponse.response,
            confidence: agentResponse.confidence,
            metadata: agentResponse.metadata
          });
        } catch (e) {
          console.error('Error from fallback reasoning agent:', e);
        }
      }
    }
    
    // Integrate the responses
    const integratedResponse = await this.integrateResponses(query, contributions);
    
    // Cache the response if caching is enabled
    if (this.cacheResults) {
      this.responseCache.set(cacheKey, integratedResponse);
    }
    
    return integratedResponse;
  }
  
  /**
   * Integrate the responses from multiple agents into a cohesive answer
   */
  private async integrateResponses(
    query: string, 
    contributions: AgentContribution[]
  ): Promise<OrchestratedResponse> {
    if (contributions.length === 0) {
      // If no contributions, return a default response
      return {
        id: uuidv4(),
        query,
        response: "I'm sorry, I wasn't able to process your request. Please try rephrasing your question.",
        confidence: 0.1,
        timestamp: new Date(),
        agentContributions: []
      };
    }
    
    if (contributions.length === 1) {
      // If only one contribution, use it directly
      const contribution = contributions[0];
      return {
        id: uuidv4(),
        query,
        response: contribution.response,
        confidence: contribution.confidence,
        timestamp: new Date(),
        agentContributions: contributions,
        primaryAgent: contribution.agentType
      };
    }
    
    // If multiple contributions, use Claude to integrate them
    // Sort contributions by confidence
    contributions.sort((a, b) => b.confidence - a.confidence);
    
    const prompt = `Integrate the following information from multiple specialized agents to provide a comprehensive response to this query:
    
Query: "${query}"

${contributions.map((contribution, index) => `
=== ${contribution.agentName} (Confidence: ${contribution.confidence.toFixed(2)}) ===
${contribution.response}
`).join('\n')}

Based on all this information, provide a comprehensive, accurate, and cohesive response to the original query.`;

    try {
      const response = await generateMessage(prompt, {
        systemPrompt: 'You are a payroll AI assistant that integrates information from multiple specialized agents. Create a comprehensive, accurate response that combines the relevant insights from each agent, prioritizing information from high-confidence sources. The response should be coherent and directly address the user\'s query.',
        temperature: 0.3,
        model: 'claude-3-7-sonnet-20250219'
      });
      
      // Calculate the weighted average confidence
      const totalConfidence = contributions.reduce((sum, c) => sum + c.confidence, 0);
      const weightedConfidence = contributions.reduce(
        (sum, c) => sum + (c.confidence * c.confidence), 0
      ) / totalConfidence;
      
      return {
        id: uuidv4(),
        query,
        response,
        confidence: weightedConfidence,
        timestamp: new Date(),
        agentContributions: contributions,
        primaryAgent: contributions[0].agentType // Most confident agent
      };
    } catch (e) {
      console.error('Error integrating responses:', e);
      
      // Fallback to most confident response
      const mostConfidentContribution = contributions[0];
      return {
        id: uuidv4(),
        query,
        response: mostConfidentContribution.response,
        confidence: mostConfidentContribution.confidence,
        timestamp: new Date(),
        agentContributions: contributions,
        primaryAgent: mostConfidentContribution.agentType
      };
    }
  }
  
  /**
   * Get all available agent metadata
   */
  public getAvailableAgents(): AgentMetadata[] {
    return Array.from(this.agentMetadata.values());
  }
  
  /**
   * Reset a specific agent
   */
  public resetAgent(type: AgentType): void {
    const agent = this.getAgent(type);
    if (agent) {
      agent.reset();
    }
  }
  
  /**
   * Reset all agents
   */
  public resetAllAgents(): void {
    for (const agent of this.agents.values()) {
      agent.reset();
    }
    this.responseCache.clear();
  }
  
  /**
   * Clear the response cache
   */
  public clearCache(): void {
    this.responseCache.clear();
  }
}