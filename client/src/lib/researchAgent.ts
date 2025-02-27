import { BaseAgent, AgentConfig } from './baseAgent';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  source: string;
  date?: string;
}

interface KnowledgeItem {
  id: string;
  content: string;
  source: string;
  relevance: number;
  timestamp: Date;
}

export class ResearchAgent extends BaseAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;
  private model: string = 'claude-3-sonnet-20240229';
  private temperature: number = 0.3;
  private knowledgeBase: KnowledgeItem[] = [];
  private searchResults: Map<string, SearchResult[]> = new Map();
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Initialize Anthropic client with API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for ResearchAgent');
    }
    
    this.anthropic = new Anthropic({
      apiKey
    });
    
    // Set up system prompt for research agent
    this.systemPrompt = `You are an advanced research agent in a multi-agent system for payroll management.
Your primary responsibilities are:

1. Find relevant information from internet sources and knowledge bases
2. Validate information from multiple sources
3. Summarize complex topics related to payroll, taxes, and compliance
4. Provide contextual information to enhance other agents' responses
5. Identify knowledge gaps and suggest areas for further research

You specialize in finding payroll-related information including:
- Tax laws and regulations at federal, state, and local levels
- Compliance requirements for various business types and jurisdictions
- Industry standards and best practices for payroll processes
- Historical data and trends related to payroll management

When responding, always:
- Cite your sources clearly
- Indicate confidence levels in the information provided
- Highlight any conflicting information found during research
- Present information in a structured, easy-to-understand format`;
  }

  /**
   * Reset the agent state
   */
  public reset(): void {
    this.knowledgeBase = [];
    this.searchResults.clear();
  }

  /**
   * Process a query using the research agent
   */
  public async processQuery(query: string): Promise<{ response: string; confidence: number; metadata?: any }> {
    // First, search for relevant information
    const searchResults = await this.performSearchQuery(query);
    
    // Create a research prompt based on the query and search results
    const researchPrompt = this.createResearchPrompt(query, searchResults);
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: researchPrompt
        }
      ]
    });
    
    // Extract response
    const content = response.content[0];
    const assistantMessage = typeof content === 'object' && 'text' in content 
      ? content.text 
      : JSON.stringify(content);
    
    // Extract and store any new knowledge items
    const knowledgeItems = this.extractKnowledgeItems(assistantMessage, searchResults);
    this.addToKnowledgeBase(knowledgeItems);
    
    // Determine confidence based on the quality and quantity of sources
    const confidence = this.calculateConfidence(searchResults, assistantMessage);
    
    return {
      response: assistantMessage,
      confidence,
      metadata: {
        sourceCount: searchResults.length,
        sources: searchResults.map(result => result.source)
      }
    };
  }

  /**
   * Perform a search query and return relevant results
   * This is a simplified implementation. In a real system, this would integrate with
   * search APIs, vector databases, and other information retrieval systems.
   */
  private async performSearchQuery(query: string): Promise<SearchResult[]> {
    // Check if we already have results for this query
    const cacheKey = query.toLowerCase().trim();
    if (this.searchResults.has(cacheKey)) {
      return this.searchResults.get(cacheKey) || [];
    }
    
    // For demo purposes, generate mock search results based on query type
    const mockResults: SearchResult[] = [];
    
    // Mock different result sets based on query keywords
    if (query.toLowerCase().includes('tax') || query.toLowerCase().includes('taxes')) {
      mockResults.push(
        {
          url: 'https://www.irs.gov/businesses/small-businesses-self-employed/employment-taxes',
          title: 'Employment Taxes | Internal Revenue Service',
          snippet: 'Information on employment taxes including federal income tax, Social Security and Medicare taxes, and federal unemployment tax.',
          source: 'irs.gov',
          date: '2023-01-15'
        },
        {
          url: 'https://www.irs.gov/taxtopics/tc751',
          title: 'Tax Topic 751, Social Security and Medicare Withholding Rates',
          snippet: 'The current tax rate for social security is 6.2% for the employer and 6.2% for the employee (12.4% total). The current Medicare tax rate is 1.45% for the employer and 1.45% for the employee (2.9% total).',
          source: 'irs.gov',
          date: '2023-02-10'
        },
        {
          url: 'https://www.ftb.ca.gov/pay/withholding/index.html',
          title: 'California Payroll Tax Withholding | Franchise Tax Board',
          snippet: 'Information on California state payroll tax withholding requirements, rates, and filing procedures.',
          source: 'ftb.ca.gov',
          date: '2022-12-05'
        }
      );
    } else if (query.toLowerCase().includes('compliance') || query.toLowerCase().includes('regulation')) {
      mockResults.push(
        {
          url: 'https://www.dol.gov/agencies/whd/flsa',
          title: 'Fair Labor Standards Act | U.S. Department of Labor',
          snippet: 'The FLSA establishes minimum wage, overtime pay, recordkeeping, and youth employment standards affecting employees in the private sector and in Federal, State, and local governments.',
          source: 'dol.gov',
          date: '2023-03-01'
        },
        {
          url: 'https://www.dol.gov/agencies/whd/state/payday',
          title: 'State Payday Requirements | U.S. Department of Labor',
          snippet: 'Information on state payday requirements including frequency of pay and timelines for final wage payments.',
          source: 'dol.gov',
          date: '2022-11-18'
        },
        {
          url: 'https://www.shrm.org/resourcesandtools/tools-and-samples/policies/pages/cms_016117.aspx',
          title: 'Payroll: Payroll Practices Policy | SHRM',
          snippet: 'Sample payroll practice policies that help employers comply with federal, state and local payroll requirements.',
          source: 'shrm.org',
          date: '2023-01-30'
        }
      );
    } else if (query.toLowerCase().includes('expense') || query.toLowerCase().includes('deduction')) {
      mockResults.push(
        {
          url: 'https://www.irs.gov/publications/p535',
          title: 'Publication 535, Business Expenses | Internal Revenue Service',
          snippet: 'Information on common business expenses and how businesses can deduct them on their tax returns.',
          source: 'irs.gov',
          date: '2023-02-15'
        },
        {
          url: 'https://www.irs.gov/businesses/small-businesses-self-employed/deducting-business-expenses',
          title: 'Deducting Business Expenses | Internal Revenue Service',
          snippet: 'To be deductible, a business expense must be both ordinary and necessary. An ordinary expense is one that is common and accepted in your trade or business. A necessary expense is one that is helpful and appropriate for your trade or business.',
          source: 'irs.gov',
          date: '2022-12-20'
        },
        {
          url: 'https://www.gao.gov/assets/gao-20-36.pdf',
          title: 'Business Expense Tax Deductions | Government Accountability Office',
          snippet: 'Report on business expense deductions, common audit issues, and best practices for documentation and compliance.',
          source: 'gao.gov',
          date: '2022-09-05'
        }
      );
    } else {
      // Generic payroll-related results for any other query
      mockResults.push(
        {
          url: 'https://www.irs.gov/businesses/small-businesses-self-employed/employment-taxes',
          title: 'Employment Taxes | Internal Revenue Service',
          snippet: 'Information on employment taxes including federal income tax, Social Security and Medicare taxes, and federal unemployment tax.',
          source: 'irs.gov',
          date: '2023-01-15'
        },
        {
          url: 'https://www.dol.gov/agencies/whd/flsa',
          title: 'Fair Labor Standards Act | U.S. Department of Labor',
          snippet: 'The FLSA establishes minimum wage, overtime pay, recordkeeping, and youth employment standards affecting employees in the private sector and in Federal, State, and local governments.',
          source: 'dol.gov',
          date: '2023-03-01'
        },
        {
          url: 'https://www.shrm.org/resourcesandtools/tools-and-samples/policies/pages/cms_016117.aspx',
          title: 'Payroll: Payroll Practices Policy | SHRM',
          snippet: 'Sample payroll practice policies that help employers comply with federal, state and local payroll requirements.',
          source: 'shrm.org',
          date: '2023-01-30'
        }
      );
    }
    
    // Cache the results
    this.searchResults.set(cacheKey, mockResults);
    
    return mockResults;
  }

  /**
   * Create a research prompt based on the query and search results
   */
  private createResearchPrompt(query: string, searchResults: SearchResult[]): string {
    let prompt = `I need you to research and provide information about the following query:\n\n"${query}"\n\n`;
    
    prompt += "Based on my search, I've found the following relevant information:\n\n";
    
    searchResults.forEach((result, index) => {
      prompt += `Source ${index + 1}: ${result.title}\n`;
      prompt += `URL: ${result.url}\n`;
      prompt += `From: ${result.source}${result.date ? ` (${result.date})` : ''}\n`;
      prompt += `Information: ${result.snippet}\n\n`;
    });
    
    prompt += `Please synthesize this information to provide a comprehensive answer to the query. 
Your response should:

1. Directly address the main question or topic
2. Organize information in a clear, structured format
3. Cite sources when presenting specific facts or data
4. Note any areas where information is limited or uncertain
5. Highlight any contradictions between sources and explain them if possible
6. Present a balanced view if there are multiple perspectives on the topic

If the available information is insufficient to fully answer the query, please indicate what additional information would be needed.`;
    
    return prompt;
  }

  /**
   * Extract knowledge items from the response
   */
  private extractKnowledgeItems(response: string, searchResults: SearchResult[]): KnowledgeItem[] {
    const knowledgeItems: KnowledgeItem[] = [];
    
    // Extract key facts and statements from the response
    // For now, we'll use a simple approach of breaking by paragraphs
    const paragraphs = response.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      if (paragraph.trim().length > 50) {  // Only consider substantive paragraphs
        // Create a knowledge item
        knowledgeItems.push({
          id: uuidv4(),
          content: paragraph.trim(),
          source: this.determineSourceFromContent(paragraph, searchResults),
          relevance: 0.8,  // Default relevance score
          timestamp: new Date()
        });
      }
    });
    
    return knowledgeItems;
  }

  /**
   * Determine the source of a content paragraph based on text matching
   */
  private determineSourceFromContent(content: string, searchResults: SearchResult[]): string {
    // Try to find mentions of sources in the content
    for (const result of searchResults) {
      const sourcePattern = new RegExp(`(${result.source}|${result.title})`, 'i');
      if (sourcePattern.test(content)) {
        return result.source;
      }
    }
    
    // If no specific source is found, attribute to all sources
    if (searchResults.length > 0) {
      return `Multiple sources (${searchResults.map(r => r.source).join(', ')})`;
    }
    
    return 'Unknown source';
  }

  /**
   * Add items to the knowledge base
   */
  private addToKnowledgeBase(items: KnowledgeItem[]): void {
    this.knowledgeBase.push(...items);
    
    // Limit knowledge base size to prevent memory issues
    if (this.knowledgeBase.length > 1000) {
      // Remove oldest items
      this.knowledgeBase = this.knowledgeBase.slice(this.knowledgeBase.length - 1000);
    }
  }

  /**
   * Calculate confidence based on search results and response
   */
  private calculateConfidence(searchResults: SearchResult[], response: string): number {
    // Start with a baseline confidence
    let confidence = 0.5;
    
    // More sources increases confidence
    confidence += Math.min(0.3, searchResults.length * 0.1);
    
    // Official sources (like .gov domains) increase confidence
    const officialSources = searchResults.filter(r => r.source.includes('.gov')).length;
    confidence += Math.min(0.2, officialSources * 0.1);
    
    // Recent sources increase confidence
    const currentYear = new Date().getFullYear();
    const recentSources = searchResults.filter(r => {
      if (!r.date) return false;
      const year = parseInt(r.date.split('-')[0]);
      return (currentYear - year) <= 2;  // Consider sources in the last 2 years as recent
    }).length;
    
    confidence += Math.min(0.1, recentSources * 0.05);
    
    // Hedging language in response decreases confidence
    const hedgingPatterns = ["may", "might", "could", "possibly", "perhaps", "uncertain", "unclear"];
    const hedgingCount = hedgingPatterns.reduce((count, pattern) => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      return count + (response.match(regex) || []).length;
    }, 0);
    
    confidence -= Math.min(0.3, hedgingCount * 0.05);
    
    // Ensure confidence stays within [0, 1] range
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Query the knowledge base for relevant items
   */
  public queryKnowledgeBase(query: string, limit: number = 5): KnowledgeItem[] {
    // In a real implementation, this would use vector search or other semantic matching
    // For now, we'll use simple keyword matching
    const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    if (keywords.length === 0) {
      return [];
    }
    
    // Score items based on keyword matches
    const scoredItems = this.knowledgeBase.map(item => {
      const content = item.content.toLowerCase();
      let score = 0;
      
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          score += 1;
        }
      });
      
      return { ...item, score };
    });
    
    // Sort by score and return top items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...item }) => item);
  }
}