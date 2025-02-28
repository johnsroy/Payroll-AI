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
  // This is a mock implementation
  return [
    { 
      type: 'tax', 
      name: 'Tax Calculator', 
      description: 'Calculates payroll taxes and provides tax information' 
    },
    { 
      type: 'expense', 
      name: 'Expense Categorizer', 
      description: 'Categorizes expenses and identifies tax deductions' 
    },
    { 
      type: 'compliance', 
      name: 'Compliance Advisor', 
      description: 'Tracks regulatory compliance and deadlines' 
    },
    { 
      type: 'data', 
      name: 'Data Analyst', 
      description: 'Analyzes payroll data for insights and forecasts' 
    },
    { 
      type: 'research', 
      name: 'Research Specialist', 
      description: 'Researches payroll and tax topics' 
    },
    { 
      type: 'reasoning', 
      name: 'Reasoning Engine', 
      description: 'Coordinates between specialized agents' 
    }
  ];
}

/**
 * Process a query with a specific agent
 */
export async function processAgentQuery(
  query: string,
  agentType: AgentType = 'reasoning',
): Promise<AgentResponse> {
  // This is a mock implementation
  const agentNames: Record<AgentType, string> = {
    tax: 'Tax Calculator',
    expense: 'Expense Categorizer',
    compliance: 'Compliance Advisor',
    data: 'Data Analyst',
    research: 'Research Specialist',
    reasoning: 'Reasoning Engine'
  };

  return {
    id: Math.random().toString(36).substring(2, 15),
    query,
    response: `This is a simulated response from the ${agentNames[agentType]} agent for your query: "${query}"`,
    agentType,
    agentName: agentNames[agentType],
    timestamp: new Date().toISOString(),
    metadata: {}
  };
}