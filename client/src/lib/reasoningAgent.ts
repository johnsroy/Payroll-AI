import { BaseAgent, AgentConfig } from './baseAgent';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import { AgentType } from './agentOrchestrator';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ReasoningChain {
  chainId: string;
  steps: ReasoningStep[];
}

interface ReasoningStep {
  stepId: string;
  stepName: string;
  input: any;
  output: any;
  timestamp: Date;
}

interface AnalysisResult {
  requiredAction: string;
  relevantAgents: AgentType[];
  requiresKnowledge: boolean;
  requiresDataAnalysis: boolean;
  confidence: number;
  reasoning: string;
}

export class ReasoningAgent extends BaseAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;
  private model: string = 'claude-3-opus-20240229';
  private temperature: number = 0.3;
  private messages: Message[] = [];
  private reasoningChains: Map<string, ReasoningChain> = new Map();
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Initialize Anthropic client with API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for ReasoningAgent');
    }
    
    this.anthropic = new Anthropic({
      apiKey
    });
    
    // Set up system prompt for reasoning agent
    this.systemPrompt = `You are an advanced reasoning agent in a multi-agent system for payroll management.
Your primary responsibilities are:

1. Analyze user queries to determine which specialized agents to engage
2. Synthesize responses from multiple agents into coherent answers
3. Provide step-by-step reasoning for complex decisions
4. Handle uncertainty and ambiguity in user requests
5. Maintain context and improve responses based on conversation history

When analyzing queries, consider the following specialized agents available in the system:
- TAX: Specializes in payroll tax calculations and compliance
- EXPENSE: Categorizes and manages business expenses
- COMPLIANCE: Handles regulatory compliance for payroll and HR
- RESEARCH: Finds information from internal and external sources
- DATA: Analyzes payroll data and generates insights

Always provide detailed reasoning for your decisions, and when synthesizing multiple agent responses,
ensure coherence and prioritize information based on relevance and confidence scores.`;

    // Initialize first message with system prompt
    this.messages.push({
      role: 'system',
      content: this.systemPrompt
    });
  }

  /**
   * Reset the agent state
   */
  public reset(): void {
    this.messages = [{
      role: 'system',
      content: this.systemPrompt
    }];
    this.reasoningChains.clear();
  }

  /**
   * Analyze a user query to determine which agents to engage
   */
  public async analyzeQuery(query: string): Promise<AnalysisResult> {
    // Create a new reasoning chain for this analysis
    const chainId = uuidv4();
    this.reasoningChains.set(chainId, {
      chainId,
      steps: []
    });
    
    // Create prompt for analysis
    const analysisPrompt = `
Please analyze the following user query to determine which specialized agents should be engaged to provide a response.

User query: "${query}"

First, think step-by-step about what the query is asking for and what kind of expertise is needed to answer it thoroughly.

Then, provide your response in the following JSON format:
{
  "requiredAction": "Brief description of what action is needed to fulfill the query",
  "relevantAgents": ["List of agent types that should be engaged, from: TAX, EXPENSE, COMPLIANCE, RESEARCH, DATA"],
  "requiresKnowledge": true/false (Whether external knowledge or information retrieval is needed),
  "requiresDataAnalysis": true/false (Whether analysis of user-specific data is needed),
  "confidence": 0.0-1.0 (Your confidence in this analysis),
  "reasoning": "Detailed explanation of your reasoning process"
}

Ensure your analysis is thorough and considers all aspects of the query. The system will use your output to determine which specialized agents to engage.`;

    // Add the analysis prompt to messages
    this.messages.push({
      role: 'user',
      content: analysisPrompt
    });
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1000,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });
    
    // Extract JSON from response
    const assistantMessage = response.content[0].text;
    this.messages.push({
      role: 'assistant',
      content: assistantMessage
    });
    
    // Add to reasoning chain
    this.addReasoningStep(chainId, 'Query Analysis', query, assistantMessage);
    
    // Parse JSON from response
    try {
      // Extract JSON using regex
      const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/) || 
                        assistantMessage.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
        const result = JSON.parse(jsonStr);
        
        // Convert agent types to lowercase for consistency
        if (result.relevantAgents) {
          result.relevantAgents = result.relevantAgents.map((agent: string) => 
            agent.toLowerCase() as AgentType
          );
        }
        
        return result as AnalysisResult;
      } else {
        throw new Error('Could not extract JSON from response');
      }
    } catch (error) {
      console.error('Error parsing analysis result:', error);
      
      // Return default analysis
      return {
        requiredAction: 'General query processing',
        relevantAgents: ['general'],
        requiresKnowledge: false,
        requiresDataAnalysis: false,
        confidence: 0.5,
        reasoning: 'Failed to parse structured analysis, falling back to general processing.'
      };
    }
  }

  /**
   * Process a query directly using the reasoning agent
   */
  public async processQuery(query: string): Promise<{ response: string; confidence: number; metadata?: any }> {
    // Create a new reasoning chain
    const chainId = uuidv4();
    this.reasoningChains.set(chainId, {
      chainId,
      steps: []
    });
    
    // Add user message
    this.messages.push({
      role: 'user',
      content: query
    });
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: query
        }
      ]
    });
    
    // Extract response
    const assistantMessage = response.content[0].text;
    this.messages.push({
      role: 'assistant',
      content: assistantMessage
    });
    
    // Add to reasoning chain
    this.addReasoningStep(chainId, 'Direct Query Processing', query, assistantMessage);
    
    return {
      response: assistantMessage,
      confidence: 0.8
    };
  }

  /**
   * Synthesize responses from multiple agents
   */
  public async synthesizeResponses(synthesisPrompt: string): Promise<{ response: string; confidence: number }> {
    // Create a new reasoning chain
    const chainId = uuidv4();
    this.reasoningChains.set(chainId, {
      chainId,
      steps: []
    });
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 2000,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: synthesisPrompt
        }
      ]
    });
    
    // Extract response
    const assistantMessage = response.content[0].text;
    
    // Add to reasoning chain
    this.addReasoningStep(chainId, 'Response Synthesis', synthesisPrompt, assistantMessage);
    
    return {
      response: assistantMessage,
      confidence: 0.9
    };
  }

  /**
   * Add a step to the reasoning chain
   */
  private addReasoningStep(chainId: string, stepName: string, input: any, output: any): void {
    const chain = this.reasoningChains.get(chainId);
    
    if (chain) {
      chain.steps.push({
        stepId: uuidv4(),
        stepName,
        input,
        output,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get reasoning chain by ID
   */
  public getReasoningChain(chainId: string): ReasoningChain | undefined {
    return this.reasoningChains.get(chainId);
  }

  /**
   * Get all reasoning chains
   */
  public getAllReasoningChains(): ReasoningChain[] {
    return Array.from(this.reasoningChains.values());
  }
}