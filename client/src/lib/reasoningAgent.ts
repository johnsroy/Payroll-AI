import { BaseAgent, AgentConfig } from './baseAgent';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

interface ReasoningResponse {
  id: string;
  query: string;
  response: string;
  confidence: number;
  timestamp: Date;
}

interface RelevantAgentResponse {
  relevantAgents: string[];
  reasoning: string;
}

interface IntegrationResponse {
  response: string;
  confidence: number;
}

export class ReasoningAgent extends BaseAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;
  private model: string = 'claude-3-sonnet-20240229';
  private temperature: number = 0.2;
  private reasoningHistory: ReasoningResponse[] = [];
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Initialize Anthropic client with API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for ReasoningAgent');
    }
    
    this.anthropic = new Anthropic({
      apiKey
    });
    
    // Set up system prompt for reasoning agent
    this.systemPrompt = `You are an advanced reasoning agent in a multi-agent system for payroll management.
Your primary responsibilities are:

1. Coordinate the activities of specialized agents
2. Determine which agents should handle specific queries
3. Integrate information from multiple agents into cohesive responses
4. Apply logical reasoning to resolve conflicts or inconsistencies
5. Ensure responses are accurate, comprehensive, and properly contextualized

You serve as the central "brain" of the system, with access to the following specialized agents:
- ResearchAgent: Retrieves factual information and citations
- DataAnalysisAgent: Analyzes numerical data and identifies patterns
- TaxCalculationAgent: Handles tax computations and regulatory questions
- ComplianceAgent: Provides guidance on legal and regulatory requirements
- ExpenseCategorizationAgent: Categorizes and validates business expenses

When determining which agents to use, consider:
- The nature of the query and what expertise is required
- The specific data or domain knowledge needed
- The need for multiple perspectives on complex questions
- The confidence level of each agent's response

When integrating information, ensure you:
- Reconcile any conflicting information with clear reasoning
- Prioritize high-confidence responses from relevant agents
- Provide attribution for specific contributions
- Create a seamless, logical narrative from multiple inputs`;
  }
  
  /**
   * Reset the agent state
   */
  public reset(): void {
    this.reasoningHistory = [];
  }
  
  /**
   * Process a query using the reasoning agent
   */
  public async processQuery(query: string): Promise<{ response: string; confidence: number; metadata?: any }> {
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please reason through the following query and provide a thoughtful analysis:\n\n"${query}"\n\nIdentify the key components of the query, potential approaches to answering it, and any relevant context or considerations.`
        }
      ]
    });
    
    // Extract response
    const assistantMessage = response.content[0].text;
    
    // Store reasoning in history
    const reasoningId = uuidv4();
    const reasoningResponse: ReasoningResponse = {
      id: reasoningId,
      query,
      response: assistantMessage,
      confidence: 0.8, // Reasoning typically has high confidence
      timestamp: new Date()
    };
    
    this.reasoningHistory.push(reasoningResponse);
    
    return {
      response: assistantMessage,
      confidence: 0.8,
      metadata: {
        reasoningId
      }
    };
  }
  
  /**
   * Determine which specialized agents are most relevant for a given query
   */
  public async determineRelevantAgents(query: string): Promise<RelevantAgentResponse> {
    const agentSelectionPrompt = `Please analyze the following query and determine which specialized agents should handle it:

Query: "${query}"

Available agents:
1. ResearchAgent: For factual information, citations, and knowledge retrieval
2. DataAnalysisAgent: For numerical analysis, patterns, and statistical insights
3. TaxCalculationAgent: For tax computations and tax regulation questions
4. ComplianceAgent: For legal requirements, regulations, and compliance guidance
5. ExpenseCategorizationAgent: For expense classification and validation

For each available agent, evaluate whether it should be involved in answering this query. Consider the specific expertise, data, and capabilities each agent brings.

Respond with a JSON object that includes:
1. An array of relevant agent identifiers (use 'research', 'dataAnalysis', 'tax', 'compliance', 'expense')
2. A brief explanation of your reasoning

Format example:
{
  "relevantAgents": ["research", "tax"],
  "reasoning": "This query requires factual information about tax laws and specific tax calculations."
}`;

    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1000,
      temperature: 0.1, // Lower temperature for more consistent reasoning
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: agentSelectionPrompt
        }
      ]
    });
    
    // Extract response
    const assistantMessage = response.content[0].text;
    
    // Extract JSON from the response
    try {
      // Look for JSON pattern in the response
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsedResponse = JSON.parse(jsonString) as RelevantAgentResponse;
        
        // Validate the response format
        if (!parsedResponse.relevantAgents || !Array.isArray(parsedResponse.relevantAgents)) {
          parsedResponse.relevantAgents = [];
        }
        
        return parsedResponse;
      }
    } catch (error) {
      console.error('Error parsing relevant agents JSON:', error);
    }
    
    // Fallback if parsing fails: use all agents
    return {
      relevantAgents: ['research', 'dataAnalysis', 'tax', 'compliance', 'expense'],
      reasoning: 'Failed to determine specific relevant agents, so using all available agents.'
    };
  }
  
  /**
   * Integrate responses from multiple agents into a cohesive answer
   */
  public async integrateAgentResponses(
    query: string,
    agentContributions: { agentName: string; response: string; confidence: number; metadata?: any }[]
  ): Promise<IntegrationResponse> {
    // Construct the integration prompt
    let integrationPrompt = `Please integrate the following agent responses to create a comprehensive answer to this query:

Query: "${query}"

`;

    // Add each agent's response
    agentContributions.forEach(contribution => {
      integrationPrompt += `\n=== ${contribution.agentName} (Confidence: ${(contribution.confidence * 100).toFixed(0)}%) ===\n`;
      integrationPrompt += contribution.response;
      integrationPrompt += '\n\n';
    });
    
    integrationPrompt += `\nBased on these contributions, create a cohesive, well-structured response that:
1. Synthesizes information from all relevant agents
2. Resolves any conflicts or inconsistencies with clear reasoning
3. Presents a comprehensive answer to the original query
4. Maintains proper attribution for specific facts or calculations
5. Prioritizes high-confidence information from the most relevant agents`;

    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 2000,
      temperature: 0.3,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: integrationPrompt
        }
      ]
    });
    
    // Extract response
    const assistantMessage = response.content[0].text;
    
    // Calculate confidence based on agent contributions
    const weightedConfidence = this.calculateWeightedConfidence(agentContributions);
    
    return {
      response: assistantMessage,
      confidence: weightedConfidence
    };
  }
  
  /**
   * Calculate weighted confidence based on agent contributions
   */
  private calculateWeightedConfidence(
    contributions: { agentName: string; confidence: number }[]
  ): number {
    if (contributions.length === 0) {
      return 0.5; // Default middle confidence if no contributions
    }
    
    // Calculate weighted confidence 
    const totalConfidence = contributions.reduce((sum, contrib) => sum + contrib.confidence, 0);
    const averageConfidence = totalConfidence / contributions.length;
    
    // Adjust based on number of contributing agents (more agents = potentially more reliable)
    const numberOfAgentsFactor = Math.min(1, contributions.length / 3); // Max out at 3 agents
    
    // Calculate final confidence score
    return Math.min(0.95, averageConfidence * (1 + (numberOfAgentsFactor * 0.1)));
  }
  
  /**
   * Get the reasoning history
   */
  public getReasoningHistory(): ReasoningResponse[] {
    return this.reasoningHistory;
  }
  
  /**
   * Get a specific reasoning response by ID
   */
  public getReasoningById(id: string): ReasoningResponse | undefined {
    return this.reasoningHistory.find(response => response.id === id);
  }
}