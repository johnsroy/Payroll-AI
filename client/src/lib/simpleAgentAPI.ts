/**
 * Agent types supported by the API
 */
export type AgentType = 'tax' | 'expense' | 'compliance' | 'data' | 'research' | 'reasoning';

/**
 * Agent metadata interface
 */
export interface AgentMetadata {
  type: AgentType;
  name: string;
  description: string;
}

/**
 * Agent response structure
 */
export interface AgentResponse {
  id: string;
  query: string;
  response: string;
  agentType: AgentType;
  agentName: string;
  timestamp: string;
  metadata: Record<string, any>;
}

/**
 * Get a list of available agents
 */
export async function getAvailableAgents(): Promise<AgentMetadata[]> {
  try {
    const response = await fetch('/api/agents');
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching available agents:', error);
    
    // Try the alternate endpoint (for backward compatibility)
    try {
      const altResponse = await fetch('/api/agent/available');
      if (altResponse.ok) {
        return await altResponse.json();
      }
    } catch (altError) {
      console.error('Error fetching from alternate endpoint:', altError);
    }
    
    // Return mock data if API is not available
    return [
      {
        type: 'tax',
        name: 'Tax Calculator',
        description: 'Calculates taxes and provides tax-related information'
      },
      {
        type: 'expense',
        name: 'Expense Categorizer',
        description: 'Categorizes expenses and identifies tax deduction opportunities'
      },
      {
        type: 'compliance',
        name: 'Compliance Advisor',
        description: 'Provides guidance on payroll compliance and regulatory requirements'
      },
      {
        type: 'data',
        name: 'Data Analyst',
        description: 'Analyzes payroll data to identify trends and insights'
      },
      {
        type: 'research',
        name: 'Research Assistant',
        description: 'Researches payroll-related topics and provides documentation'
      },
      {
        type: 'reasoning',
        name: 'Reasoning Engine',
        description: 'Provides logical analysis and reasoning for complex queries'
      }
    ];
  }
}

/**
 * Process a query with a specific agent
 */
export async function processAgentQuery(
  query: string,
  agentType: AgentType = 'reasoning',
): Promise<AgentResponse> {
  try {
    // Try the primary endpoint
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          agentType,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (primaryError) {
      console.error('Error with primary endpoint:', primaryError);
    }
    
    // Try the alternate endpoint
    const altResponse = await fetch('/api/agent/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        agentType,
      }),
    });

    if (altResponse.ok) {
      return await altResponse.json();
    }
    
    throw new Error(`All API endpoints failed`);
  } catch (error) {
    console.error('Error processing agent query:', error);
    
    // Return mock response if API is not available
    return {
      id: 'mock-id-' + Date.now(),
      query,
      response: `This is a simulated response to your query: "${query}" from the ${agentType} agent. In a production environment, this would be processed by our AI model.`,
      agentType,
      agentName: getAgentName(agentType),
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'mock',
        processingTime: 1.2,
      }
    };
  }
}

/**
 * Helper function to get agent name from type
 */
function getAgentName(agentType: AgentType): string {
  const names: Record<AgentType, string> = {
    tax: 'Tax Calculator',
    expense: 'Expense Categorizer',
    compliance: 'Compliance Advisor',
    data: 'Data Analyst',
    research: 'Research Assistant',
    reasoning: 'Reasoning Engine'
  };
  
  return names[agentType] || 'AI Agent';
}