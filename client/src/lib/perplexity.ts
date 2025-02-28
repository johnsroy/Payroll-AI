/**
 * Perplexity API client for retrieving up-to-date information from the web
 * Provides real-time search capabilities for the application's AI agents
 */

// API endpoint for Perplexity
const PERPLEXITY_API_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

/**
 * Options for Perplexity API requests
 */
interface PerplexityOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number; 
  systemPrompt?: string;
  searchFilter?: 'day' | 'week' | 'month' | 'year' | 'all';
  webSearch?: boolean;
}

/**
 * Default options for Perplexity API
 */
const DEFAULT_OPTIONS: PerplexityOptions = {
  model: 'llama-3.1-sonar-small-128k-online',
  maxTokens: 1024,
  temperature: 0.2,
  systemPrompt: 'You are a helpful AI assistant with web search capabilities. Provide accurate information based on the latest available data.',
  searchFilter: 'month',
  webSearch: true
};

/**
 * Message interface for Perplexity conversations
 */
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Search for real-time information using Perplexity API
 */
export async function searchWithPerplexity(
  query: string,
  options: PerplexityOptions = {}
): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not defined in environment variables');
  }
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Prepare messages array
  const messages: Message[] = [];
  
  // Add system message if provided
  if (mergedOptions.systemPrompt) {
    messages.push({
      role: 'system',
      content: mergedOptions.systemPrompt
    });
  }
  
  // Add user message with the query
  messages.push({
    role: 'user',
    content: query
  });
  
  // Prepare request payload
  const payload = {
    model: mergedOptions.model,
    messages,
    max_tokens: mergedOptions.maxTokens,
    temperature: mergedOptions.temperature,
    search_recency_filter: mergedOptions.searchFilter,
    return_related_questions: false,
    return_images: false,
    frequency_penalty: 1,
    presence_penalty: 0,
    stream: false
  };
  
  try {
    const response = await fetch(PERPLEXITY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the citation sources if available
    const sources = data.citations || [];
    
    // Format the response with citations if available
    let formattedResponse = data.choices[0].message.content;
    
    if (sources.length > 0) {
      formattedResponse += '\n\nSources:\n';
      sources.forEach((source: string, index: number) => {
        formattedResponse += `[${index + 1}] ${source}\n`;
      });
    }
    
    return formattedResponse;
  } catch (error) {
    console.error('Error searching with Perplexity:', error);
    throw error;
  }
}

/**
 * Search for financial information using Perplexity API
 * Specialized for payroll, tax, and financial queries
 */
export async function searchFinancialInfo(query: string): Promise<string> {
  return searchWithPerplexity(query, {
    systemPrompt: 'You are a financial research assistant specialized in payroll, tax regulations, and business finance. Provide accurate, up-to-date information with specific details and citations when possible.',
    temperature: 0.1, // Lower temperature for more factual responses
    searchFilter: 'month', // Focus on recent information
  });
}

/**
 * Search for tax law and compliance information
 */
export async function searchTaxRegulations(query: string): Promise<string> {
  return searchWithPerplexity(query, {
    systemPrompt: 'You are a tax law and compliance research assistant. Provide accurate, up-to-date information about tax regulations, compliance requirements, and relevant deadlines. Include specific citations to tax codes and regulatory documents when possible.',
    temperature: 0.1,
    searchFilter: 'month',
  });
}

/**
 * Search for HR and payroll best practices
 */
export async function searchHRBestPractices(query: string): Promise<string> {
  return searchWithPerplexity(query, {
    systemPrompt: 'You are an HR and payroll best practices research assistant. Provide current information about industry standards, best practices, and trending approaches in human resources and payroll management.',
    temperature: 0.3,
    searchFilter: 'month',
  });
}