import { OpenAI } from 'openai';
import { supabase } from '../supabase';
import { BaseAgent, AgentConfig, Message } from './baseAgent';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ExpenseCategorizationAgent } from './expenseCategorization';
import { ComplianceAgent } from './complianceAgent';
import { AgentOrchestrator, AgentType } from './agentOrchestrator';
import { searchKnowledgeBase } from '../utils/vectorUtils';
import { performSearch, performFinancialSearch, performTaxSearch, performStateSearch, extractWebContent } from '../tools/searchTool';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  constructor(config: AgentBrainConfig) {
    this.userId = config.userId;
    this.companyId = config.companyId;
    this.conversationId = config.conversationId;
    this.model = config.model || 'gpt-4o';
    this.enableInternetSearch = config.enableInternetSearch !== false;
    this.enableKnowledgeBase = config.enableKnowledgeBase !== false;
    this.retainMemory = config.retainMemory !== false;

    // Initialize the agent orchestrator
    this.orchestrator = new AgentOrchestrator({
      userId: this.userId,
      companyId: this.companyId,
      conversationId: this.conversationId
    });

    // Initialize active agents map
    this.activeAgents.set('tax', false);
    this.activeAgents.set('expense', false);
    this.activeAgents.set('compliance', false);
    this.activeAgents.set('general', false);
  }

  /**
   * Process a complex query by analyzing requirements and delegating to specialized agents
   */
  async processQuery(query: string): Promise<{
    response: string;
    reasoning: any[];
    agentsConsulted: AgentType[];
    usedInternetSearch: boolean;
    sources?: any[];
  }> {
    // Reset reasoning chain for new query
    this.reasoningChain = [];
    this.addReasoningStep('query_analysis', { query });

    // Analyze query to determine required agents and steps
    const queryAnalysis = await this.analyzeQuery(query);
    this.addReasoningStep('query_understanding', queryAnalysis);

    // Track which agents are consulted
    const agentsConsulted: AgentType[] = [];
    let usedInternetSearch = false;
    let sources: any[] = [];

    // Check if we need to search the knowledge base
    let knowledgeBaseContext = '';
    if (this.enableKnowledgeBase && queryAnalysis.requiresKnowledgeBase) {
      const knowledgeResults = await searchKnowledgeBase(query);
      if (knowledgeResults.length > 0) {
        knowledgeBaseContext = knowledgeResults.map(r => r.content).join('\n\n');
        sources.push(...knowledgeResults.map(r => ({
          type: 'knowledge_base',
          id: r.id,
          content: r.content.substring(0, 100) + '...',
          similarity: r.similarity
        })));
      }
      this.addReasoningStep('knowledge_base_search', { 
        found: knowledgeResults.length > 0,
        resultCount: knowledgeResults.length
      });
    }

    // Check if we need to search the internet
    let internetSearchContext = '';
    if (this.enableInternetSearch && queryAnalysis.requiresInternetSearch) {
      let searchResults;
      
      // Determine the type of search based on the query
      if (queryAnalysis.queryType === 'tax') {
        searchResults = await performTaxSearch(query);
      } else if (queryAnalysis.queryType === 'compliance') {
        searchResults = await performFinancialSearch(query);
      } else if (queryAnalysis.queryType === 'state_specific' && queryAnalysis.state) {
        searchResults = await performStateSearch(query, queryAnalysis.state);
      } else {
        searchResults = await performSearch({ query });
      }
      
      if (searchResults.length > 0) {
        internetSearchContext = searchResults.map(r => `Title: ${r.title}\nSource: ${r.source}\nSnippet: ${r.snippet || 'No snippet available'}`).join('\n\n');
        sources.push(...searchResults.map(r => ({
          type: 'internet_search',
          title: r.title,
          source: r.source,
          link: r.link
        })));
        usedInternetSearch = true;
      }
      
      this.addReasoningStep('internet_search', { 
        found: searchResults.length > 0,
        resultCount: searchResults.length,
        searchType: queryAnalysis.queryType
      });

      // Extract content from most relevant result if needed
      if (searchResults.length > 0 && queryAnalysis.requiresDetailedContent) {
        const contentUrl = searchResults[0].link;
        if (contentUrl) {
          const extractedContent = await extractWebContent(contentUrl);
          if (extractedContent) {
            internetSearchContext += '\n\n### DETAILED CONTENT ###\n' + extractedContent;
            this.addReasoningStep('content_extraction', { 
              url: contentUrl,
              contentLength: extractedContent.length
            });
          }
        }
      }
    }

    // Determine if we need multiple agents
    let response = '';
    
    if (queryAnalysis.requiresMultipleAgents) {
      // Use coordinator to break down the task
      this.addReasoningStep('multi_agent_coordination', { 
        requiredAgents: queryAnalysis.requiredAgents 
      });
      
      // Process with each required agent
      const subQueryResponses = new Map<AgentType, string>();
      
      for (const agentType of queryAnalysis.requiredAgents) {
        const agent = this.orchestrator.getAgent(agentType);
        
        // Create a sub-query specific to this agent
        const agentMessage = this.createAgentSpecificQuery(query, agentType, queryAnalysis.agentSubQueries[agentType] || '');
        
        // Add context from knowledge base and internet search if available
        let fullMessage = agentMessage;
        if (knowledgeBaseContext) {
          fullMessage += `\n\nContext from knowledge base:\n${knowledgeBaseContext}`;
        }
        if (internetSearchContext) {
          fullMessage += `\n\nContext from internet search:\n${internetSearchContext}`;
        }
        
        // Process with the agent
        const agentResponse = await agent.sendMessage(fullMessage);
        subQueryResponses.set(agentType, agentResponse);
        agentsConsulted.push(agentType);
        this.activeAgents.set(agentType, true);
        
        this.addReasoningStep(`agent_${agentType}_processing`, { 
          query: agentMessage.substring(0, 100) + '...',
          responseLength: agentResponse.length
        });
      }
      
      // Synthesize the responses
      response = await this.synthesizeResponses(query, subQueryResponses, queryAnalysis);
      
      this.addReasoningStep('response_synthesis', { 
        agentCount: subQueryResponses.size,
        finalResponseLength: response.length
      });
    } else {
      // Use a single agent
      const agentType = queryAnalysis.primaryAgent;
      agentsConsulted.push(agentType);
      this.activeAgents.set(agentType, true);
      
      let fullQuery = query;
      if (knowledgeBaseContext) {
        fullQuery += `\n\nContext from knowledge base:\n${knowledgeBaseContext}`;
      }
      if (internetSearchContext) {
        fullQuery += `\n\nContext from internet search:\n${internetSearchContext}`;
      }
      
      // Process with the orchestrator
      const result = await this.orchestrator.processQuery(fullQuery);
      response = result.response;
      
      this.addReasoningStep('single_agent_processing', { 
        agent: agentType,
        responseLength: response.length
      });
    }

    // Add to memory if enabled
    if (this.retainMemory) {
      this.updateMemory(query, response, agentsConsulted);
    }

    return {
      response,
      reasoning: this.reasoningChain,
      agentsConsulted,
      usedInternetSearch,
      sources: sources.length > 0 ? sources : undefined
    };
  }

  /**
   * Analyze the query to determine required agents and processing steps
   */
  private async analyzeQuery(query: string): Promise<any> {
    try {
      const systemPrompt = `You are a query analyzer for a multi-agent payroll system. Your job is to analyze user queries to determine:
1. The primary type of query (tax, expense, compliance, or general)
2. Whether multiple specialized agents are needed
3. Which agents should be consulted
4. Whether internet search is required for up-to-date information
5. Whether knowledge base search is required
6. If the query is state-specific, identify the U.S. state
7. If detailed breakdown into sub-queries is needed for different agents

Return a JSON with:
- queryType: the primary category (tax, expense, compliance, general)
- primaryAgent: the main agent to handle this (tax, expense, compliance, general)
- requiresMultipleAgents: boolean
- requiredAgents: array of agent types needed (tax, expense, compliance, general)
- requiresInternetSearch: boolean
- requiresKnowledgeBase: boolean
- requiresDetailedContent: boolean (whether detailed content extraction is needed)
- state: two-letter state code if state-specific, or null
- agentSubQueries: object with agent types as keys and specific sub-queries as values`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const analysisText = response.choices[0].message.content;
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Error analyzing query:', error);
      // Return a default analysis that routes to the general agent
      return {
        queryType: 'general',
        primaryAgent: 'general',
        requiresMultipleAgents: false,
        requiredAgents: ['general'],
        requiresInternetSearch: false,
        requiresKnowledgeBase: true,
        requiresDetailedContent: false,
        state: null,
        agentSubQueries: {}
      };
    }
  }

  /**
   * Create a specialized query for a specific agent type
   */
  private createAgentSpecificQuery(originalQuery: string, agentType: AgentType, suggestedSubQuery: string): string {
    if (suggestedSubQuery) {
      return suggestedSubQuery;
    }

    // Default sub-queries based on agent type
    switch (agentType) {
      case 'tax':
        return `Focus on the tax aspects of this query: ${originalQuery}`;
      case 'expense':
        return `Focus on the expense categorization aspects of this query: ${originalQuery}`;
      case 'compliance':
        return `Focus on the compliance and regulatory aspects of this query: ${originalQuery}`;
      case 'general':
      default:
        return originalQuery;
    }
  }

  /**
   * Synthesize responses from multiple agents into a coherent answer
   */
  private async synthesizeResponses(
    originalQuery: string,
    agentResponses: Map<AgentType, string>,
    queryAnalysis: any
  ): Promise<string> {
    try {
      // Create a context object with all agent responses
      const context = Array.from(agentResponses.entries()).map(([agent, response]) => {
        return `### ${this.getAgentName(agent)} Response:\n${response}`;
      }).join('\n\n');

      const systemPrompt = `You are a response synthesizer for a multi-agent payroll system. Your job is to create a comprehensive, coherent response based on input from multiple specialized agents. The user's original query is provided along with responses from different agents.

Synthesize these responses into a unified answer that:
1. Directly addresses the user's question
2. Integrates information from all relevant agents without redundancy
3. Presents a clear and structured response
4. Acknowledges any information gaps or uncertainties
5. Provides actionable next steps when appropriate

Do not mention that you are synthesizing responses or reference the individual agents. Present the information as a single, coherent response.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Original query: ${originalQuery}\n\n${context}` 
          }
        ],
        temperature: 0.2
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error synthesizing responses:', error);
      
      // Fallback: concatenate the responses with headers
      return Array.from(agentResponses.entries())
        .map(([agent, response]) => `${this.getAgentName(agent)}:\n${response}`)
        .join('\n\n');
    }
  }

  /**
   * Get the friendly name of an agent type
   */
  private getAgentName(agentType: AgentType): string {
    switch (agentType) {
      case 'tax':
        return 'Tax Calculator';
      case 'expense':
        return 'Expense Categorizer';
      case 'compliance':
        return 'Compliance Advisor';
      case 'general':
        return 'Payroll Assistant';
      default:
        return 'Assistant';
    }
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
   * Update the memory with conversation history
   */
  private async updateMemory(query: string, response: string, agentsConsulted: AgentType[]): Promise<void> {
    // Add to memory array
    this.memory.push({
      query,
      response,
      timestamp: new Date().toISOString(),
      agentsConsulted
    });

    // Limit memory size
    if (this.memory.length > 10) {
      this.memory = this.memory.slice(-10);
    }

    // Persist to database if we have user ID
    if (this.userId) {
      try {
        await supabase
          .from('brain_memory')
          .insert({
            user_id: this.userId,
            company_id: this.companyId,
            query,
            response,
            agents_consulted: agentsConsulted,
            reasoning_chain: this.reasoningChain
          });
      } catch (error) {
        console.error('Error updating memory:', error);
      }
    }
  }

  /**
   * Get the conversation memory
   */
  getMemory(): any[] {
    return this.memory;
  }

  /**
   * Get the reasoning chain for the current query
   */
  getReasoningChain(): any[] {
    return this.reasoningChain;
  }

  /**
   * Get active agents that have been used
   */
  getActiveAgents(): AgentType[] {
    return Array.from(this.activeAgents.entries())
      .filter(([_, active]) => active)
      .map(([agent, _]) => agent);
  }

  /**
   * Reset the agent brain
   */
  reset(): void {
    this.memory = [];
    this.reasoningChain = [];
    this.orchestrator.resetAllAgents();
    this.activeAgents.forEach((_, key) => {
      this.activeAgents.set(key, false);
    });
  }
}
