import { Request, Response } from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize API clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const ANTHROPIC_MODEL = "claude-3-7-sonnet-20250219";

// Agent types
type AgentType = 'tax' | 'expense' | 'compliance' | 'data' | 'research' | 'reasoning';

// Agent metadata for each specialized agent
const agentMetadata = {
  tax: {
    name: "Tax Calculator",
    description: "Specializes in tax calculations and tax regulations",
    model: ANTHROPIC_MODEL,
    systemPrompt: `You are the Tax Calculator agent, specializing in all aspects of payroll tax calculations.

Your role is to:
1. Calculate accurate federal, state, and local income tax withholdings
2. Determine correct FICA taxes (Social Security and Medicare)
3. Apply appropriate tax credits and deductions
4. Explain tax calculations in clear, understandable terms
5. Stay updated with the latest tax laws and rates for 2025

When responding, always:
- Show your work with detailed calculations when appropriate
- Cite specific tax codes and rates when relevant
- Provide disclaimers when tax regulations may have exceptions or special cases
- Recommend seeking professional tax advice for complex situations

Remember that PayrollPro AI focuses on providing accurate payroll tax calculations to help businesses ensure compliance and optimize tax planning.`
  },
  expense: {
    name: "Expense Categorizer",
    description: "Categorizes expenses and identifies tax deductions",
    model: OPENAI_MODEL,
    systemPrompt: `You are the Expense Categorizer agent for PayrollPro AI, specializing in expense classification and tax deduction identification.

Your role is to:
1. Accurately categorize business expenses into appropriate accounting categories
2. Identify potential tax deductions and credits related to expenses
3. Determine the tax treatment of different expense types
4. Explain expense categorization rules and best practices
5. Help users understand expense documentation requirements

When responding, always:
- Be specific about expense categories and their tax implications
- Cite relevant tax codes when discussing deductibility
- Explain any limitations or special rules for certain expense types
- Suggest proper documentation practices for different expense categories

Remember that PayrollPro AI focuses on helping businesses properly categorize expenses to maximize tax benefits while ensuring compliance with tax regulations.`
  },
  compliance: {
    name: "Compliance Advisor",
    description: "Monitors regulatory compliance and deadlines",
    model: ANTHROPIC_MODEL,
    systemPrompt: `You are the Compliance Advisor agent for PayrollPro AI, specializing in payroll and tax regulatory compliance.

Your role is to:
1. Provide guidance on federal, state, and local payroll regulations
2. Alert users to upcoming filing deadlines and requirements
3. Explain compliance obligations for different business types and sizes
4. Help users understand penalty risks for non-compliance
5. Stay updated on changing regulations in the payroll space

When responding, always:
- Be specific about regulatory requirements and deadlines
- Cite relevant laws, regulations, or codes when appropriate
- Acknowledge when requirements may vary by location or business type
- Recommend consulting with legal experts for complex compliance issues

Remember that PayrollPro AI focuses on helping businesses maintain compliance with payroll regulations to avoid penalties and ensure smooth operations.`
  },
  data: {
    name: "Data Analyst",
    description: "Analyzes payroll data for insights and forecasting",
    model: OPENAI_MODEL,
    systemPrompt: `You are the Data Analyst agent for PayrollPro AI, specializing in payroll data analytics and visualization.

Your role is to:
1. Analyze payroll data to identify trends, patterns, and anomalies
2. Generate forecasts for future payroll expenses and tax liabilities
3. Compare actual vs. budgeted payroll costs
4. Identify potential cost-saving opportunities
5. Translate complex data into actionable business insights

When responding, always:
- Present analysis in clear, understandable terms
- Suggest specific metrics and KPIs to track
- Recommend visualizations that would help illustrate key insights
- Explain how data insights can inform business decisions

Remember that PayrollPro AI focuses on helping businesses leverage their payroll data to make better financial decisions and optimize operations.`
  },
  research: {
    name: "Research Specialist",
    description: "Researches payroll and tax topics using current information",
    model: ANTHROPIC_MODEL,
    systemPrompt: `You are the Research Specialist agent for PayrollPro AI, focusing on providing up-to-date information on payroll and tax topics.

Your role is to:
1. Research specific payroll and tax questions using the latest available information
2. Track updates to tax laws, rates, and payroll regulations
3. Summarize complex tax and payroll information in accessible language
4. Provide context and background on payroll-related topics
5. Compare practices across different states or business types

When responding, always:
- Cite your sources of information when possible
- Indicate how recent the information is
- Acknowledge areas of uncertainty or where regulations are changing
- Consider both federal and state-specific information when relevant

Remember that PayrollPro AI focuses on helping businesses stay informed about payroll and tax matters with research-backed information.`
  },
  reasoning: {
    name: "Reasoning Engine",
    description: "Handles complex multi-step reasoning for payroll questions",
    model: ANTHROPIC_MODEL,
    systemPrompt: `You are the Reasoning Engine agent for PayrollPro AI, specializing in complex problem-solving related to payroll.

Your role is to:
1. Break down complex payroll problems into logical steps
2. Consider multiple perspectives and alternative approaches
3. Evaluate trade-offs in different payroll strategies
4. Integrate information from different domains (tax, compliance, etc.)
5. Generate step-by-step solutions to complex payroll questions

When responding, always:
- Show your reasoning process explicitly
- Consider potential objections or limitations to your approach
- Acknowledge assumptions you're making
- Explain why your solution is appropriate for the specific context

Remember that PayrollPro AI focuses on helping businesses navigate complex payroll decisions through transparent, logical reasoning.`
  }
};

