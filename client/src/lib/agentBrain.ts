import { AgentOrchestrator, AgentType, OrchestratedResponse } from './agentOrchestrator';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ComplianceAgent } from './complianceAgent';
import { ExpenseCategorizationAgent } from './expenseCategorizationAgent';
import { DataAnalysisAgent } from './dataAnalysisAgent';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import { searchWithPerplexity } from './perplexity';

/**
 * Configuration for the AgentBrain
 */
interface AgentBrainConfig {
  userId?: string;
  companyId?: string;
  conversationId?: string;
  enableInternetSearch?: boolean;
  enableKnowledgeBase?: boolean;
  retainMemory?: boolean;
}

/**
 * Memory item for the agent conversation history
 */
interface MemoryItem {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  agentsConsulted: AgentType[];
  reasoningChain: any[];
  metadata?: any;
}

/**
 * AgentBrain serves as the central coordination system for all agents,
 * handling complex requests through multiple specialized agents and
 * providing unified responses.
 */
export class AgentBrain {
  private orchestrator: AgentOrchestrator;
  private userId?: string;
  private companyId?: string;
  private conversationId?: string;
  private enableInternetSearch: boolean;
  private enableKnowledgeBase: boolean;
  private retainMemory: boolean;
  private memory: MemoryItem[] = [];
  private activeAgents: Set<AgentType> = new Set();
  private reasoningChain: any[] = [];
  
  /**
   * Initialize the AgentBrain with configuration
   */
  constructor(config: AgentBrainConfig = {}) {
    // Set configuration parameters
    this.userId = config.userId;
    this.companyId = config.companyId;
    this.conversationId = config.conversationId;
    this.enableInternetSearch = config.enableInternetSearch !== undefined ? config.enableInternetSearch : true;
    this.enableKnowledgeBase = config.enableKnowledgeBase !== undefined ? config.enableKnowledgeBase : true;
    this.retainMemory = config.retainMemory !== undefined ? config.retainMemory : true;
    
    // Initialize the orchestrator
    this.orchestrator = new AgentOrchestrator({
      userId: this.userId,
      companyId: this.companyId,
      conversationId: this.conversationId
    });
    
    // Initialize specialized agents
    this.initializeAgents();
    
    // Load memory if needed
    if (this.retainMemory && this.conversationId) {
      this.loadMemory(this.conversationId);
    }
  }
  
  /**
   * Initialize all specialized agents
   */
  private initializeAgents(): void {
    // Initialize tax calculation agent
    const taxAgent = new TaxCalculationAgent({
      name: "Tax Calculation Agent",
      userId: this.userId,
      companyId: this.companyId
    });
    this.orchestrator.registerAgent('tax', taxAgent);
    
    // Initialize compliance agent
    const complianceAgent = new ComplianceAgent({
      name: "Compliance Agent",
      userId: this.userId,
      companyId: this.companyId
    });
    this.orchestrator.registerAgent('compliance', complianceAgent);
    
    // Initialize expense categorization agent
    const expenseAgent = new ExpenseCategorizationAgent({
      name: "Expense Categorization Agent",
      userId: this.userId,
      companyId: this.companyId
    });
    this.orchestrator.registerAgent('expense', expenseAgent);
    
    // Initialize data analysis agent
    const dataAnalysisAgent = new DataAnalysisAgent({
      name: "Data Analysis Agent",
      userId: this.userId,
      companyId: this.companyId
    });
    this.orchestrator.registerAgent('data', dataAnalysisAgent);
  }
  
