/**
 * Internet search tool implementation for AI agents
 * Uses SerpAPI to fetch search results
 */

import { supabase } from '../supabase';

// SerpAPI key for web search
const SERPAPI_KEY = process.env.SERPAPI_KEY;

interface SearchParams {
  query: string;
  num_results?: number;
  include_snippets?: boolean;
}

interface SearchResult {
  title: string;
  link: string;
  snippet?: string;
  source: string;
  date?: string;
}

/**
 * Perform an internet search using SerpAPI
 */
export async function performSearch({
  query,
  num_results = 5,
  include_snippets = true
}: SearchParams): Promise<SearchResult[]> {
  try {
    // Check if we have recent cached results for this query
    const { data: cachedResults, error: cacheError } = await supabase
      .from('search_cache')
      .select('results, timestamp')
      .eq('query', query.toLowerCase())
      .order('timestamp', { ascending: false })
      .limit(1);

    // If we have recent results (less than 1 hour old), return them
    if (cachedResults && cachedResults.length > 0) {
      const cacheAge = Date.now() - new Date(cachedResults[0].timestamp).getTime();
      if (cacheAge < 3600000) { // 1 hour in milliseconds
        return JSON.parse(cachedResults[0].results).slice(0, num_results);
      }
    }

    // Fetch new results from SerpAPI
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('api_key', SERPAPI_KEY);
    url.searchParams.append('q', query);
    url.searchParams.append('engine', 'google');
    url.searchParams.append('num', num_results.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract and format the search results
    const organicResults = data.organic_results || [];
    const formattedResults = organicResults.map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: include_snippets ? result.snippet : undefined,
      source: new URL(result.link).hostname,
      date: result.date
    }));

    // Cache the results in our database for future use
    await supabase
      .from('search_cache')
      .insert({
        query: query.toLowerCase(),
        results: JSON.stringify(formattedResults),
        timestamp: new Date().toISOString()
      });

    return formattedResults.slice(0, num_results);
  } catch (error) {
    console.error('Error performing search:', error);
    
    // Return an empty array or error indication
    return [
      {
        title: 'Search Error',
        link: '',
        snippet: 'Failed to perform search. Please try again later.',
        source: 'system'
      }
    ];
  }
}

/**
 * Perform a specialized search for financial or regulatory information
 */
export async function performFinancialSearch(query: string): Promise<SearchResult[]> {
  // Add financial and regulatory sources to query
  const enhancedQuery = `${query} (site:irs.gov OR site:treasury.gov OR site:dol.gov OR site:sec.gov OR site:federalreserve.gov)`;
  
  return performSearch({
    query: enhancedQuery,
    num_results: 5,
    include_snippets: true
  });
}

/**
 * Perform a search for tax-related information
 */
export async function performTaxSearch(query: string): Promise<SearchResult[]> {
  // Add tax authority sources to query
  const enhancedQuery = `${query} (tax OR taxation OR irs OR "internal revenue") (site:irs.gov OR site:tax.gov OR site:taxfoundation.org OR site:hrblock.com OR site:turbotax.intuit.com)`;
  
  return performSearch({
    query: enhancedQuery,
    num_results: 5,
    include_snippets: true
  });
}

/**
 * Search for state-specific tax or regulatory information
 */
export async function performStateSearch(query: string, state: string): Promise<SearchResult[]> {
  // Add state-specific sources to query
  const stateCode = state.length === 2 ? state.toUpperCase() : state;
  const enhancedQuery = `${query} ${stateCode} state (tax OR regulation OR compliance) (site:${stateCode.toLowerCase()}.gov)`;
  
  return performSearch({
    query: enhancedQuery,
    num_results: 5,
    include_snippets: true
  });
}

/**
 * Extract and summarize content from a webpage
 */
export async function extractWebContent(url: string): Promise<string> {
  try {
    // Check if we have cached content for this URL
    const { data: cachedContent, error: cacheError } = await supabase
      .from('content_cache')
      .select('content, timestamp')
      .eq('url', url)
      .order('timestamp', { ascending: false })
      .limit(1);

    // If we have recent content (less than 1 day old), return it
    if (cachedContent && cachedContent.length > 0) {
      const cacheAge = Date.now() - new Date(cachedContent[0].timestamp).getTime();
      if (cacheAge < 86400000) { // 24 hours in milliseconds
        return cachedContent[0].content;
      }
    }

    // Use a webpage content extraction service
    const apiUrl = new URL('https://extractorapi.com/api/v1/extractor');
    apiUrl.searchParams.append('apikey', process.env.EXTRACTOR_API_KEY || '');
    apiUrl.searchParams.append('url', url);

    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Content extraction error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the main content
    let content = '';
    if (data.title) content += `# ${data.title}\n\n`;
    if (data.description) content += `${data.description}\n\n`;
    if (data.content) content += data.content;

    // Clean and format the content
    const cleanedContent = content
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();

    // Cache the content for future use
    if (cleanedContent) {
      await supabase
        .from('content_cache')
        .insert({
          url,
          content: cleanedContent,
          timestamp: new Date().toISOString()
        });
    }

    return cleanedContent || 'No content could be extracted from this page.';
  } catch (error) {
    console.error('Error extracting web content:', error);
    return 'Failed to extract content from this webpage.';
  }
}
