import { Request, Response } from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI providers
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Agent types
type AgentType = 'tax' | 'expense' | 'compliance' | 'data' | 'research' | 'reasoning';

// Agent metadata for displaying in the UI
interface AgentMetadata {
  type: AgentType;
  name: string;
  description: string;
}

// Available agents configuration
const availableAgents: AgentMetadata[] = [
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

// System prompts for each agent type
const agentPrompts: Record<AgentType, string> = {
  tax: `You are the Tax Calculator Agent, a specialized AI that helps with tax calculations and provides tax-related information for payroll management. You should:
1. Provide accurate information about tax laws, rates, and calculations
2. Help users understand tax implications for various payroll scenarios
3. Calculate estimated taxes when provided with relevant information
4. Explain tax forms, filings, and compliance requirements
5. Focus only on tax-related queries and defer other topics to more appropriate agents`,

  expense: `You are the Expense Categorization Agent, a specialized AI that helps categorize expenses and identify tax deduction opportunities. You should:
1. Help users categorize business expenses correctly
2. Identify potential tax deductions based on expense descriptions
3. Explain tax rules related to different expense categories
4. Suggest record-keeping best practices for expense tracking
5. Focus only on expense categorization and deductions, deferring other topics to more appropriate agents`,

  compliance: `You are the Compliance Advisor Agent, a specialized AI that helps with payroll compliance and regulatory requirements. You should:
1. Provide information about federal, state, and local payroll regulations
2. Explain compliance requirements for different business types and sizes
3. Alert users to important deadlines and filing requirements
4. Offer guidance on maintaining proper payroll records and documentation
5. Focus only on compliance-related queries and defer other topics to more appropriate agents`,

  data: `You are the Data Analysis Agent, a specialized AI that helps analyze payroll data to identify trends and insights. You should:
1. Help users interpret payroll data and identify patterns
2. Suggest metrics and KPIs for payroll analysis
3. Explain statistical concepts relevant to payroll management
4. Provide insights on optimizing payroll costs and efficiency
5. Focus only on data analysis queries and defer other topics to more appropriate agents`,

  research: `You are the Research Assistant Agent, a specialized AI that researches payroll-related topics and provides documentation. You should:
1. Research specific payroll topics when requested
2. Summarize relevant information from authoritative sources
3. Provide references to regulations, articles, and other resources
4. Stay current on the latest payroll management practices and trends
5. Focus only on research-related queries and defer other topics to more appropriate agents`,

  reasoning: `You are the Reasoning Engine Agent, a specialized AI that provides logical analysis and reasoning for complex payroll management questions. You should:
1. Help users think through complex payroll decisions and strategies
2. Weigh pros and cons of different approaches to payroll management
3. Consider multiple factors when offering recommendations
4. Explain your reasoning process clearly and logically
5. Take a balanced and comprehensive approach to complex queries`
};

/**
 * Get a list of available agents
 */
export function getAgents(_req: Request, res: Response) {
  try {
    res.json(availableAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch available agents' });
  }
}

/**
 * Process a query with a specific agent
 */
export async function processQuery(req: Request, res: Response) {
  try {
    const { query, agentType = 'reasoning' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get agent metadata
    const agent = availableAgents.find(a => a.type === agentType);
    
    if (!agent) {
      return res.status(400).json({ error: 'Invalid agent type' });
    }

    // Get system prompt for the agent
    const systemPrompt = agentPrompts[agentType];

    // Process with OpenAI
    let response: string;
    
    // Choose between OpenAI and Anthropic based on agent type
    if (['reasoning', 'research'].includes(agentType)) {
      // Use Anthropic for reasoning and research
      const result = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: query }
        ]
      });
      
      response = result.content[0].text;
    } else {
      // Use OpenAI for other agent types
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 1000
      });
      
      response = completion.choices[0].message.content || 'No response generated';
    }

    // Send response
    res.json({
      id: `query-${Date.now()}`,
      query,
      response,
      agentType,
      agentName: agent.name,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: Math.random() * 2 + 0.5, // Mock processing time between 0.5 and 2.5 seconds
      }
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
}