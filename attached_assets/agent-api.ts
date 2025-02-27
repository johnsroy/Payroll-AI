import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/agentOrchestrator';
import { getCurrentUser } from '@/lib/supabase';

/**
 * API endpoint for processing agent queries
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Extract query, conversation ID, and agent type from the request
    const { query, conversationId, agentType } = body;
    
    // Validate that a query was provided
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'A valid query is required' },
        { status: 400 }
      );
    }
    
    // Get the current user (for tracking conversations)
    const user = await getCurrentUser();
    
    // Create config for the orchestrator
    const config = {
      userId: user?.id,
      companyId: body.companyId,
      conversationId
    };
    
    // Initialize the agent orchestrator
    const orchestrator = new AgentOrchestrator(config);
    
    // Process the query
    let response;
    if (conversationId) {
      // Continue existing conversation
      response = await orchestrator.continueConversation(query);
    } else if (agentType) {
      // Force using a specific agent
      const agent = orchestrator.getAgent(agentType);
      const agentResponse = await agent.sendMessage(query);
      response = {
        response: agentResponse,
        agentType,
        agentName: orchestrator.getAgentMetadata(agentType).name
      };
    } else {
      // Let the orchestrator decide which agent to use
      response = await orchestrator.processQuery(query);
    }
    
    // Return the response
    return NextResponse.json({
      response: response.response,
      agentType: response.agentType,
      agentName: response.agentName,
      conversationId: orchestrator.getConversationId()
    });
  } catch (error) {
    console.error('Error processing agent query:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint for getting available agents
 */
export async function GET(request: NextRequest) {
  try {
    // Create an instance of the orchestrator
    const orchestrator = new AgentOrchestrator();
    
    // Get available agents
    const agents = orchestrator.getAvailableAgents();
    
    // Return the list of agents
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error getting available agents:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
