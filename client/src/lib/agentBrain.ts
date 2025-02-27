import { v4 as uuidv4 } from 'uuid';
import { ReasoningAgent } from './reasoningAgent';
import { ResearchAgent } from './researchAgent';
import { DataAnalysisAgent } from './dataAnalysisAgent';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ExpenseCategorizationAgent } from './expenseCategorizationAgent';
import { ComplianceAgent } from './complianceAgent';
import { AgentType } from './agentOrchestrator';

interface AgentBrainConfig {
  userId?: string;
  companyId?: string;
  conversationId?: string;
  enableInternetSearch?: boolean;
  enableKnowledgeBase?: boolean;
  retainMemory?: boolean;
}

interface AgentResponse {
  response: string;
  confidence: number;
  metadata?: any;
}

interface BrainResponse {
  response: string;
  agentsConsulted: AgentType[];
  reasoningChain: ReasoningStep[];
}

interface ReasoningStep {
  step: string;
  data: any;
  timestamp: Date;
}

export class AgentBrain {
  private reasoningAgent: ReasoningAgent;
  private researchAgent: ResearchAgent;
  private dataAnalysisAgent: DataAnalysisAgent;
  private taxAgent: TaxCalculationAgent;
  private expenseAgent: ExpenseCategorizationAgent;
  private complianceAgent: ComplianceAgent;
  private conversationId: string;
  private reasoningChain: ReasoningStep[] = [];
  private config: AgentBrainConfig;

  constructor(config: AgentBrainConfig = {}) {
    this.config = {
      enableInternetSearch: true,
      enableKnowledgeBase: true,
      retainMemory: true,
      ...config
    };

    this.conversationId = config.conversationId || uuidv4();
    
    // Initialize all specialized agents
    this.reasoningAgent = new ReasoningAgent({
      userId: config.userId,
      companyId: config.companyId,
      conversationId: this.conversationId
    });
    
    this.researchAgent = new ResearchAgent({
      userId: config.userId,
      companyId: config.companyId,
      conversationId: this.conversationId,
      enableInternetSearch: config.enableInternetSearch
    });
    
    this.dataAnalysisAgent = new DataAnalysisAgent({
      userId: config.userId,
      companyId: config.companyId,
      conversationId: this.conversationId
    });
    
    this.taxAgent = new TaxCalculationAgent({
      userId: config.userId,
      companyId: config.companyId,
      conversationId: this.conversationId
    });
    
    this.expenseAgent = new ExpenseCategorizationAgent({
      userId: config.userId,
      companyId: config.companyId,
      conversationId: this.conversationId
    });
    
    this.complianceAgent = new ComplianceAgent({
      userId: config.userId,
      companyId: config.companyId,
      conversationId: this.conversationId
    });
  }

  /**
   * Reset the agent brain and all child agents
   */
  public reset(): void {
    this.reasoningChain = [];
    this.conversationId = uuidv4();
    
    // Reset all agents
    this.reasoningAgent.reset();
    this.researchAgent.reset();
    this.dataAnalysisAgent.reset();
    this.taxAgent.reset();
    this.expenseAgent.reset();
    this.complianceAgent.reset();
  }

  /**
   * Get the current conversation ID
   */
  public getConversationId(): string {
    return this.conversationId;
  }

  /**
   * Main method to process a user query through the multi-agent system
   */
  public async processQuery(query: string): Promise<BrainResponse> {
    // Add initial step to reasoning chain
    this.addReasoningStep('Query received', query);
    
    // Step 1: Analyze the query to determine which agents to engage
    const queryAnalysis = await this.reasoningAgent.analyzeQuery(query);
    this.addReasoningStep('Query analysis', queryAnalysis);
    
    // Extract the types of agents to engage
    const agentsToEngage: AgentType[] = queryAnalysis.relevantAgents || [];
    
    // Always engage research agent for knowledge-based questions
    if (queryAnalysis.requiresKnowledge && !agentsToEngage.includes('research')) {
      agentsToEngage.push('research');
    }
    
    // Always engage data analysis for data-related questions
    if (queryAnalysis.requiresDataAnalysis && !agentsToEngage.includes('data')) {
      agentsToEngage.push('data');
    }
    
    // Track which agents were consulted
    const agentsConsulted: AgentType[] = [];
    const responses: Record<AgentType, AgentResponse> = {} as Record<AgentType, AgentResponse>;
    
    // Step 2: Engage the specialized agents in parallel
    const agentPromises = agentsToEngage.map(async (agentType) => {
      try {
        let response: AgentResponse | null = null;
        
        // Invoke the appropriate agent based on type
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
          default:
            // Skip unknown agent types
            return;
        }
        
        if (response) {
          responses[agentType] = response;
          agentsConsulted.push(agentType);
          this.addReasoningStep(`${agentType} agent response`, response);
        }
      } catch (error) {
        this.addReasoningStep(`${agentType} agent error`, error);
        console.error(`Error with ${agentType} agent:`, error);
      }
    });
    
    // Wait for all agent processing to complete
    await Promise.all(agentPromises);
    
    // Step 3: Synthesize the responses using the reasoning agent
    const synthesisPrompt = this.createSynthesisPrompt(query, responses, agentsConsulted);
    this.addReasoningStep('Synthesis prompt', synthesisPrompt);
    
    const finalResponse = await this.reasoningAgent.synthesizeResponses(synthesisPrompt);
    this.addReasoningStep('Final synthesis', finalResponse);
    
    // Return the synthesized response and reasoning chain
    return {
      response: finalResponse.response,
      agentsConsulted,
      reasoningChain: this.reasoningChain
    };
  }

  /**
   * Create a prompt for the reasoning agent to synthesize responses from specialized agents
   */
  private createSynthesisPrompt(
    query: string,
    responses: Record<AgentType, AgentResponse>,
    agentsConsulted: AgentType[]
  ): string {
    let prompt = `User query: ${query}\n\n`;
    
    if (agentsConsulted.length === 0) {
      prompt += "No specialized agents were consulted. Please provide a general response.";
      return prompt;
    }
    
    prompt += "The following specialized agents provided responses:\n\n";
    
    agentsConsulted.forEach(agentType => {
      const response = responses[agentType];
      prompt += `== ${agentType.toUpperCase()} AGENT ==\n`;
      prompt += `Response: ${response.response}\n`;
      prompt += `Confidence: ${response.confidence}\n`;
      
      if (response.metadata) {
        prompt += `Additional metadata: ${JSON.stringify(response.metadata)}\n`;
      }
      
      prompt += "\n";
    });
    
    prompt += "Please synthesize these responses into a coherent, comprehensive answer that addresses the user's query. Consider the confidence level of each agent and prioritize information accordingly. If there are conflicts between agent responses, use your best judgment and explain the reasoning.";
    
    return prompt;
  }

  /**
   * Add a step to the reasoning chain
   */
  private addReasoningStep(step: string, data: any): void {
    this.reasoningChain.push({
      step,
      data,
      timestamp: new Date()
    });
  }
}