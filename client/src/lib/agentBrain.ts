import { ReasoningAgent } from './reasoningAgent';
import { ResearchAgent } from './researchAgent';
import { DataAnalysisAgent } from './dataAnalysisAgent';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ComplianceAgent } from './complianceAgent';
import { ExpenseCategorizationAgent } from './expenseCategorizationAgent';
import { AgentOrchestrator } from './agentOrchestrator';
import { v4 as uuidv4 } from 'uuid';

/**
 * AgentBrain serves as the main entry point for the multi-agent system,
 * coordinating specialized agents through the AgentOrchestrator.
 */
export class AgentBrain {
  private orchestrator: AgentOrchestrator;
  private reasoningAgent: ReasoningAgent;
  private researchAgent: ResearchAgent;
  private dataAnalysisAgent: DataAnalysisAgent;
  private taxCalculationAgent: TaxCalculationAgent;
  private complianceAgent: ComplianceAgent;
  private expenseCategorizationAgent: ExpenseCategorizationAgent;
  
  private conversationHistory: Array<{
    id: string;
    query: string;
    response: string;
    timestamp: Date;
    metadata?: any;
  }> = [];
  
  constructor() {
    // Initialize orchestrator
    this.orchestrator = new AgentOrchestrator();
    
    // Initialize all specialized agents
    this.reasoningAgent = new ReasoningAgent({ name: 'Reasoning Agent' });
    this.researchAgent = new ResearchAgent({ name: 'Research Agent' });
    this.dataAnalysisAgent = new DataAnalysisAgent({ name: 'Data Analysis Agent' });
    this.taxCalculationAgent = new TaxCalculationAgent({ name: 'Tax Calculation Agent' });
    this.complianceAgent = new ComplianceAgent({ name: 'Compliance Agent' });
    this.expenseCategorizationAgent = new ExpenseCategorizationAgent({ name: 'Expense Categorization Agent' });
    
    // Register all agents with the orchestrator
    this.orchestrator.initialize(
      this.reasoningAgent,
      this.researchAgent,
      this.dataAnalysisAgent,
      this.taxCalculationAgent,
      this.complianceAgent,
      this.expenseCategorizationAgent
    );
  }
  
  /**
   * Process a user query through the multi-agent system
   */
  public async processQuery(query: string): Promise<{
    id: string;
    query: string;
    response: string;
    confidence: number;
    timestamp: Date;
    metadata?: any;
  }> {
    // Use the orchestrator to process the query
    const response = await this.orchestrator.processQuery(query);
    
    // Store in conversation history
    const conversation = {
      id: response.id || uuidv4(),
      query,
      response: response.response,
      confidence: response.confidence,
      timestamp: response.timestamp || new Date(),
      metadata: response.metadata
    };
    
    this.conversationHistory.push(conversation);
    
    return conversation;
  }
  
  /**
   * Reset all agents and clear conversation history
   */
  public reset(): void {
    this.orchestrator.reset();
    this.conversationHistory = [];
  }
  
  /**
   * Get the complete conversation history
   */
  public getConversationHistory(): Array<{
    id: string;
    query: string;
    response: string;
    timestamp: Date;
    metadata?: any;
  }> {
    return this.conversationHistory;
  }
  
  /**
   * Get a specific conversation by ID
   */
  public getConversationById(id: string): {
    id: string;
    query: string;
    response: string;
    timestamp: Date;
    metadata?: any;
  } | undefined {
    return this.conversationHistory.find(convo => convo.id === id);
  }
  
  /**
   * Access a specific agent directly (for advanced use cases)
   */
  public getAgent(agentType: 'reasoning' | 'research' | 'dataAnalysis' | 'tax' | 'compliance' | 'expense'): BaseAgent {
    switch (agentType) {
      case 'reasoning':
        return this.reasoningAgent;
      case 'research':
        return this.researchAgent;
      case 'dataAnalysis':
        return this.dataAnalysisAgent;
      case 'tax':
        return this.taxCalculationAgent;
      case 'compliance':
        return this.complianceAgent;
      case 'expense':
        return this.expenseCategorizationAgent;
    }
  }
}