  /**
   * Process a complex query through the multi-agent system
   */
  public async processQuery(query: string): Promise<{
    id: string;
    query: string;
    response: string;
    timestamp: Date;
    agentsConsulted: AgentType[];
    reasoningChain: any[];
  }> {
    try {
      // Clear reasoning chain for new query
      this.reasoningChain = [];
      
      // Step 1: Analyze the query to determine requirements
      this.addReasoningStep('Query Analysis', { query });
      const requirements = await this.analyzeQuery(query);
      this.addReasoningStep('Requirements Analysis', requirements);
      
      // Step 2: Perform web search if enabled and needed
      let webSearchResults = '';
      if (this.enableInternetSearch && requirements.needsInternetSearch) {
        this.addReasoningStep('Internet Search Started', { query });
        try {
          webSearchResults = await searchWithPerplexity(query);
          this.addReasoningStep('Internet Search Completed', { 
            success: true, 
            resultLength: webSearchResults.length 
          });
        } catch (error: unknown) {
          this.addReasoningStep('Internet Search Failed', { 
            error: error instanceof Error ? error.message : String(error) 
          });
          // Continue without search results
        }
      }
      
      // Step 3: Process with the orchestrator
      this.addReasoningStep('Preparing for Agent Processing', {
        agentsToConsult: requirements.relevantAgents
      });
      
      // Construct a modified query with context if available
      let enhancedQuery = query;
      if (webSearchResults) {
        enhancedQuery += `\n\nHere is some relevant information from the web that might help answer this question:\n${webSearchResults}`;
      }
      
      // Process through orchestrator
      const response = await this.orchestrator.processQuery(enhancedQuery);
      
      // Update active agents
      if (response.agentContributions) {
        for (const contribution of response.agentContributions) {
          this.activeAgents.add(contribution.agentType);
        }
      }
      
      // Step 4: Create memory record
      const memoryItem: MemoryItem = {
        id: response.id || uuidv4(),
        query,
        response: response.response,
        timestamp: response.timestamp || new Date(),
        agentsConsulted: response.agentContributions?.map(c => c.agentType) || [],
        reasoningChain: [...this.reasoningChain],
        metadata: {
          confidence: response.confidence,
          primaryAgent: response.primaryAgent,
          webSearch: webSearchResults ? true : false
        }
      };
      
      // Add to memory if retention is enabled
      if (this.retainMemory) {
        this.memory.push(memoryItem);
        this.saveMemory(memoryItem);
      }
      
      // Return the response
      return {
        id: memoryItem.id,
        query: memoryItem.query,
        response: memoryItem.response,
        timestamp: memoryItem.timestamp,
        agentsConsulted: memoryItem.agentsConsulted,
        reasoningChain: memoryItem.reasoningChain
      };
    } catch (error: unknown) {
      console.error('Error in AgentBrain.processQuery:', error instanceof Error ? error.message : String(error));
      
      // Return graceful error response
      return {
        id: uuidv4(),
        query,
        response: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
        agentsConsulted: [],
        reasoningChain: this.reasoningChain
      };
    }
  }
  
