import { ReasoningAgent } from './reasoningAgent';
import { ResearchAgent } from './researchAgent';
import { DataAnalysisAgent } from './dataAnalysisAgent';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ExpenseCategorizationAgent } from './expenseCategorizationAgent';
import { ComplianceAgent } from './complianceAgent';
import { v4 as uuidv4 } from 'uuid';

// Agent type identifiers
export type AgentType = 'tax' | 'expense' | 'compliance' | 'research' | 'data' | 'general';

// Agent metadata interface
export interface AgentMetadata {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  icon?: string;
}

// Agent response interface
export interface AgentResponse {
  agentType: AgentType;
  answer: string;
  confidence: number;
  metadata?: any;
}

// Orchestrator configuration
export interface OrchestratorConfig {
  userId?: string;
  companyId?: string;
  conversationId?: string;
}

/**
 * AgentOrchestrator class manages the creation, selection, and execution of agents
 */
export class AgentOrchestrator {
  private config: OrchestratorConfig;
  private conversationId: string;
  
  // Individual agent instances
  private reasoningAgent: ReasoningAgent;
  private researchAgent: ResearchAgent;
  private dataAnalysisAgent: DataAnalysisAgent;
  private taxAgent: TaxCalculationAgent;
  private expenseAgent: ExpenseCategorizationAgent;
  private complianceAgent: ComplianceAgent;
  
  // Map of agent metadata
  private agentMetadata: Map<AgentType, AgentMetadata> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    this.config = config;
    this.conversationId = config.conversationId || uuidv4();
    
    // Initialize all agent instances
    this.initializeAgents();
    
    // Register metadata for all available agents
    this.registerAgentMetadata();
  }

  /**
   * Initialize all agent instances
   */
  private initializeAgents(): void {
    const baseConfig = {
      userId: this.config.userId,
      companyId: this.config.companyId,
      conversationId: this.conversationId
    };
    
    this.reasoningAgent = new ReasoningAgent(baseConfig);
    this.researchAgent = new ResearchAgent(baseConfig);
    this.dataAnalysisAgent = new DataAnalysisAgent(baseConfig);
    this.taxAgent = new TaxCalculationAgent(baseConfig);
    this.expenseAgent = new ExpenseCategorizationAgent(baseConfig);
    this.complianceAgent = new ComplianceAgent(baseConfig);
  }

  /**
   * Register metadata for all available agents
   */
  private registerAgentMetadata(): void {
    // Tax calculation agent
    this.agentMetadata.set('tax', {
      type: 'tax',
      name: 'Tax Agent',
      description: 'Specializes in tax calculations, tax laws, and payroll tax requirements',
      capabilities: [
        'Calculate federal, state, and local taxes',
        'Provide tax filing information',
        'Explain tax deductions and credits',
        'Simulate tax scenarios for planning'
      ]
    });
    
    // Expense categorization agent
    this.agentMetadata.set('expense', {
      type: 'expense',
      name: 'Expense Agent',
      description: 'Categorizes and analyzes expenses, providing insights for cost management',
      capabilities: [
        'Categorize business expenses',
        'Determine tax deductibility',
        'Analyze spending patterns',
        'Recommend cost-saving opportunities'
      ]
    });
    
    // Compliance agent
    this.agentMetadata.set('compliance', {
      type: 'compliance',
      name: 'Compliance Agent',
      description: 'Monitors regulatory compliance for payroll, HR, and business operations',
      capabilities: [
        'Track regulatory changes',
        'Assess compliance risks',
        'Provide documentation requirements',
        'Recommend compliance actions'
      ]
    });
    
    // Research agent
    this.agentMetadata.set('research', {
      type: 'research',
      name: 'Research Agent',
      description: 'Conducts research on business and financial topics, fetching relevant information',
      capabilities: [
        'Search for information online',
        'Compile research findings',
        'Analyze industry trends',
        'Summarize complex topics'
      ]
    });
    
    // Data analysis agent
    this.agentMetadata.set('data', {
      type: 'data',
      name: 'Data Agent',
      description: 'Analyzes financial and operational data to derive insights and recommendations',
      capabilities: [
        'Analyze payroll data',
        'Generate financial reports',
        'Identify trends and anomalies',
        'Forecast financial outcomes'
      ]
    });
    
    // General purpose agent
    this.agentMetadata.set('general', {
      type: 'general',
      name: 'General Agent',
      description: 'Handles general inquiries and routes to specialized agents when needed',
      capabilities: [
        'Answer general questions',
        'Route queries to specialized agents',
        'Provide basic assistance',
        'Handle conversational interactions'
      ]
    });
  }

  /**
   * Reset all agents to their initial state
   */
  public resetAllAgents(): void {
    this.reasoningAgent.reset();
    this.researchAgent.reset();
    this.dataAnalysisAgent.reset();
    this.taxAgent.reset();
    this.expenseAgent.reset();
    this.complianceAgent.reset();
  }

  /**
   * Get a list of all available agents with their metadata
   */
  public getAvailableAgents(): AgentMetadata[] {
    return Array.from(this.agentMetadata.values());
  }

  /**
   * Get metadata for a specific agent type
   */
  public getAgentMetadata(type: AgentType): AgentMetadata | null {
    return this.agentMetadata.get(type) || null;
  }

  /**
   * Process a query using a specific agent
   */
  public async processQuery(query: string, agentType: AgentType = 'general'): Promise<AgentResponse> {
    try {
      let response;
      
      switch (agentType) {
        case 'tax':
          response = await this.taxAgent.processQuery(query);
          break;
        case 'expense':
          response = await this.expenseAgent.processQuery(query);
          break;
        case 'compliance':
          response = await this.complianceAgent.processQuery(query);
          break;
        case 'research':
          response = await this.researchAgent.processQuery(query);
          break;
        case 'data':
          response = await this.dataAnalysisAgent.processQuery(query);
          break;
        case 'general':
        default:
          // For general queries, use the reasoning agent to determine which specialized agent to use
          const analysis = await this.reasoningAgent.analyzeQuery(query);
          
          if (analysis.relevantAgents && analysis.relevantAgents.length > 0) {
            // Get the most relevant agent
            const mostRelevantAgent = analysis.relevantAgents[0] as AgentType;
            
            // Recursively call processQuery with the identified agent type
            return this.processQuery(query, mostRelevantAgent);
          } else {
            // If no specialized agent is identified, use reasoning agent directly
            response = await this.reasoningAgent.processQuery(query);
          }
          break;
      }
      
      return {
        agentType,
        answer: response.response,
        confidence: response.confidence || 0.7,
        metadata: response.metadata
      };
    } catch (error) {
      console.error(`Error processing query with ${agentType} agent:`, error);
      
      // Return a fallback response
      return {
        agentType,
        answer: `I apologize, but I encountered an error while processing your request with the ${agentType} agent. Please try again or rephrase your question.`,
        confidence: 0,
        metadata: { error: String(error) }
      };
    }
  }
}