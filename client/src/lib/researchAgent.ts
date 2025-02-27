import { BaseAgent, AgentConfig } from './baseAgent';
import OpenAI from 'openai';

interface ResearchResult {
  query: string;
  sources: Array<{
    title: string;
    content: string;
    url?: string;
    relevance: number;
    source_type: 'internet' | 'knowledge_base' | 'database';
  }>;
  summary: string;
  key_points: string[];
}

interface ResearchOptions {
  use_internet?: boolean;
  use_knowledge_base?: boolean;
  max_sources?: number;
  include_content?: boolean;
}

export class ResearchAgent extends BaseAgent {
  private openai: OpenAI;
  
  constructor(config: AgentConfig) {
    // Define specialized system prompt for research agent
    const researchSystemPrompt = `You are a payroll research assistant specialized in finding accurate information. Your primary functions are:

1. Research tax laws, regulations, and compliance requirements
2. Find information about payroll best practices and industry standards
3. Locate and summarize relevant case studies and examples
4. Track updates to relevant laws and regulations

When conducting research:
- Provide specific citations and sources for all information
- Indicate the recency and reliability of different sources
- Prioritize authoritative sources like government websites and official publications
- Synthesize information from multiple sources when appropriate
- Acknowledge areas of uncertainty or conflicting information

Always clarify the limitations of your research and advise consulting with certified professionals for definitive guidance on complex matters.`;

    // Initialize the agent with research-specific configuration
    super({
      ...config,
      systemPrompt: researchSystemPrompt,
      temperature: 0.3, // Balanced temperature for research
    });
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    // Define research tools
    this.tools = [
      {
        type: "function",
        function: {
          name: "conduct_research",
          description: "Conduct research on a specific topic",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The research query or topic"
              },
              use_internet: {
                type: "boolean",
                description: "Whether to search the internet for information"
              },
              use_knowledge_base: {
                type: "boolean",
                description: "Whether to search the knowledge base for information"
              },
              max_sources: {
                type: "number",
                description: "Maximum number of sources to return"
              },
              include_content: {
                type: "boolean",
                description: "Whether to include full content of sources"
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "track_updates",
          description: "Track latest updates on a specific regulatory or tax topic",
          parameters: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The topic to track updates for"
              },
              time_period: {
                type: "string",
                description: "The time period to look for updates (e.g., 'last month', '2023')",
                enum: ["last week", "last month", "last quarter", "last year", "2023", "2024", "all"]
              }
            },
            required: ["topic"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "compare_sources",
          description: "Compare multiple sources on a specific topic to identify discrepancies",
          parameters: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The topic to compare sources for"
              },
              sources: {
                type: "array",
                description: "List of sources to compare (optional)",
                items: {
                  type: "object"
                }
              }
            },
            required: ["topic"]
          }
        }
      }
    ];
  }

  /**
   * Conduct research on a specific topic
   */
  async conductResearch(
    query: string,
    options: ResearchOptions = {}
  ): Promise<ResearchResult> {
    // Default options
    const defaultOptions = {
      use_internet: true,
      use_knowledge_base: true,
      max_sources: 5,
      include_content: true
    };
    
    // Merge with provided options
    const settings = { ...defaultOptions, ...options };
    
    // Sources array to store results
    const sources: ResearchResult['sources'] = [];
    
    // Search internet if enabled
    if (settings.use_internet) {
      try {
        // For demo purposes, we'll simulate internet search with a direct OpenAI query
        // In a real implementation, this would use a search API or web scraping
        const searchPrompt = `You are a search engine that finds information about: ${query}
        
Please provide 3 relevant search results in the following JSON format:
[
  {
    "title": "Title of the source",
    "content": "Brief summary of the content",
    "url": "https://example.com/source",
    "relevance": 0.95
  }
]`;

        const response = await this.openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: searchPrompt }],
          response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (content) {
          try {
            const results = JSON.parse(content);
            if (Array.isArray(results)) {
              for (const result of results) {
                sources.push({
                  ...result,
                  source_type: 'internet'
                });
              }
            }
          } catch (e) {
            console.error('Error parsing search results:', e);
          }
        }
      } catch (error) {
        console.error('Error searching the internet:', error);
      }
    }
    
    // Search knowledge base if enabled
    if (settings.use_knowledge_base) {
      try {
        // In a real implementation, this would query a vector database
        // For demo purposes, we'll add some simulated knowledge base entries
        sources.push({
          title: "IRS Payroll Tax Guide 2024",
          content: "Comprehensive guide to payroll tax requirements for employers in 2024.",
          relevance: 0.9,
          source_type: 'knowledge_base'
        });
        
        sources.push({
          title: "State Payroll Tax Rates Database",
          content: "Current tax rates for all 50 states, updated for 2024 fiscal year.",
          relevance: 0.8,
          source_type: 'knowledge_base'
        });
      } catch (error) {
        console.error('Error searching knowledge base:', error);
      }
    }
    
    // Limit sources to max_sources
    const limitedSources = sources
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, settings.max_sources);
    
    // If include_content is false, remove content from sources
    const finalSources = settings.include_content 
      ? limitedSources 
      : limitedSources.map(({ content, ...rest }) => ({ 
          ...rest, 
          content: content.substring(0, 100) + '...' 
        }));
    
    // Generate research summary using the agent's LLM
    const sourcesText = finalSources.map((source, index) => 
      `Source ${index + 1}: ${source.title}\n${source.content}\n`
    ).join('\n');
    
    const researchPrompt = `Based on the following sources related to "${query}", please provide:
1. A concise summary of the key information (2-3 paragraphs)
2. A list of 3-5 key points or takeaways

Sources:
${sourcesText}

Format your response as follows:
SUMMARY:
[your summary here]

KEY POINTS:
- [first key point]
- [second key point]
- [etc.]`;

    const response = await this.sendMessage(researchPrompt);
    
    // Parse the summary and key points
    const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/);
    const keyPointsMatch = response.match(/KEY POINTS:\s*([\s\S]*?)$/);
    
    const summary = summaryMatch ? summaryMatch[1].trim() : "No summary available.";
    
    let keyPoints: string[] = [];
    if (keyPointsMatch) {
      keyPoints = keyPointsMatch[1]
        .split(/\n\s*-\s*/)
        .filter(point => point.trim().length > 0)
        .map(point => point.trim());
    }
    
    return {
      query,
      sources: finalSources,
      summary,
      key_points: keyPoints
    };
  }

  /**
   * Synthesize research findings into a coherent summary
   */
  private async synthesizeResearch(
    query: string,
    sources: ResearchResult['sources']
  ): Promise<{
    summary: string;
    key_points: string[];
  }> {
    const sourcesText = sources.map((source, index) => 
      `Source ${index + 1} (${source.source_type}): ${source.title}\n${source.content}\n`
    ).join('\n');
    
    const synthesisPrompt = `Based on the following sources related to "${query}", please provide:
1. A concise summary of the key information (2-3 paragraphs)
2. A list of 3-5 key points or takeaways

Sources:
${sourcesText}

Format your response as follows:
SUMMARY:
[your summary here]

KEY POINTS:
- [first key point]
- [second key point]
- [etc.]`;

    const response = await this.sendMessage(synthesisPrompt);
    
    // Parse the summary and key points
    const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/);
    const keyPointsMatch = response.match(/KEY POINTS:\s*([\s\S]*?)$/);
    
    const summary = summaryMatch ? summaryMatch[1].trim() : "No summary available.";
    
    let keyPoints: string[] = [];
    if (keyPointsMatch) {
      keyPoints = keyPointsMatch[1]
        .split(/\n\s*-\s*/)
        .filter(point => point.trim().length > 0)
        .map(point => point.trim());
    }
    
    return {
      summary,
      key_points: keyPoints
    };
  }

  /**
   * Track latest updates on a specific tax or regulatory topic
   */
  async trackUpdates(topic: string, timePeriod: string = 'last month'): Promise<{
    topic: string;
    time_period: string;
    updates: Array<{
      date: string;
      title: string;
      summary: string;
      source: string;
      url?: string;
    }>;
    notable_changes: string[];
  }> {
    // In a real implementation, this would query an RSS feed, API, or perform targeted searches
    // For demo purposes, we'll simulate results
    
    const trackingPrompt = `You are a tracking system for ${topic} updates during the period: ${timePeriod}.
    
Please provide 3 relevant updates in the following JSON format:
{
  "updates": [
    {
      "date": "YYYY-MM-DD",
      "title": "Title of the update",
      "summary": "Brief summary of the update",
      "source": "Source name",
      "url": "https://example.com/source"
    }
  ],
  "notable_changes": [
    "Description of the first notable change",
    "Description of the second notable change"
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: trackingPrompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to retrieve updates');
    }
    
    try {
      const results = JSON.parse(content);
      return {
        topic,
        time_period: timePeriod,
        updates: results.updates || [],
        notable_changes: results.notable_changes || []
      };
    } catch (e) {
      console.error('Error parsing tracking results:', e);
      return {
        topic,
        time_period: timePeriod,
        updates: [],
        notable_changes: []
      };
    }
  }

  /**
   * Compare multiple sources on a specific topic to identify discrepancies
   */
  async compareSourcesForDiscrepancies(
    topic: string,
    providedSources: Array<{ source: string; url?: string; content: string }> = []
  ): Promise<{
    topic: string;
    discrepancies: Array<{
      point: string;
      different_views: Array<{ source: string; view: string }>;
      recommended_interpretation: string;
    }>;
    consistency_score: number;
  }> {
    // If sources are provided, use them
    // Otherwise, conduct research to find sources
    const sources = providedSources.length > 0
      ? providedSources
      : (await this.conductResearch(topic, { max_sources: 4 })).sources;
    
    const formattedSources = sources.map((source, index) => {
      // Handle both provided sources and sources from conductResearch
      const title = 'title' in source ? source.title : source.source;
      const content = source.content;
      
      return `Source ${index + 1}: ${title}\n${content}\n`;
    }).join('\n');
    
    const comparisonPrompt = `Compare the following sources on the topic "${topic}" and identify any discrepancies or conflicting information:

${formattedSources}

Format your response as follows:
DISCREPANCIES:
1. [Point of discrepancy]
   - Source X: [view from source X]
   - Source Y: [view from source Y]
   RECOMMENDED: [recommended interpretation]

2. [Next point of discrepancy]
   ...

CONSISTENCY SCORE: [Score from 0-100, where 100 means perfect consistency]

If there are no discrepancies, state "No significant discrepancies found" and explain why the sources are consistent.`;

    const response = await this.sendMessage(comparisonPrompt);
    
    // Parse discrepancies and consistency score
    const discrepancies: Array<{
      point: string;
      different_views: Array<{ source: string; view: string }>;
      recommended_interpretation: string;
    }> = [];
    
    // Use regex to extract discrepancies
    const discrepancyRegex = /\d+\.\s+(.*?)(?:\n\s+-\s+(.*?):\s+(.*?)(?:\n\s+-\s+|\n\s+RECOMMENDED:))+\s+RECOMMENDED:\s+(.*?)(?=\n\d+\.|\nCONSISTENCY SCORE:)/gs;
    
    let match;
    while ((match = discrepancyRegex.exec(response)) !== null) {
      if (match[0].includes('No significant discrepancies found')) {
        // No discrepancies case
        continue;
      }
      
      const point = match[1].trim();
      
      // Extract views from different sources
      const viewsText = match[0];
      const viewRegex = /-\s+(.*?):\s+(.*?)(?=\n\s+-|\n\s+RECOMMENDED:)/g;
      
      const different_views: Array<{ source: string; view: string }> = [];
      let viewMatch;
      
      while ((viewMatch = viewRegex.exec(viewsText)) !== null) {
        different_views.push({
          source: viewMatch[1].trim(),
          view: viewMatch[2].trim()
        });
      }
      
      // Extract recommended interpretation
      const recommendedMatch = viewsText.match(/RECOMMENDED:\s+(.*?)(?=\n\d+\.|\nCONSISTENCY SCORE:|$)/s);
      const recommended_interpretation = recommendedMatch 
        ? recommendedMatch[1].trim() 
        : "No specific recommendation provided.";
      
      discrepancies.push({
        point,
        different_views,
        recommended_interpretation
      });
    }
    
    // Extract consistency score
    const scoreMatch = response.match(/CONSISTENCY SCORE:\s*(\d+)/);
    const consistency_score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
    
    return {
      topic,
      discrepancies,
      consistency_score
    };
  }
  
  protected async handleToolCalls(toolCalls: any[]): Promise<any[]> {
    const results = [];
    
    for (const call of toolCalls) {
      const functionName = call.function.name;
      const argsJson = call.function.arguments;
      let args;
      
      try {
        args = JSON.parse(argsJson);
      } catch (e) {
        results.push({
          role: 'function',
          name: functionName,
          content: JSON.stringify({ error: 'Invalid JSON arguments' })
        });
        continue;
      }
      
      let functionResult;
      
      // Call the appropriate function based on the name
      switch (functionName) {
        case 'conduct_research':
          functionResult = await this.conductResearch(
            args.query,
            {
              use_internet: args.use_internet,
              use_knowledge_base: args.use_knowledge_base,
              max_sources: args.max_sources,
              include_content: args.include_content
            }
          );
          break;
        case 'track_updates':
          functionResult = await this.trackUpdates(
            args.topic,
            args.time_period
          );
          break;
        case 'compare_sources':
          functionResult = await this.compareSourcesForDiscrepancies(
            args.topic,
            args.sources
          );
          break;
        default:
          functionResult = { error: `Unknown function: ${functionName}` };
          break;
      }
      
      results.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
      });
    }
    
    return results;
  }
}