  /**
   * Analyze the query to determine processing requirements
   */
  private async analyzeQuery(query: string): Promise<{
    relevantAgents: AgentType[];
    needsInternetSearch: boolean;
    confidenceScore: number;
    reasoningNotes: string;
  }> {
    // In a more advanced implementation, this would use a dedicated model to
    // analyze the query in detail. For now, we'll use simple heuristics.
    
    const relevantAgents: AgentType[] = [];
    let needsInternetSearch = false;
    let confidenceScore = 0.8;
    let reasoningNotes = '';
    
    // Check for tax-related keywords
    if (
      query.toLowerCase().includes('tax') ||
      query.toLowerCase().includes('deduction') ||
      query.toLowerCase().includes('withholding') ||
      query.toLowerCase().includes('fica') ||
      query.toLowerCase().includes('medicare') ||
      query.toLowerCase().includes('social security')
    ) {
      relevantAgents.push('tax');
      reasoningNotes += 'Query contains tax-related terms. ';
    }
    
    // Check for compliance-related keywords
    if (
      query.toLowerCase().includes('compliance') ||
      query.toLowerCase().includes('regulation') ||
      query.toLowerCase().includes('law') ||
      query.toLowerCase().includes('deadline') ||
      query.toLowerCase().includes('requirement') ||
      query.toLowerCase().includes('legal')
    ) {
      relevantAgents.push('compliance');
      reasoningNotes += 'Query contains compliance-related terms. ';
    }
    
    // Check for expense-related keywords
    if (
      query.toLowerCase().includes('expense') ||
      query.toLowerCase().includes('receipt') ||
      query.toLowerCase().includes('reimbursement') ||
      query.toLowerCase().includes('categorize') ||
      query.toLowerCase().includes('spending')
    ) {
      relevantAgents.push('expense');
      reasoningNotes += 'Query contains expense-related terms. ';
    }
    
    // Check for data analysis-related keywords
    if (
      query.toLowerCase().includes('analyze') ||
      query.toLowerCase().includes('report') ||
      query.toLowerCase().includes('trend') ||
      query.toLowerCase().includes('forecast') ||
      query.toLowerCase().includes('projection') ||
      query.toLowerCase().includes('data') ||
      query.toLowerCase().includes('statistics') ||
      query.toLowerCase().includes('average') ||
      query.toLowerCase().includes('total')
    ) {
      relevantAgents.push('data');
      reasoningNotes += 'Query contains data analysis-related terms. ';
    }
    
    // Check if internet search might be needed
    if (
      query.toLowerCase().includes('latest') ||
      query.toLowerCase().includes('current') ||
      query.toLowerCase().includes('recent') ||
      query.toLowerCase().includes('update') ||
      query.toLowerCase().includes('news') ||
      query.toLowerCase().includes('changes') ||
      query.toLowerCase().includes('2024') ||
      query.toLowerCase().includes('2025')
    ) {
      needsInternetSearch = true;
      reasoningNotes += 'Query may require up-to-date information. ';
    }
    
    // If no specific agents were identified, default to using all
    if (relevantAgents.length === 0) {
      relevantAgents.push('tax', 'compliance', 'expense', 'data');
      confidenceScore = 0.5;
      reasoningNotes += 'No specific agent type identified; using all agents as fallback. ';
    }
    
    return {
      relevantAgents,
      needsInternetSearch,
      confidenceScore,
      reasoningNotes
    };
  }
  
  /**
   * Add a step to the reasoning chain for transparency
   */
  private addReasoningStep(step: string, data: any): void {
    this.reasoningChain.push({
      step,
      timestamp: new Date().toISOString(),
      data
    });
  }
  
  /**
   * Load conversation memory from storage
   */
  private async loadMemory(conversationId: string): Promise<void> {
    try {
      // Load conversation from Supabase
      const { data, error } = await supabase
        .from('brain_memory')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Parse and set memory
        this.memory = data.map(item => ({
          id: item.id,
          query: item.query,
          response: item.response,
          timestamp: new Date(item.timestamp),
          agentsConsulted: item.agents_consulted || [],
          reasoningChain: item.reasoning_chain || [],
          metadata: item.metadata || {}
        }));
      }
    } catch (error: unknown) {
      console.error('Error loading memory:', error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Save a memory item to storage
   */
  private async saveMemory(item: MemoryItem): Promise<void> {
    if (!this.conversationId) return;
    
    try {
      // Save to Supabase
      await supabase
        .from('brain_memory')
        .insert({
          id: item.id,
          conversation_id: this.conversationId,
          query: item.query,
          response: item.response,
          timestamp: item.timestamp.toISOString(),
          agents_consulted: item.agentsConsulted,
          reasoning_chain: item.reasoningChain,
          metadata: item.metadata,
          user_id: this.userId,
          company_id: this.companyId
        });
    } catch (error: unknown) {
      console.error('Error saving memory:', error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Get the memory (conversation history)
   */
  public getMemory(): MemoryItem[] {
    return [...this.memory];
  }
  
  /**
   * Get the current reasoning chain
   */
  public getReasoningChain(): any[] {
    return [...this.reasoningChain];
  }
  
  /**
   * Get active agents that have been used
   */
  public getActiveAgents(): AgentType[] {
    return Array.from(this.activeAgents);
  }
  
  /**
   * Get available agents from the orchestrator
   */
  public getAvailableAgents(): any[] {
    return this.orchestrator.getAvailableAgents();
  }
  
  /**
   * Reset the agent brain
   */
  public reset(): void {
    this.memory = [];
    this.reasoningChain = [];
    this.activeAgents.clear();
    this.orchestrator.resetAllAgents();
  }
  
  /**
   * Reset a specific agent
   */
  public resetAgent(type: AgentType): void {
    this.orchestrator.resetAgent(type);
  }
}