import { BaseAgent, AgentConfig } from './baseAgent';
import { performSearch, performFinancialSearch, extractWebContent } from './searchTool';
import { searchKnowledgeBase } from './vectorUtils';
import { supabase } from './supabase';

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
  constructor(config: AgentConfig) {
    // Define comprehensive system prompt for research agent
    const researchSystemPrompt = `You are a specialized research assistant for payroll, tax, and financial information.

Your primary responsibilities include:
1. Gathering information from multiple sources on complex payroll, tax, and financial topics
2. Analyzing and synthesizing information to provide comprehensive answers
3. Identifying the most relevant and authoritative sources
4. Providing accurate summaries with proper source attribution
5. Highlighting key points and actionable insights

When conducting research:
- Prioritize authoritative sources (e.g., IRS.gov, official state tax sites, reputable financial institutions)
- Consider the recency of information, especially for tax rates and regulations
- Compare multiple sources to verify accuracy
- Note any discrepancies or contradictions between sources
- Distinguish between facts, expert opinions, and general advice
- Identify jurisdiction-specific information (federal vs. state regulations)

When presenting research findings:
- Organize information logically and hierarchically
- Provide clear summaries with specific, actionable information
- Include direct source references for key claims
- Indicate confidence levels when information is ambiguous or conflicting
- Highlight time-sensitive information (deadlines, expiration dates)

Always maintain objectivity in your research and acknowledge limitations in available information.`;

    // Initialize the agent with research-specific configuration
    super({
      ...config,
      systemPrompt: researchSystemPrompt,
      temperature: 0.3, // Moderate temperature for balanced research synthesis
    });
  }

  /**
   * Conduct research on a specific topic
   */
  async conductResearch(
    topic: string,
    options: ResearchOptions = {}
  ): Promise<ResearchResult> {
    // Default options
    const useInternet = options.use_internet !== false;
    const useKnowledgeBase = options.use_knowledge_base !== false;
    const maxSources = options.max_sources || 5;
    const includeContent = options.include_content !== false;

    // Store all sources found
    const sources: ResearchResult['sources'] = [];

    // Step 1: Search knowledge base if enabled
    if (useKnowledgeBase) {
      const knowledgeResults = await searchKnowledgeBase(topic);
      
      for (const result of knowledgeResults.slice(0, maxSources)) {
        sources.push({
          title: result.category || 'Knowledge Base Entry',
          content: includeContent ? result.content : result.content.substring(0, 100) + '...',
          relevance: result.similarity || 0.5,
          source_type: 'knowledge_base'
        });
      }
    }

    // Step 2: Search internet if enabled and if we need more sources
    if (useInternet && sources.length < maxSources) {
      // Determine if this is a financial/tax query
      const isFinancialQuery = /tax|payroll|compliance|regulation|irs|finance|accounting|salary/i.test(topic);
      
      // Use specialized search for financial topics
      const searchResults = isFinancialQuery
        ? await performFinancialSearch(topic)
        : await performSearch({ query: topic });
      
      const remainingSources = maxSources - sources.length;
      
      for (const result of searchResults.slice(0, remainingSources)) {
        // For the most relevant result, extract detailed content
        let content = result.snippet || 'No content available';
        
        if (includeContent && sources.length === 0 && result.link) {
          try {
            const extractedContent = await extractWebContent(result.link);
            if (extractedContent && extractedContent.length > 0) {
              content = extractedContent;
            }
          } catch (error) {
            console.error('Error extracting content:', error);
          }
        }
        
        sources.push({
          title: result.title,
          content,
          url: result.link,
          relevance: 0.8, // Arbitrary relevance score
          source_type: 'internet'
        });
      }
    }

    // Step 3: Search company database for internal documents
    try {
      const { data, error } = await supabase
        .from('company_documents')
        .select('id, title, content, created_at')
        .textSearch('content', topic.split(' ').join(' & '))
        .limit(2);
      
      if (!error && data && data.length > 0) {
        for (const doc of data) {
          sources.push({
            title: doc.title,
            content: includeContent ? doc.content : doc.content.substring(0, 100) + '...',
            relevance: 0.7, // Arbitrary relevance score
            source_type: 'database'
          });
        }
      }
    } catch (error) {
      console.error('Error searching company documents:', error);
    }

    // Step 4: Synthesize the research
    const researchSummary = await this.synthesizeResearch(topic, sources);

    return {
      query: topic,
      sources,
      summary: researchSummary.summary,
      key_points: researchSummary.keyPoints
    };
  }

  /**
   * Synthesize research findings into a coherent summary
   */
  private async synthesizeResearch(
    topic: string,
    sources: ResearchResult['sources']
  ): Promise<{ summary: string; keyPoints: string[] }> {
    if (sources.length === 0) {
      return {
        summary: `No information found on the topic: ${topic}`,
        keyPoints: ['No relevant sources were found for this topic.']
      };
    }

    // Construct a prompt with the source information
    const sourcesText = sources
      .map((source, index) => {
        return `SOURCE ${index + 1}: ${source.title}\n${source.content}\n${
          source.url ? `URL: ${source.url}` : ''
        }`;
      })
      .join('\n\n');

    const prompt = `RESEARCH TOPIC: ${topic}\n\nSOURCES:\n${sourcesText}\n\nBased on these sources, provide:
1. A comprehensive summary of the information (500-800 words)
2. A bullet-point list of key takeaways (5-8 points)

Begin with the summary, then list the key points under a "KEY POINTS:" heading.`;

    // Get synthesis from LLM
    const response = await this.sendMessage(prompt);

    // Extract summary and key points
    const keyPointsMatch = response.match(/KEY POINTS:(.+)$/si);
    
    let summary = response;
    let keyPointsText = '';
    
    if (keyPointsMatch && keyPointsMatch[1]) {
      keyPointsText = keyPointsMatch[1].trim();
      summary = response.replace(/KEY POINTS:.+$/si, '').trim();
    }

    // Parse key points into an array
    const keyPoints = keyPointsText
      .split(/\n+/)
      .map(point => point.replace(/^[-•*]\s*/, '').trim())
      .filter(point => point.length > 0);

    return {
      summary,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['No specific key points identified.']
    };
  }

  /**
   * Track latest updates on a specific tax or regulatory topic
   */
  async trackUpdates(topic: string): Promise<{
    recent_updates: Array<{
      date: string;
      title: string;
      summary: string;
      source: string;
      url?: string;
    }>;
    has_significant_changes: boolean;
  }> {
    // Construct a specialized search query focused on recent updates
    const searchQuery = `recent changes updates ${topic} ${new Date().getFullYear()}`;
    
    // Search for recent updates
    const searchResults = await performFinancialSearch(searchQuery);
    
    if (searchResults.length === 0) {
      return {
        recent_updates: [],
        has_significant_changes: false
      };
    }
    
    // Process each result to extract dates and summaries
    const updates = [];
    let hasSignificantChanges = false;
    
    for (const result of searchResults.slice(0, 3)) {
      // Extract date from title or snippet (simplified approach)
      const dateMatch = (result.title + ' ' + (result.snippet || '')).match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|\w+ \d{1,2},? \d{4})/);
      let date = dateMatch ? dateMatch[1] : 'Recent';
      
      // Standardize date format
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      } catch (e) {
        // Keep original format if parsing fails
      }
      
      // Check if this update mentions significant changes
      const significantTerms = ['major', 'significant', 'important', 'critical', 'substantial', 'key change'];
      const contentText = (result.title + ' ' + (result.snippet || '')).toLowerCase();
      
      const isSignificant = significantTerms.some(term => contentText.includes(term));
      if (isSignificant) {
        hasSignificantChanges = true;
      }
      
      updates.push({
        date,
        title: result.title,
        summary: result.snippet || 'No summary available',
        source: result.source,
        url: result.link
      });
    }
    
    return {
      recent_updates: updates,
      has_significant_changes: hasSignificantChanges
    };
  }

  /**
   * Compare multiple sources on a specific topic to identify discrepancies
   */
  async compareSourcesForDiscrepancies(
    topic: string
  ): Promise<{
    agreements: string[];
    discrepancies: Array<{
      point: string;
      different_views: Array<{
        source: string;
        view: string;
      }>;
      recommended_interpretation: string;
    }>;
  }> {
    // Get information from multiple sources
    const searchResults = await performSearch({
      query: topic,
      num_results: 5
    });
    
    if (searchResults.length < 2) {
      return {
        agreements: ['Insufficient sources to compare views.'],
        discrepancies: []
      };
    }
    
    // Extract content from the sources
    const sourcesWithContent = [];
    
    for (const result of searchResults.slice(0, 3)) {
      if (result.link) {
        try {
          const content = await extractWebContent(result.link);
          if (content && content.length > 0) {
            sourcesWithContent.push({
              source: result.source,
              url: result.link,
              content
            });
          }
        } catch (error) {
          console.error('Error extracting content:', error);
        }
      }
    }
    
    // If we couldn't get detailed content, use the snippets
    if (sourcesWithContent.length < 2) {
      for (const result of searchResults) {
        if (result.snippet) {
          sourcesWithContent.push({
            source: result.source,
            url: result.link,
            content: result.snippet
          });
        }
      }
    }
    
    if (sourcesWithContent.length < 2) {
      return {
        agreements: ['Insufficient content available to compare views.'],
        discrepancies: []
      };
    }
    
    // Analyze the sources for agreements and discrepancies
    const sourcesText = sourcesWithContent
      .map((source, index) => {
        return `SOURCE ${index + 1} (${source.source}): ${source.content.substring(0, 1500)}`;
      })
      .join('\n\n');
    
    const analysisPrompt = `TOPIC: ${topic}\n\nSOURCES:\n${sourcesText}\n\nAnalyze these sources and identify:
1. Points of agreement between the sources
2. Discrepancies or contradictions between the sources

For each discrepancy, show the different views and provide a recommended interpretation based on source reliability and consistency with other information.

Format your response as follows:
AGREEMENTS:
- Agreement point 1
- Agreement point 2
...

DISCREPANCIES:
1. [Discrepancy point]
   - Source A view: [description]
   - Source B view: [description]
   Recommended interpretation: [analysis]
2. [Next discrepancy]
...`;

    // Get analysis from LLM
    const response = await this.sendMessage(analysisPrompt);
    
    // Parse the response 
    const agreementsMatch = response.match(/AGREEMENTS:(.+?)(?=DISCREPANCIES:|$)/s);
    const discrepanciesMatch = response.match(/DISCREPANCIES:(.+)$/s);
    
    // Extract agreements
    const agreements = agreementsMatch && agreementsMatch[1]
      ? agreementsMatch[1].split('\n')
          .map(line => line.replace(/^[\s-•*]+/, '').trim())
          .filter(line => line.length > 0)
      : ['No clear agreements identified.'];
    
    // Extract discrepancies (simplified parsing)
    const discrepancies = [];
    
    if (discrepanciesMatch && discrepanciesMatch[1]) {
      const discrepanciesText = discrepanciesMatch[1].trim();
      const discrepancyBlocks = discrepanciesText.split(/\d+\.\s+/).filter(block => block.trim().length > 0);
      
      for (const block of discrepancyBlocks) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length > 0) {
          const point = lines[0];
          const viewLines = lines.filter(line => line.includes('view:'));
          const recommendedLine = lines.find(line => line.includes('Recommended interpretation:'));
          
          const different_views = viewLines.map(line => {
            const [sourcePart, viewPart] = line.split('view:');
            return {
              source: sourcePart.replace(/-\s+/, '').trim(),
              view: viewPart ? viewPart.trim() : 'No clear view stated.'
            };
          });
          
          const recommended_interpretation = recommendedLine 
            ? recommendedLine.replace('Recommended interpretation:', '').trim()
            : 'No clear recommendation provided.';
          
          discrepancies.push({
            point,
            different_views,
            recommended_interpretation
          });
        }
      }
    }
    
    return {
      agreements,
      discrepancies: discrepancies.length > 0 ? discrepancies : []
    };
  }
}