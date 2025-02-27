import { AgentBrain } from './agentBrain';

/**
 * Tests the multi-agent system with a given query
 */
export async function testAgents(
  query: string, 
  agentSelections?: {
    reasoning?: boolean;
    research?: boolean;
    dataAnalysis?: boolean;
    tax?: boolean;
    compliance?: boolean;
    expense?: boolean;
  }
): Promise<any> {
  try {
    // Create a new instance of the agent brain
    const agentBrain = new AgentBrain();
    
    // Process the query
    const response = await agentBrain.processQuery(query);
    
    return response;
  } catch (error) {
    console.error('Error in testAgents:', error);
    throw error;
  }
}

/**
 * Check if the required API keys are available for testing
 */
export function checkApiKeys(): boolean {
  // Check if the required API keys are available in the environment
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  
  return hasAnthropicKey;
}