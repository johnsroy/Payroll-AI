import { OpenAI } from 'openai';
import { supabase } from './supabase';
import { BaseAgent } from './baseAgent';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ExpenseCategorizationAgent } from './expenseCategorization';
import { ComplianceAgent } from './complianceAgent';

// Define agent types
export type AgentType = 'tax' | 'expense' | 'compliance' | 'general';

interface AgentMetadata {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
}

export interface OrchestratorConfig {
  userId?: string;
  companyId?: string;
  conversationId?: string;
}

export class AgentOrchestrator {
  private userId?: string;
  private companyId?: string;
  private conversationId?: string;
  private agents: Record<AgentType, BaseAgent | null> = {
    tax: null,
    expense: null,
    compliance: null,
    general: null,
  };
  private agentMetadata: Record<AgentType, AgentMetadata> = {
    tax: {
      type: 'tax',
      name: 'Tax Calculator',
      description: 'Specializes in tax calculations and payroll tax information',
      capabilities: [
        'Calculate payroll taxes based on income and location',
        'Explain tax regulations and requirements',
        'Provide information about tax rates and filing deadlines',
        'Analyze tax implications of business decisions'
      ]
    },
    expense: {
      type: 'expense',
      name: 'Expense Categorizer',
      description: 'Specializes in categorizing and tracking business expenses',
      capabilities: [
        'Categorize expenses based on description and amount',
        'Provide tax deduction information for different expense types',
        'Suggest expense categories for business transactions',
        'Help create custom expense categories for specific needs'
      ]
    },
    compliance: {
      type: 'compliance',
      name: 'Compliance Advisor',
      description: 'Specializes in payroll compliance and regulatory requirements',
      capabilities: [
        'Track filing deadlines for tax and regulatory forms',
        'Explain compliance requirements based on company profile',
        'Monitor compliance status for various requirements',
        'Provide insights on upcoming regulatory changes'
      ]
    },
    general: {
      type: 'general',
      name: 'Payroll Assistant',
      description: 'General payroll assistant that can help with various queries',
      capabilities: [
        'Answer general questions about payroll processing',
        'Provide information about the payroll software',
        'Offer guidance on basic payroll concepts',
        'Route complex queries to specialized agents'
      ]
    }
  };

  constructor(config: OrchestratorConfig = {}) {
    this.userId = config.userId;
    this.companyId = config.companyId;
    this.conversationId = config.conversationId;
  }

  // Initialize an agent if needed
  private getAgent(type: AgentType): BaseAgent {
    if (!this.agents[type]) {
      const config = {
        userId: this.userId,
        companyId: this.companyId,
        conversationId: this.conversationId ? `${this.conversationId}_${type}` : undefined
      };

      switch (type) {
        case 'tax':
          this.agents[type] = new TaxCalculationAgent(config);
          break;
        case 'expense':
          this.agents[type] = new ExpenseCategorizationAgent(config);
          break;
        case 'compliance':
          this.agents[type] = new ComplianceAgent(config);
          break;
        case 'general':
          this.agents[type] = new BaseAgent({
            ...config,
            systemPrompt: `You are a helpful payroll assistant. Your role is to provide general guidance on payroll topics and direct more specialized questions to the appropriate expert agents. You can help with basic payroll concepts, software usage questions, and general information.

For specialized topics, you should identify when another agent would be better suited to handle the query:
- Tax Calculator for tax calculations and payroll tax information
- Expense Categorizer for categorizing and tracking business expenses
- Compliance Advisor for regulatory requirements and deadlines

Respond helpfully to general questions, but for specialized topics, explain that you'll route the query to the appropriate expert.`
          });
          break;
      }
    }

    return this.agents[type]!;
  }

  // Determine which agent should handle the query
  private async routeQuery(query: string): Promise<AgentType> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('Missing OpenAI API key. Defaulting to general agent.');
      return 'general';
    }

    try {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // For client-side use
      });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a query router for a multi-agent payroll system. Your job is to determine which specialized agent should handle the user's query.

Available agents:
- tax: Tax Calculator - handles tax calculations, rates, and filing information
- expense: Expense Categorizer - handles expense categorization and tax deductions
- compliance: Compliance Advisor - handles regulatory compliance and filing deadlines
- general: Payroll Assistant - handles general payroll questions and software usage

Analyze the user query and return ONLY the agent type as a single word (tax, expense, compliance, or general) that is best suited to handle it.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const agentType = response.choices[0].message.content?.toLowerCase().trim() as AgentType;

      // Validate that the returned type is valid
      if (['tax', 'expense', 'compliance', 'general'].includes(agentType)) {
        return agentType;
      }

      // Default to general agent if invalid response
      return 'general';
    } catch (error) {
      console.error('Error routing query:', error);
      return 'general'; // Default to general agent on error
    }
  }

  // Main method to handle user queries
  async processQuery(query: string): Promise<{
    response: string;
    agentType: AgentType;
    agentName: string;
  }> {
    try {
      // Route the query to the appropriate agent
      const agentType = await this.routeQuery(query);
      const agent = this.getAgent(agentType);
      
      // Send the query to the agent
      const response = await agent.sendMessage(query);
      
      // Save the conversation if we have a user ID
      if (this.userId && !this.conversationId) {
        this.saveConversation(query, response, agentType);
      }
      
      return {
        response,
        agentType,
        agentName: this.agentMetadata[agentType].name
      };
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        response: 'I encountered an error while processing your request. Please try again later.',
        agentType: 'general',
        agentName: 'Payroll Assistant'
      };
    }
  }

  // Save conversation to database
  private async saveConversation(query: string, response: string, agentType: AgentType): Promise<void> {
    if (!this.userId) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: this.userId,
          company_id: this.companyId,
          agent_type: agentType,
          messages: [
            { role: 'user', content: query },
            { role: 'assistant', content: response }
          ],
          metadata: {
            orchestrator: true,
            agent_name: this.agentMetadata[agentType].name
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving conversation:', error);
        return;
      }

      this.conversationId = data.id;
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  // Continue an existing conversation
  async continueConversation(query: string): Promise<{
    response: string;
    agentType: AgentType;
    agentName: string;
  }> {
    if (!this.conversationId) {
      return this.processQuery(query);
    }

    try {
      // Get the conversation history to determine which agent was used
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('agent_type, metadata')
        .eq('id', this.conversationId)
        .single();

      if (error) {
        console.error('Error retrieving conversation:', error);
        return this.processQuery(query);
      }

      // Get the agent type from the conversation
      const agentType = data.agent_type as AgentType;
      
      // Use the same agent for continuity
      const agent = this.getAgent(agentType);
      
      // Send the query to the agent
      const response = await agent.sendMessage(query);
      
      return {
        response,
        agentType,
        agentName: this.agentMetadata[agentType].name
      };
    } catch (error) {
      console.error('Error continuing conversation:', error);
      return this.processQuery(query);
    }
  }

  // Get available agents and their capabilities
  getAvailableAgents(): AgentMetadata[] {
    return Object.values(this.agentMetadata);
  }

  // Reset conversation with a specific agent
  resetAgent(type: AgentType): void {
    if (this.agents[type]) {
      this.agents[type]!.clearConversation();
    }
  }

  // Reset all conversations
  resetAllAgents(): void {
    for (const type of Object.keys(this.agents) as AgentType[]) {
      if (this.agents[type]) {
        this.agents[type]!.clearConversation();
      }
    }
    this.conversationId = undefined;
  }
}