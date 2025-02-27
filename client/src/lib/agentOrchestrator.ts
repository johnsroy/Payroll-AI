import { ReasoningAgent } from './reasoningAgent';
import { ResearchAgent } from './researchAgent';
import { DataAnalysisAgent } from './dataAnalysisAgent';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ComplianceAgent } from './complianceAgent';
import { ExpenseCategorizationAgent } from './expenseCategorizationAgent';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents the structure of an agent's contribution
 */
interface AgentContribution {
  agentName: string;
  response: string;
  confidence: number;
  metadata?: any;
}

/**
 * Represents the orchestrated response from multiple agents
 */
interface OrchestratedResponse {
  id: string;
  query: string;
  response: string;
  confidence: number;
  timestamp: Date;
  metadata?: {
    agentContributions: AgentContribution[];
    [key: string]: any;
  };
}

/**
 * AgentOrchestrator coordinates the communication between specialized agents
 * and integrates their responses for complex queries
 */
export class AgentOrchestrator {
  private reasoningAgent!: ReasoningAgent;
  private researchAgent!: ResearchAgent;
  private dataAnalysisAgent!: DataAnalysisAgent;
  private taxAgent!: TaxCalculationAgent;
  private expenseAgent!: ExpenseCategorizationAgent;
  private complianceAgent!: ComplianceAgent;
  private history: OrchestratedResponse[] = [];
  
  /**
   * Initialize the orchestrator with specialized agents
   */
  public initialize(
    reasoningAgent: ReasoningAgent,
    researchAgent: ResearchAgent,
    dataAnalysisAgent: DataAnalysisAgent,
    taxAgent: TaxCalculationAgent,
    complianceAgent: ComplianceAgent,
    expenseAgent: ExpenseCategorizationAgent
  ): void {
    this.reasoningAgent = reasoningAgent;
    this.researchAgent = researchAgent;
    this.dataAnalysisAgent = dataAnalysisAgent;
    this.taxAgent = taxAgent;
    this.complianceAgent = complianceAgent;
    this.expenseAgent = expenseAgent;
  }
  
  /**
   * Reset all agents and clear history
   */
  public reset(): void {
    this.reasoningAgent.reset();
    this.researchAgent.reset();
    this.dataAnalysisAgent.reset();
    this.taxAgent.reset();
    this.complianceAgent.reset();
    this.expenseAgent.reset();
    this.history = [];
  }
  
  /**
   * Process a query using multiple specialized agents and integrate their responses
   */
  public async processQuery(query: string): Promise<OrchestratedResponse> {
    // Step 1: Determine which agents should handle this query (using ReasoningAgent)
    const agentSelection = await this.selectRelevantAgents(query);
    
    // Step 2: Collect responses from relevant agents in parallel
    const agentResponses = await this.collectAgentResponses(query, agentSelection);
    
    // Step 3: Integrate agent responses (using ReasoningAgent)
    const integratedResponse = await this.integrateResponses(query, agentResponses);
    
    // Step 4: Store the orchestrated response in history
    this.history.push(integratedResponse);
    
    return integratedResponse;
  }
  
  /**
   * Select which agents are relevant for the given query
   */
  private async selectRelevantAgents(query: string): Promise<string[]> {
    // Use the ReasoningAgent to determine which specialized agents to use
    const reasoningResponse = await this.reasoningAgent.determineRelevantAgents(query);
    
    // For simplicity, default to using all agents if reasoning fails
    if (!reasoningResponse || !reasoningResponse.relevantAgents || reasoningResponse.relevantAgents.length === 0) {
      return [
        'research',
        'dataAnalysis',
        'tax',
        'compliance',
        'expense'
      ];
    }
    
    return reasoningResponse.relevantAgents;
  }
  