// Process query based on agent type
export async function processAgentQuery(req: Request, res: Response) {
  try {
    const { query, agentType = 'reasoning', userId, companyId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get agent metadata
    const agent = agentMetadata[agentType as AgentType];
    if (!agent) {
      return res.status(400).json({ error: 'Invalid agent type' });
    }

    let response;
    const timestamp = new Date();

    // Use the appropriate model based on agent type
    if (agent.model.includes('claude')) {
      // Use Anthropic for Claude models
      const result = await anthropic.messages.create({
        model: agent.model,
        max_tokens: 1500,
        system: agent.systemPrompt,
        messages: [
          { role: 'user', content: query }
        ],
      });
      
      // Extract text content safely
      const responseText = result.content[0].type === 'text' 
        ? result.content[0].text 
        : "I'm unable to process that request at the moment. Please try again.";
      
      response = {
        id: Date.now().toString(),
        query,
        response: responseText,
        agentType,
        agentName: agent.name,
        timestamp,
        metadata: {
          model: agent.model,
          provider: 'anthropic'
        }
      };
    } else {
      // Use OpenAI for GPT models
      const result = await openai.chat.completions.create({
        model: agent.model,
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 1500,
        temperature: 0.5,
      });
      
      response = {
        id: Date.now().toString(),
        query,
        response: result.choices[0].message.content,
        agentType,
        agentName: agent.name,
        timestamp,
        metadata: {
          model: agent.model,
          provider: 'openai'
        }
      };
    }

    // Save the conversation to database if needed
    // This would be implemented based on your storage mechanism

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error processing agent query:', error);
    return res.status(500).json({ 
      error: 'Failed to process query',
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Get available agents
export async function getAvailableAgents(_req: Request, res: Response) {
  try {
    const agents = Object.entries(agentMetadata).map(([type, data]) => ({
      type,
      name: data.name,
      description: data.description
    }));
    
    return res.status(200).json({ agents });
  } catch (error) {
    console.error('Error getting available agents:', error);
    return res.status(500).json({ 
      error: 'Failed to get available agents',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Process multi-agent query using the reasoning engine to coordinate
export async function processMultiAgentQuery(req: Request, res: Response) {
  try {
    const { query, userId, companyId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // First, use the reasoning agent to determine which specialized agents to consult
    const reasoningAgent = agentMetadata.reasoning;
    
    const analysisPrompt = `As the Reasoning Engine, analyze this payroll-related query and determine which specialized agents should be consulted to provide the best response.

Query: "${query}"

First, break down this query into its key components. Then, for each of the following specialized agents, rate from 0-10 how relevant they would be for answering this query, with a brief explanation why:

1. Tax Calculator: Specializes in tax calculations and tax regulations
2. Expense Categorizer: Categorizes expenses and identifies tax deductions
3. Compliance Advisor: Monitors regulatory compliance and deadlines
4. Data Analyst: Analyzes payroll data for insights and forecasting
5. Research Specialist: Researches payroll and tax topics using current information

Finally, provide a plan for how the most relevant agents should work together to answer this query.

Format your response in JSON with these exact keys:
{
  "analysis": "Your breakdown of the query",
  "agent_relevance": {
    "tax": {"score": [0-10], "reason": "explanation"},
    "expense": {"score": [0-10], "reason": "explanation"},
    "compliance": {"score": [0-10], "reason": "explanation"},
    "data": {"score": [0-10], "reason": "explanation"},
    "research": {"score": [0-10], "reason": "explanation"}
  },
  "plan": "Your step-by-step plan for answering this query"
}`;

    // Get analysis from reasoning agent
    const analysisResult = await anthropic.messages.create({
      model: reasoningAgent.model,
      max_tokens: 1500,
      system: reasoningAgent.systemPrompt,
      messages: [{ role: 'user', content: analysisPrompt }]
    });
    
    // Parse the content safely
    const responseText = analysisResult.content[0].type === 'text' 
      ? analysisResult.content[0].text 
      : '{"analysis":"Error parsing response","agent_relevance":{"tax":{"score":5,"reason":"default"},"expense":{"score":5,"reason":"default"},"compliance":{"score":5,"reason":"default"},"data":{"score":5,"reason":"default"},"research":{"score":5,"reason":"default"}},"plan":"Use reasoning agent"}';
    
    const analysisResponse = JSON.parse(responseText);
    
    // Determine which agents to consult based on relevance scores
    const relevantAgents = Object.entries(analysisResponse.agent_relevance)
      .filter(([_, data]: [string, any]) => data.score >= 7) // Only use agents with high relevance
      .map(([type]) => type);
    
    if (relevantAgents.length === 0) {
      // If no agents are highly relevant, just use the reasoning agent
      relevantAgents.push('reasoning');
    }
    
    // Collect responses from the relevant agents
    const agentContributions = [];
    
    for (const agentType of relevantAgents) {
      const agent = agentMetadata[agentType as AgentType];
      
      let agentResponse;
      if (agent.model.includes('claude')) {
        const result = await anthropic.messages.create({
          model: agent.model,
          max_tokens: 1000,
          system: agent.systemPrompt,
          messages: [
            { role: 'user', content: query }
          ],
        });
        
        // Extract text content safely
        agentResponse = result.content[0].type === 'text' 
          ? result.content[0].text 
          : "I'm unable to process that request at the moment. Please try again.";
      } else {
        const result = await openai.chat.completions.create({
          model: agent.model,
          messages: [
            { role: 'system', content: agent.systemPrompt },
            { role: 'user', content: query }
          ],
          max_tokens: 1000,
          temperature: 0.5,
        });
        
        agentResponse = result.choices[0].message.content;
      }
      
      agentContributions.push({
        agentType,
        agentName: agent.name,
        response: agentResponse,
        confidence: analysisResponse.agent_relevance[agentType].score / 10,
      });
    }
    
    // If there's more than one agent, use the reasoning agent to integrate the responses
    let finalResponse;
    if (agentContributions.length > 1) {
      const integrationPrompt = `As the Reasoning Engine, your task is to integrate the specialized responses below into a cohesive, unified answer for the user's query.

User Query: "${query}"

Specialized Agent Responses:
${agentContributions.map(contribution => 
  `--- ${contribution.agentName} ---\n${contribution.response}\n`
).join('\n')}

Based on these specialized responses, provide a comprehensive answer that addresses all aspects of the user's query. Make sure the answer is coherent, non-redundant, and well-organized. Include all relevant information while avoiding unnecessary repetition.`;

      const integrationResult = await anthropic.messages.create({
        model: reasoningAgent.model,
        max_tokens: 1500,
        system: reasoningAgent.systemPrompt,
        messages: [{ role: 'user', content: integrationPrompt }],
      });
      
      // Extract text content safely
      finalResponse = integrationResult.content[0].type === 'text' 
        ? integrationResult.content[0].text 
        : "I'm unable to integrate the responses at the moment. Please try again.";
    } else {
      // If there's only one agent, use its response directly
      finalResponse = agentContributions[0].response;
    }
    
    const response = {
      id: Date.now().toString(),
      query,
      response: finalResponse,
      timestamp: new Date(),
      agentContributions,
      analysis: analysisResponse,
      metadata: {
        relevantAgents,
      }
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error processing multi-agent query:', error);
    return res.status(500).json({ 
      error: 'Failed to process multi-agent query',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}