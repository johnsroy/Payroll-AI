import { apiRequest } from "./queryClient";

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
 * Multi-agent response structure
 */
export interface MultiAgentResponse {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  agentContributions: {
    agentType: AgentType;
    agentName: string;
    response: string;
    confidence: number;
  }[];
  analysis: {
    analysis: string;
    agent_relevance: Record<AgentType, {
      score: number;
      reason: string;
    }>;
    plan: string;
  };
  metadata: {
    relevantAgents: AgentType[];
  };
}

/**
 * Get a list of available agents
 */
export async function getAvailableAgents(): Promise<AgentMetadata[]> {
  const response = await apiRequest<{ agents: AgentMetadata[] }>({
    method: "GET",
    path: "/api/agent/available"
  });
  
  return response.agents;
}

/**
 * Process a query with a specific agent
 */
export async function processAgentQuery(
  query: string, 
  agentType: AgentType = 'reasoning',
  userId?: string,
  companyId?: string
): Promise<AgentResponse> {
  return await apiRequest<AgentResponse>({
    method: "POST",
    path: "/api/agent/query",
    data: {
      query,
      agentType,
      userId,
      companyId
    }
  });
}

/**
 * Process a complex query with multiple agents
 * The system will automatically determine which agents to use
 */
export async function processMultiAgentQuery(
  query: string,
  userId?: string,
  companyId?: string
): Promise<MultiAgentResponse> {
  return await apiRequest<MultiAgentResponse>({
    method: "POST",
    path: "/api/agent/multi-query",
    data: {
      query,
      userId,
      companyId
    }
  });
}