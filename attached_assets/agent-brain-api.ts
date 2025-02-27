import { NextRequest, NextResponse } from 'next/server';
import { AgentBrain } from '@/lib/agents/agentBrain';
import { ReasoningAgent } from '@/lib/agents/reasoningAgent';
import { ResearchAgent } from '@/lib/agents/researchAgent';
import { DataAnalysisAgent } from '@/lib/agents/dataAnalysisAgent';
import { getCurrentUser } from '@/lib/supabase';

/**
 * API endpoint for the Agent Brain
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { 
      query, 
      conversationId, 
      options = {},
      action = 'process_query' 
    } = body;
    
    // Validate that a query was provided
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'A valid query is required' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const user = await getCurrentUser();
    
    // Create config for the agent brain
    const config = {
      userId: user?.id,
      companyId: body.companyId,
      conversationId,
      model: options.model || 'gpt-4o',
      enableInternetSearch: options.enableInternetSearch !== false,
      enableKnowledgeBase: options.enableKnowledgeBase !== false,
      retainMemory: options.retainMemory !== false
    };
    
    // Process based on the requested action
    switch (action) {
      case 'process_query': {
        // Use the Agent Brain for general queries
        const agentBrain = new AgentBrain(config);
        const result = await agentBrain.processQuery(query);
        
        return NextResponse.json({
          response: result.response,
          reasoning: result.reasoning,
          agentsConsulted: result.agentsConsulted,
          usedInternetSearch: result.usedInternetSearch,
          sources: result.sources,
          conversationId: conversationId || body.companyId
        });
      }
      
      case 'step_by_step_reasoning': {
        // Use Reasoning Agent for detailed analysis
        const reasoningAgent = new ReasoningAgent({
          userId: user?.id,
          companyId: body.companyId,
          conversationId,
          model: options.model || 'gpt-4o'
        });
        
        const result = await reasoningAgent.performReasoning(query);
        
        return NextResponse.json({
          reasoning: result.reasoning,
          finalAnswer: result.finalAnswer,
          conversationId
        });
      }
      
      case 'research_topic': {
        // Use Research Agent for gathering information
        const researchAgent = new ResearchAgent({
          userId: user?.id,
          companyId: body.companyId,
          conversationId,
          model: options.model || 'gpt-4o'
        });
        
        const result = await researchAgent.conductResearch(query, {
          use_internet: options.enableInternetSearch,
          use_knowledge_base: options.enableKnowledgeBase,
          max_sources: options.maxSources || 5,
          include_content: options.includeContent !== false
        });
        
        return NextResponse.json({
          topic: result.query,
          summary: result.summary,
          key_points: result.key_points,
          sources: result.sources,
          conversationId
        });
      }
      
      case 'analyze_data': {
        // Use Data Analysis Agent for data insights
        if (!body.data) {
          return NextResponse.json(
            { error: 'Data is required for analysis' },
            { status: 400 }
          );
        }
        
        const dataAnalysisAgent = new DataAnalysisAgent({
          userId: user?.id,
          companyId: body.companyId,
          conversationId,
          model: options.model || 'gpt-4o'
        });
        
        const result = await dataAnalysisAgent.analyzeData(body.data, query);
        
        return NextResponse.json({
          summary: result.summary,
          insights: result.insights,
          statistics: result.statistics,
          visualizationSuggestions: result.visualizationSuggestions,
          conversationId
        });
      }
      
      case 'generate_forecast': {
        // Use Data Analysis Agent for forecasting
        if (!body.historicalData || !Array.isArray(body.historicalData)) {
          return NextResponse.json(
            { error: 'Historical data is required for forecasting' },
            { status: 400 }
          );
        }
        
        const dataAnalysisAgent = new DataAnalysisAgent({
          userId: user?.id,
          companyId: body.companyId,
          conversationId,
          model: options.model || 'gpt-4o'
        });
        
        const periodsToForecast = body.periodsToForecast || 3;
        const forecastName = body.forecastName || query;
        const additionalFactors = body.additionalFactors;
        
        const result = await dataAnalysisAgent.generateForecast(
          body.historicalData,
          periodsToForecast,
          forecastName,
          additionalFactors
        );
        
        return NextResponse.json({
          forecast: result.forecast,
          confidenceLevel: result.confidenceLevel,
          assumptions: result.assumptions,
          riskFactors: result.riskFactors,
          conversationId
        });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing agent brain request:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint for getting agent brain status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');
    const action = searchParams.get('action') || 'status';
    
    // Get the current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    switch (action) {
      case 'status': {
        // Simple status check
        return NextResponse.json({ 
          status: 'online',
          agents: [
            'agent_brain',
            'reasoning_agent',
            'research_agent',
            'data_analysis_agent',
            'tax_calculation_agent',
            'expense_categorization_agent',
            'compliance_agent'
          ],
          capabilities: [
            'natural_language_processing',
            'step_by_step_reasoning',
            'internet_search',
            'data_analysis',
            'forecasting',
            'research',
            'multi_agent_coordination'
          ]
        });
      }
      
      case 'conversation_memory': {
        // Get conversation memory if conversation ID is provided
        if (!conversationId) {
          return NextResponse.json(
            { error: 'Conversation ID is required' },
            { status: 400 }
          );
        }
        
        const agentBrain = new AgentBrain({
          userId: user.id,
          conversationId
        });
        
        const memory = agentBrain.getMemory();
        
        return NextResponse.json({ memory });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing agent brain status request:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
