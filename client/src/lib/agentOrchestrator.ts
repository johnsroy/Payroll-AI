import { BaseAgent } from './baseAgent';
import { TaxCalculationAgent } from './taxCalculationAgent';
import { ExpenseCategorizationAgent } from './expenseCategorization';
import { ComplianceAgent } from './complianceAgent';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

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
    general: null
  };
  
  private agentMetadata: Record<AgentType, AgentMetadata> = {
    tax: {
      type: 'tax',
      name: 'Tax Calculation Agent',
      description: 'Specialized in tax calculations and regulations',
      capabilities: [
        'Calculate payroll taxes including FICA, federal, and state withholdings',
        'Provide up-to-date tax rates and thresholds',
        'Explain tax forms and filing requirements',
        'Estimate tax liabilities for planning purposes'
      ]
    },
    expense: {
      type: 'expense',
      name: 'Expense Categorization Agent',
      description: 'Expert in expense categorization and deductions',
      capabilities: [
        'Categorize expenses according to IRS guidelines',
        'Identify tax-deductible business expenses',
        'Recommend expense allocation strategies',
        'Match expenses to appropriate accounting categories'
      ]
    },
    compliance: {
      type: 'compliance',
      name: 'Compliance Agent',
      description: 'Specialized in payroll compliance and regulations',
      capabilities: [
        'Track federal, state, and local compliance requirements',
        'Monitor upcoming filing deadlines',
        'Provide guidance on employment regulations',
        'Audit payroll processes for compliance issues'
      ]
    },
    general: {
      type: 'general',
      name: 'General Payroll Assistant',
      description: 'General assistance with payroll questions',
      capabilities: [
        'Answer common payroll questions',
        'Explain payroll terminology and concepts',
        'Guide you to specialized agents for complex tasks',
        'Provide general payroll best practices'
      ]
    }
  };

  constructor(config: OrchestratorConfig = {}) {
    this.userId = config.userId;
    this.companyId = config.companyId;
    this.conversationId = config.conversationId;
  }

  getAgent(type: AgentType): BaseAgent {
    if (!this.agents[type]) {
      const config = {
        conversationId: this.conversationId,
        userId: this.userId,
        companyId: this.companyId,
        memory: true
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
        default:
          this.agents[type] = new BaseAgent({
            ...config,
            systemPrompt: "You are a helpful payroll assistant. Answer questions about payroll, taxes, and related topics in a clear and concise manner."
          });
          break;
      }
    }

    return this.agents[type]!;
  }

  private async routeQuery(query: string): Promise<AgentType> {
    // Use natural language understanding to route to the appropriate agent
    // For simplicity, we'll use some basic keyword matching here
    const lowerQuery = query.toLowerCase();
    
    if (/tax|taxes|withholding|fica|medicare|social security|w-2|w-4|1099/i.test(lowerQuery)) {
      return 'tax';
    } else if (/expense|receipt|categorize|deduct|business expense|travel|meals|entertainment/i.test(lowerQuery)) {
      return 'expense';
    } else if (/compliance|regulation|deadline|file|form|requirement|law|legal/i.test(lowerQuery)) {
      return 'compliance';
    } else {
      return 'general';
    }
  }

  async processQuery(query: string): Promise<{
    response: string;
    agentType: AgentType;
    agentName: string;
  }> {
    // Determine which agent should handle this query
    const agentType = await this.routeQuery(query);
    const agent = this.getAgent(agentType);
    
    // Process the query with the selected agent
    const response = await agent.sendMessage(query);
    
    // Create a new conversation if we don't have an ID yet
    if (!this.conversationId) {
      this.conversationId = uuidv4();
    }
    
    // Save the conversation for future reference
    await this.saveConversation(query, response, agentType);
    
    return {
      response,
      agentType,
      agentName: this.agentMetadata[agentType].name
    };
  }

  private async saveConversation(query: string, response: string, agentType: AgentType): Promise<void> {
    if (!this.userId || !this.conversationId) {
      return; // Skip saving if we don't have a user or conversation ID
    }
    
    try {
      // Check if the conversation exists
      const { data: existingConversation } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('id', this.conversationId)
        .single();
      
      if (!existingConversation) {
        // Create a new conversation record
        await supabase
          .from('ai_conversations')
          .insert({
            id: this.conversationId,
            user_id: this.userId,
            company_id: this.companyId,
            title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
            created_at: new Date().toISOString()
          });
      }
      
      // Add the message to the conversation
      await supabase
        .from('ai_messages')
        .insert([
          {
            conversation_id: this.conversationId,
            role: 'user',
            content: query,
            timestamp: new Date().toISOString()
          },
          {
            conversation_id: this.conversationId,
            role: 'assistant',
            content: response,
            agent_type: agentType,
            timestamp: new Date().toISOString()
          }
        ]);
      
    } catch (error) {
      console.error('Error saving conversation:', error);
      // Continue even if saving fails
    }
  }

  async continueConversation(query: string): Promise<{
    response: string;
    agentType: AgentType;
    agentName: string;
  }> {
    if (!this.conversationId) {
      // If no conversation ID, start a new one
      return this.processQuery(query);
    }
    
    // Determine which agent last responded to this conversation
    let lastAgentType: AgentType = 'general';
    
    try {
      const { data } = await supabase
        .from('ai_messages')
        .select('agent_type')
        .eq('conversation_id', this.conversationId)
        .eq('role', 'assistant')
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0 && data[0].agent_type) {
        lastAgentType = data[0].agent_type as AgentType;
      }
    } catch (error) {
      console.error('Error fetching last agent type:', error);
    }
    
    // Use the last agent used, but re-analyze if the query seems different
    const newAgentType = await this.routeQuery(query);
    const agentType = newAgentType === 'general' ? lastAgentType : newAgentType;
    
    // Get the agent and send the message
    const agent = this.getAgent(agentType);
    const response = await agent.sendMessage(query);
    
    // Save the continued conversation
    await this.saveConversation(query, response, agentType);
    
    return {
      response,
      agentType,
      agentName: this.agentMetadata[agentType].name
    };
  }

  getAvailableAgents(): AgentMetadata[] {
    return Object.values(this.agentMetadata);
  }

  resetAgent(type: AgentType): void {
    if (this.agents[type]) {
      this.agents[type]!.clearConversation();
    }
  }

  resetAllAgents(): void {
    Object.keys(this.agents).forEach(type => {
      if (this.agents[type as AgentType]) {
        this.agents[type as AgentType]!.clearConversation();
      }
    });
  }

  getConversationId(): string | undefined {
    return this.conversationId;
  }

  getAgentMetadata(type: AgentType): AgentMetadata {
    return this.agentMetadata[type];
  }
}