  /**
   * Collect responses from the selected agents
   */
  private async collectAgentResponses(query: string, agentTypes: string[]): Promise<AgentContribution[]> {
    const agentPromises: Promise<AgentContribution>[] = [];
    
    // Create a promise for each agent
    for (const agentType of agentTypes) {
      let agentPromise: Promise<AgentContribution>;
      
      switch (agentType) {
        case 'research':
          agentPromise = this.researchAgent.processQuery(query).then(result => ({
            agentName: 'ResearchAgent',
            response: result.response,
            confidence: result.confidence,
            metadata: result.metadata
          }));
          break;
          
        case 'dataAnalysis':
          agentPromise = this.dataAnalysisAgent.processQuery(query).then(result => ({
            agentName: 'DataAnalysisAgent',
            response: result.response,
            confidence: result.confidence,
            metadata: result.metadata
          }));
          break;
          
        case 'tax':
          agentPromise = this.taxAgent.processQuery(query).then(result => ({
            agentName: 'TaxCalculationAgent',
            response: result.response,
            confidence: result.confidence,
            metadata: result.metadata
          }));
          break;
          
        case 'compliance':
          agentPromise = this.complianceAgent.processQuery(query).then(result => ({
            agentName: 'ComplianceAgent',
            response: result.response,
            confidence: result.confidence,
            metadata: result.metadata
          }));
          break;
          
        case 'expense':
          agentPromise = this.expenseAgent.processQuery(query).then(result => ({
            agentName: 'ExpenseCategorizationAgent',
            response: result.response,
            confidence: result.confidence,
            metadata: result.metadata
          }));
          break;
          
        default:
          // Skip any unknown agent types
          continue;
      }
      
      agentPromises.push(agentPromise);
    }
    
    // Run all agent queries in parallel and collect results
    const results = await Promise.allSettled(agentPromises);
    
    // Filter out any failures and extract values
    const contributions: AgentContribution[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        contributions.push(result.value);
      } else {
        console.error('Agent error:', result.reason);
      }
    });
    
    return contributions;
  }
  
  /**
   * Integrate the responses from multiple agents into a cohesive answer
   */
  private async integrateResponses(query: string, contributions: AgentContribution[]): Promise<OrchestratedResponse> {
    // If no agent contributions, return a fallback response
    if (contributions.length === 0) {
      return {
        id: uuidv4(),
        query,
        response: "I'm sorry, but I don't have enough information to provide a comprehensive answer to your query at this time.",
        confidence: 0.1,
        timestamp: new Date(),
        metadata: {
          agentContributions: []
        }
      };
    }
    
    // If only one agent contributed, use its response directly
    if (contributions.length === 1) {
      const contribution = contributions[0];
      return {
        id: uuidv4(),
        query,
        response: contribution.response,
        confidence: contribution.confidence,
        timestamp: new Date(),
        metadata: {
          agentContributions: contributions
        }
      };
    }
    
    // Use ReasoningAgent to integrate multiple responses
    try {
      const integrationResult = await this.reasoningAgent.integrateAgentResponses(query, contributions);
      
      // Calculate confidence by weighting contributions
      const totalConfidence = contributions.reduce((sum, contrib) => sum + contrib.confidence, 0);
      const averageConfidence = totalConfidence / contributions.length;
      
      // Upweight if many high-confidence contributions, downweight otherwise
      const confidenceWeight = Math.min(1, (contributions.length * averageConfidence) / 3);
      
      return {
        id: uuidv4(),
        query,
        response: integrationResult.response,
        confidence: confidenceWeight,
        timestamp: new Date(),
        metadata: {
          agentContributions: contributions
        }
      };
    } catch (error) {
      console.error('Error integrating responses:', error);
      
      // Fallback: concatenate responses from all agents with high confidence
      const highConfidenceContributions = contributions
        .filter(contrib => contrib.confidence > 0.6)
        .sort((a, b) => b.confidence - a.confidence);
      
      if (highConfidenceContributions.length > 0) {
        const combinedResponse = highConfidenceContributions
          .map(contrib => `${contrib.agentName} (Confidence: ${(contrib.confidence * 100).toFixed(0)}%):\n${contrib.response}`)
          .join('\n\n---\n\n');
        
        return {
          id: uuidv4(),
          query,
          response: combinedResponse,
          confidence: highConfidenceContributions[0].confidence * 0.8, // Reduce confidence slightly due to fallback approach
          timestamp: new Date(),
          metadata: {
            agentContributions: contributions,
            fallbackMode: true
          }
        };
      }
      
      // Last resort: just use all contributions
      const allResponses = contributions
        .sort((a, b) => b.confidence - a.confidence)
        .map(contrib => `${contrib.agentName} (Confidence: ${(contrib.confidence * 100).toFixed(0)}%):\n${contrib.response}`)
        .join('\n\n---\n\n');
      
      return {
        id: uuidv4(),
        query,
        response: allResponses,
        confidence: 0.3, // Low confidence in this approach
        timestamp: new Date(),
        metadata: {
          agentContributions: contributions,
          fallbackMode: true
        }
      };
    }
  }
  
  /**
   * Get the history of orchestrated responses
   */
  public getHistory(): OrchestratedResponse[] {
    return this.history;
  }
  
  /**
   * Get a specific response by ID
   */
  public getResponseById(id: string): OrchestratedResponse | undefined {
    return this.history.find(response => response.id === id);
  }
}