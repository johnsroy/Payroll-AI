import { BaseAgent, AgentResponse, Message } from './baseAgent';
import { anthropic } from './anthropic';
import { searchWithPerplexity } from './perplexity';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Compliance requirement definition
 */
interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  scope: string;
  requirements: string[];
  citations: string[];
  applies_to: string[];
  employee_threshold?: number;
  regions: string[];
  deadline_type: string;
  deadline_details?: any;
  reference_url?: string;
  penalties?: string;
  last_updated: string;
}

/**
 * Compliance check result
 */
interface ComplianceResult {
  id: string;
  query: string;
  result: any;
  timestamp: Date;
  confidence: number;
  user_id?: string;
  company_id?: string;
}

/**
 * Compliance Agent specializes in payroll compliance and regulations
 */
export class ComplianceAgent extends BaseAgent {
  private federalRequirements: ComplianceRequirement[] = [];
  private stateRequirements: Record<string, ComplianceRequirement[]> = {};
  private industryRequirements: Record<string, ComplianceRequirement[]> = {};
  private companyProfile: any = null;
  
  // Tool definitions
  private complianceTools = [
    {
      name: "get_compliance_requirements",
      description: "Get applicable compliance requirements for a company",
      parameters: {
        type: "object",
        properties: {
          region: {
            type: "string",
            description: "Region code (e.g., 'US', 'CA', 'NY')"
          },
          company_size: {
            type: "number",
            description: "Number of employees in the company"
          },
          industry: {
            type: "string",
            description: "Industry or business type"
          },
          requirement_type: {
            type: "string",
            enum: ["payroll", "tax", "benefits", "reporting", "all"],
            description: "Type of compliance requirements to retrieve"
          }
        },
        required: ["region"]
      }
    },
    {
      name: "check_compliance_status",
      description: "Check compliance status for specific requirements",
      parameters: {
        type: "object",
        properties: {
          requirement_ids: {
            type: "array",
            items: {
              type: "string"
            },
            description: "IDs of requirements to check"
          },
          company_id: {
            type: "string",
            description: "Company ID to check compliance for"
          }
        },
        required: ["requirement_ids"]
      }
    },
    {
      name: "get_upcoming_deadlines",
      description: "Get upcoming compliance deadlines",
      parameters: {
        type: "object",
        properties: {
          region: {
            type: "string",
            description: "Region code (e.g., 'US', 'CA', 'NY')"
          },
          period: {
            type: "string",
            enum: ["week", "month", "quarter", "year"],
            description: "Time period to look ahead"
          },
          requirement_type: {
            type: "string",
            enum: ["payroll", "tax", "benefits", "reporting", "all"],
            description: "Type of deadlines to retrieve"
          }
        },
        required: ["period"]
      }
    }
  ];
  
  constructor(config: any = {}) {
    // Define compliance tools before the super call
    const complianceTools = [
      {
        name: "get_compliance_requirements",
        description: "Get applicable compliance requirements for a company",
        parameters: {
          type: "object",
          properties: {
            region: {
              type: "string",
              description: "Region code (e.g., 'US', 'CA', 'NY')"
            },
            company_size: {
              type: "number",
              description: "Number of employees in the company"
            },
            industry: {
              type: "string",
              description: "Industry or business type"
            },
            requirement_type: {
              type: "string",
              enum: ["payroll", "tax", "benefits", "reporting", "all"],
              description: "Type of compliance requirements to retrieve"
            }
          },
          required: ["region"]
        }
      },
      {
        name: "check_compliance_status",
        description: "Check compliance status for specific requirements",
        parameters: {
          type: "object",
          properties: {
            requirement_ids: {
              type: "array",
              items: {
                type: "string"
              },
              description: "IDs of requirements to check"
            },
            company_id: {
              type: "string",
              description: "Company ID to check compliance for"
            }
          },
          required: ["requirement_ids"]
        }
      },
      {
        name: "get_upcoming_deadlines",
        description: "Get upcoming compliance deadlines",
        parameters: {
          type: "object",
          properties: {
            region: {
              type: "string",
              description: "Region code (e.g., 'US', 'CA', 'NY')"
            },
            period: {
              type: "string",
              enum: ["week", "month", "quarter", "year"],
              description: "Time period to look ahead"
            },
            requirement_type: {
              type: "string",
              enum: ["payroll", "tax", "benefits", "reporting", "all"],
              description: "Type of deadlines to retrieve"
            }
          },
          required: ["period"]
        }
      }
    ];
    
    super({
      name: config.name || "Compliance Advisor",
      systemPrompt: config.systemPrompt || 
        `You are the Compliance Advisor, specialized in payroll compliance and regulations.
        
Your capabilities include:
1. Providing information on federal, state, and local payroll regulations
2. Tracking compliance deadlines and filing requirements
3. Advising on employment laws and regulations
4. Answering questions about compliance requirements for different company sizes
5. Providing guidance on regulatory changes and updates

Always provide accurate and up-to-date compliance information. When uncertain about specific regulations, clearly indicate this and suggest where the user might find the exact information they need.

Include relevant deadlines, citations to specific regulations, and potential penalties for non-compliance when appropriate.`,
      model: config.model || 'claude-3-7-sonnet-20250219',
      temperature: config.temperature !== undefined ? config.temperature : 0.2,
      maxTokens: config.maxTokens || 1500,
      tools: config.tools || complianceTools,
      memory: config.memory !== undefined ? config.memory : true,
      conversationId: config.conversationId,
      userId: config.userId,
      companyId: config.companyId
    });
    
    // Assign the tools to the class property after super call
    this.complianceTools = complianceTools;
    
    // Initialize compliance data
    this.initializeDefaultFederalRequirements();
    this.initializeDefaultStateRequirements();
    this.initializeDefaultIndustryRequirements();
    
    // Load company profile if available
    if (this.companyId) {
      this.loadCompanyProfile(this.companyId);
    }
    
    // Load the latest compliance data from storage
    this.loadComplianceData();
  }
  
  /**
   * Process a query using the compliance agent
   */
  public async processQuery(query: string): Promise<AgentResponse> {
    try {
      // Add the user message to conversation history
      this.addMessage('user', query);
      
      // Check if we need real-time compliance information
      let searchResults = '';
      if (
        query.includes('latest') || 
        query.includes('current') || 
        query.includes('recent') || 
        query.includes('update') ||
        query.includes('new law') ||
        query.includes('deadline') ||
        query.includes('2024') ||
        query.includes('2025')
      ) {
        try {
          searchResults = await searchWithPerplexity(query);
        } catch (e) {
          console.error('Error searching for compliance information:', e);
          // Continue without search results
        }
      }
      
      // Prepare the context
      let context = '';
      if (searchResults) {
        context += `\nRecent compliance information from reliable sources:\n${searchResults}\n`;
      }
      
      // Get relevant context from knowledge base if available
      const knowledgeContext = await this.getRelevantContext(query);
      if (knowledgeContext) {
        context += `\nRelevant compliance information from our knowledge base:\n${knowledgeContext}\n`;
      }
      
      // Add company context if available
      if (this.companyProfile) {
        context += `\nCompany profile information:\n`;
        context += `Company: ${this.companyProfile.name}\n`;
        context += `Industry: ${this.companyProfile.industry}\n`;
        context += `Size: ${this.companyProfile.employee_count} employees\n`;
        context += `Locations: ${this.companyProfile.locations.join(', ')}\n`;
      }
      
      // Prepare messages for the AI
      const messages: Message[] = [
        { role: 'system', content: this.systemPrompt }
      ];
      
      // Add conversation history if using memory
      if (this.memory && this.messages.length > 1) {
        // Add relevant previous messages, skipping the system message
        messages.push(...this.messages.slice(1));
      } else {
        // Just add the current query if not using history
        messages.push({ role: 'user', content: query });
      }
      
      // If we have context, append it to the last user message
      if (context) {
        const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
        if (lastUserMessageIndex >= 0) {
          const actualIndex = messages.length - 1 - lastUserMessageIndex;
          messages[actualIndex] = {
            ...messages[actualIndex],
            content: messages[actualIndex].content + '\n\n' + context
          };
        }
      }
      
      // Call the AI
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: this.systemPrompt,
        messages: messages.map(m => {
          // Only include role and content for simplicity
          return { role: m.role as any, content: m.content };
        }),
      });
      
      // Extract the response text
      let responseText = '';
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if (typeof firstContent === 'object' && 'text' in firstContent) {
          responseText = firstContent.text;
        } else {
          responseText = String(firstContent);
        }
      }
      
      // Add the response to conversation history
      this.addMessage('assistant', responseText);
      
      // Check if the response includes tool calls (not directly supported in anthropic)
      // but we parse for compliance requests
      const toolCallResults = await this.parseAndExecuteToolCalls(responseText, query);
      
      // Save the conversation if needed
      if (this.conversationId) {
        await this.saveConversation();
      }
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(responseText, query);
      
      // Return the response
      return {
        response: this.formatResponse(responseText),
        confidence,
        metadata: {
          model: this.model,
          searchResults: searchResults ? true : false,
          toolCalls: toolCallResults.length > 0,
        },
        toolCalls: toolCallResults
      };
    } catch (error: unknown) {
      console.error('Error processing query in Compliance Agent:', 
        error instanceof Error ? error.message : String(error));
      
      // Return a graceful error response
      return {
        response: "I'm sorry, I encountered an error while processing your compliance question. Please try rephrasing your question or try again later.",
        confidence: 0.1,
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Parse the response for compliance requests and execute them
   */
  private async parseAndExecuteToolCalls(responseText: string, query: string): Promise<any[]> {
    const toolCallResults = [];
    
    // Check for compliance requirement patterns in the response or query
    const hasComplianceRequirementRequest = 
      (responseText.includes('compliance requirements') || query.includes('compliance requirements')) ||
      (responseText.includes('regulations') || query.includes('regulations'));
    
    const hasComplianceStatusRequest =
      (responseText.includes('compliance status') || query.includes('compliance status')) ||
      (responseText.includes('are we compliant') || query.includes('are we compliant'));
    
    const hasDeadlineRequest =
      (responseText.includes('deadlines') || query.includes('deadlines')) ||
      (responseText.includes('due dates') || query.includes('due dates'));
    
    // Execute appropriate tool calls
    if (hasComplianceRequirementRequest) {
      // Extract parameters from the text
      const region = this.extractRegion(responseText, query);
      const companySize = this.extractNumber(responseText, query, /(\d+)\s+employees/i) || 
                         this.extractNumber(responseText, query, /company\s+size\s+of\s+(\d+)/i);
      
      const industry = this.extractIndustry(responseText, query);
      
      const requirementType = 
        (responseText.includes('payroll requirements') || query.includes('payroll requirements')) ? 'payroll' :
        (responseText.includes('tax requirements') || query.includes('tax requirements')) ? 'tax' :
        (responseText.includes('benefit requirements') || query.includes('benefit requirements')) ? 'benefits' :
        (responseText.includes('reporting requirements') || query.includes('reporting requirements')) ? 'reporting' :
        'all'; // Default to all
      
      const params = {
        region: region || 'US',
        company_size: companySize || (this.companyProfile ? this.companyProfile.employee_count : 50),
        industry: industry || (this.companyProfile ? this.companyProfile.industry : 'general'),
        requirement_type: requirementType
      };
      
      const result = await this.getComplianceRequirements(params);
      toolCallResults.push({
        name: 'get_compliance_requirements',
        arguments: params,
        result
      });
    }
    
    if (hasComplianceStatusRequest) {
      // For this case, we would need requirement IDs, but for simplicity,
      // we'll just return the status for all federal requirements
      const requirementIds = this.federalRequirements.map(req => req.id);
      
      const params = {
        requirement_ids: requirementIds,
        company_id: this.companyId
      };
      
      const result = await this.checkComplianceStatus(params);
      toolCallResults.push({
        name: 'check_compliance_status',
        arguments: params,
        result
      });
    }
    
    if (hasDeadlineRequest) {
      // Extract parameters from the text
      const region = this.extractRegion(responseText, query);
      
      const period = 
        (responseText.includes('this week') || query.includes('this week')) ? 'week' :
        (responseText.includes('this month') || query.includes('this month')) ? 'month' :
        (responseText.includes('this quarter') || query.includes('this quarter')) ? 'quarter' :
        (responseText.includes('this year') || query.includes('this year')) ? 'year' :
        'month'; // Default to month
      
      const requirementType = 
        (responseText.includes('payroll deadlines') || query.includes('payroll deadlines')) ? 'payroll' :
        (responseText.includes('tax deadlines') || query.includes('tax deadlines')) ? 'tax' :
        (responseText.includes('benefit deadlines') || query.includes('benefit deadlines')) ? 'benefits' :
        (responseText.includes('reporting deadlines') || query.includes('reporting deadlines')) ? 'reporting' :
        'all'; // Default to all
      
      const params = {
        region: region || 'US',
        period,
        requirement_type: requirementType
      };
      
      const result = await this.getUpcomingDeadlines(params);
      toolCallResults.push({
        name: 'get_upcoming_deadlines',
        arguments: params,
        result
      });
    }
    
    return toolCallResults;
  }
  
  /**
   * Helper method to extract a number from text
   */
  private extractNumber(text1: string, text2: string, pattern: RegExp): number | null {
    const match1 = text1.match(pattern);
    if (match1 && match1[1]) {
      return parseInt(match1[1], 10);
    }
    
    const match2 = text2.match(pattern);
    if (match2 && match2[1]) {
      return parseInt(match2[1], 10);
    }
    
    return null;
  }
  
  /**
   * Extract region from text
   */
  private extractRegion(text1: string, text2: string): string | null {
    // Check for US states
    const statePattern = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/;
    const stateMatch1 = text1.match(statePattern);
    if (stateMatch1 && stateMatch1[1]) {
      return stateMatch1[1];
    }
    
    const stateMatch2 = text2.match(statePattern);
    if (stateMatch2 && stateMatch2[1]) {
      return stateMatch2[1];
    }
    
    // Check for country mentions
    if (text1.includes('United States') || text2.includes('United States') || 
        text1.includes('US') || text2.includes('US')) {
      return 'US';
    }
    
    // Default to US if no region found
    return null;
  }
  
  /**
   * Extract industry from text
   */
  private extractIndustry(text1: string, text2: string): string | null {
    const industries = [
      'healthcare', 'construction', 'manufacturing', 'retail', 'finance',
      'technology', 'hospitality', 'education', 'transportation', 'agriculture'
    ];
    
    for (const industry of industries) {
      if (text1.toLowerCase().includes(industry) || text2.toLowerCase().includes(industry)) {
        return industry;
      }
    }
    
    return null;
  }
  
  /**
   * Load compliance data from database or other sources
   */
  private async loadComplianceData(): Promise<void> {
    try {
      // Check if we have compliance data in Supabase
      const { data: federalData, error: federalError } = await supabase
        .from('compliance_requirements')
        .select('*')
        .eq('scope', 'federal');
      
      if (federalError) {
        throw federalError;
      }
      
      if (federalData && federalData.length > 0) {
        this.federalRequirements = federalData as ComplianceRequirement[];
      }
      
      // Load state requirements
      const { data: stateData, error: stateError } = await supabase
        .from('compliance_requirements')
        .select('*')
        .eq('scope', 'state');
      
      if (stateError) {
        throw stateError;
      }
      
      if (stateData && stateData.length > 0) {
        // Group by state
        for (const req of stateData as ComplianceRequirement[]) {
          for (const region of req.regions) {
            if (!this.stateRequirements[region]) {
              this.stateRequirements[region] = [];
            }
            this.stateRequirements[region].push(req);
          }
        }
      }
      
      // Load industry requirements
      const { data: industryData, error: industryError } = await supabase
        .from('compliance_requirements')
        .select('*')
        .eq('scope', 'industry');
      
      if (industryError) {
        throw industryError;
      }
      
      if (industryData && industryData.length > 0) {
        // Group by industry
        for (const req of industryData as ComplianceRequirement[]) {
          for (const industry of req.applies_to) {
            if (!this.industryRequirements[industry]) {
              this.industryRequirements[industry] = [];
            }
            this.industryRequirements[industry].push(req);
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error loading compliance data:', 
        error instanceof Error ? error.message : String(error));
      // Fallback to default data already initialized
    }
  }
  
  /**
   * Load company profile data
   */
  private async loadCompanyProfile(companyId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        this.companyProfile = data;
      }
    } catch (error: unknown) {
      console.error('Error loading company profile:', 
        error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Initialize default federal compliance requirements
   */
  private initializeDefaultFederalRequirements(): void {
    this.federalRequirements = [
      {
        id: 'flsa',
        name: 'Fair Labor Standards Act',
        description: 'Establishes minimum wage, overtime pay, recordkeeping, and youth employment standards',
        scope: 'federal',
        requirements: [
          'Pay at least federal minimum wage ($7.25/hour)',
          'Pay overtime (1.5x regular rate) for hours worked over 40 in a workweek',
          'Maintain accurate records of employee hours and wages',
          'Follow restrictions on employment of minors'
        ],
        citations: ['29 U.S.C. § 201 et seq.'],
        applies_to: ['all businesses'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'continuous',
          description: 'Ongoing compliance required'
        },
        reference_url: 'https://www.dol.gov/agencies/whd/flsa',
        penalties: 'Up to $1,000 per violation; willful violations may result in criminal prosecution',
        last_updated: '2023-01-01'
      },
      {
        id: 'fmla',
        name: 'Family and Medical Leave Act',
        description: 'Provides eligible employees with unpaid, job-protected leave for family and medical reasons',
        scope: 'federal',
        requirements: [
          'Provide up to 12 weeks of unpaid leave for qualifying reasons',
          'Maintain employee health benefits during leave',
          'Restore employee to same or equivalent position after leave',
          'Post FMLA notice in workplace'
        ],
        citations: ['29 U.S.C. § 2601 et seq.'],
        applies_to: ['employers with 50+ employees'],
        employee_threshold: 50,
        regions: ['US'],
        deadline_type: 'relative',
        deadline_details: {
          event: 'employee request',
          timeframe: '30 days',
          description: 'Respond to employee FMLA requests within 5 business days'
        },
        reference_url: 'https://www.dol.gov/agencies/whd/fmla',
        penalties: 'Lost wages, benefits, other compensation, plus employment, reinstatement, promotion, and attorney\'s fees',
        last_updated: '2023-01-01'
      },
      {
        id: 'ada',
        name: 'Americans with Disabilities Act',
        description: 'Prohibits discrimination against individuals with disabilities in employment',
        scope: 'federal',
        requirements: [
          'Make reasonable accommodations for qualified individuals with disabilities',
          'Do not discriminate in hiring, promoting, or providing benefits',
          'Maintain accessibility in workplace facilities',
          'Keep medical information confidential'
        ],
        citations: ['42 U.S.C. § 12101 et seq.'],
        applies_to: ['employers with 15+ employees'],
        employee_threshold: 15,
        regions: ['US'],
        deadline_type: 'relative',
        deadline_details: {
          event: 'accommodation request',
          description: 'Respond to accommodation requests promptly'
        },
        reference_url: 'https://www.eeoc.gov/laws/guidance/ada-your-responsibilities-employer',
        penalties: 'Compensatory and punitive damages up to $300,000 (based on employer size)',
        last_updated: '2023-01-01'
      },
      {
        id: 'form941',
        name: 'Form 941 - Employer\'s Quarterly Federal Tax Return',
        description: 'Quarterly tax form to report wages, tips, federal income tax withheld, and Social Security and Medicare taxes',
        scope: 'federal',
        requirements: [
          'File Form 941 quarterly',
          'Report all wages, tips, and other compensation paid',
          'Calculate and report federal income tax withheld',
          'Calculate and report Social Security and Medicare taxes'
        ],
        citations: ['26 U.S.C. § 6011'],
        applies_to: ['all employers'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'quarterly',
          dates: ['April 30', 'July 31', 'October 31', 'January 31'],
          description: 'Due the last day of the month following the end of the quarter'
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-941',
        penalties: 'Up to 15% of unpaid tax depending on filing delay',
        last_updated: '2024-01-01'
      },
      {
        id: 'form940',
        name: 'Form 940 - Employer\'s Annual Federal Unemployment Tax Return',
        description: 'Annual tax form to report and pay federal unemployment (FUTA) tax',
        scope: 'federal',
        requirements: [
          'File Form 940 annually',
          'Report all wages subject to FUTA tax',
          'Calculate and pay FUTA tax'
        ],
        citations: ['26 U.S.C. § 3301 et seq.'],
        applies_to: ['employers who paid wages of $1,500+ in any quarter or had one or more employees for some part of a day in any 20 or more different weeks'],
        regions: ['US'],
        deadline_type: 'fixed',
        deadline_details: {
          date: 'January 31',
          description: 'Due January 31 following the end of the calendar year'
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-940',
        penalties: 'Up to 15% of unpaid tax depending on filing delay',
        last_updated: '2024-01-01'
      }
    ];
  }
  
  /**
   * Initialize default state compliance requirements
   */
  private initializeDefaultStateRequirements(): void {
    // Create sample requirements for California
    const californiaRequirements = [
      {
        id: 'ca_minwage',
        name: 'California Minimum Wage',
        description: 'California state minimum wage requirements',
        scope: 'state',
        requirements: [
          'Pay at least $16.00/hour for all employers effective January 1, 2024'
        ],
        citations: ['CA Labor Code § 1182.12'],
        applies_to: ['all employers'],
        regions: ['CA'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'continuous',
          description: 'Ongoing compliance required'
        },
        reference_url: 'https://www.dir.ca.gov/dlse/faq_minimumwage.htm',
        penalties: 'Unpaid wages, penalties of $100-$250 per violation, plus potential liquidated damages',
        last_updated: '2024-01-01'
      },
      {
        id: 'ca_paystubs',
        name: 'California Pay Stub Requirements',
        description: 'Detailed requirements for information that must be included on employee pay stubs',
        scope: 'state',
        requirements: [
          'Include gross wages earned',
          'Include total hours worked (for non-exempt employees)',
          'Include all deductions',
          'Include net wages earned',
          'Include inclusive dates of the pay period',
          'Include employee name and last 4 digits of SSN/Employee ID',
          'Include employer name and address'
        ],
        citations: ['CA Labor Code § 226'],
        applies_to: ['all employers'],
        regions: ['CA'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'each pay period',
          description: 'Must provide with each wage payment'
        },
        reference_url: 'https://www.dir.ca.gov/dlse/FAQs-Deductions.html',
        penalties: '$50 for first violation, $100 per subsequent violation, up to $4,000 total',
        last_updated: '2023-01-01'
      }
    ];
    
    // Create sample requirements for New York
    const newYorkRequirements = [
      {
        id: 'ny_minwage',
        name: 'New York Minimum Wage',
        description: 'New York state minimum wage requirements',
        scope: 'state',
        requirements: [
          'Pay at least $16.00/hour in New York City, Long Island, and Westchester County',
          'Pay at least $15.00/hour in the remainder of the state'
        ],
        citations: ['NY Labor Law § 652'],
        applies_to: ['all employers'],
        regions: ['NY'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'continuous',
          description: 'Ongoing compliance required'
        },
        reference_url: 'https://dol.ny.gov/minimum-wage-0',
        penalties: 'Unpaid wages, 100% liquidated damages, interest, and attorney\'s fees',
        last_updated: '2024-01-01'
      },
      {
        id: 'ny_paidleave',
        name: 'New York Paid Family Leave',
        description: 'Provides paid time off for bonding with a new child, caring for a family member, or assisting when a family member is deployed abroad on active military service',
        scope: 'state',
        requirements: [
          'Provide up to 12 weeks of paid family leave',
          'Collect employee contributions through payroll deductions',
          'Display or post a notice about paid family leave',
          'Include information about paid family leave in employee handbooks'
        ],
        citations: ['NY Workers Compensation Law § 200 et seq.'],
        applies_to: ['all private employers'],
        regions: ['NY'],
        deadline_type: 'relative',
        deadline_details: {
          event: 'employee request',
          timeframe: '30 days',
          description: 'Process employee leave requests within applicable timeframes'
        },
        reference_url: 'https://paidfamilyleave.ny.gov/employers',
        penalties: 'Up to 0.5% of weekly payroll for the period of non-compliance plus additional penalties',
        last_updated: '2023-01-01'
      }
    ];
    
    // Initialize the state requirements map
    this.stateRequirements = {
      'CA': californiaRequirements,
      'NY': newYorkRequirements
    };
  }
  
  /**
   * Initialize default industry-specific compliance requirements
   */
  private initializeDefaultIndustryRequirements(): void {
    // Healthcare industry requirements
    const healthcareRequirements = [
      {
        id: 'hipaa',
        name: 'Health Insurance Portability and Accountability Act (HIPAA)',
        description: 'Provides data privacy and security provisions for safeguarding medical information',
        scope: 'industry',
        requirements: [
          'Implement safeguards to protect patient health information',
          'Restrict disclosure of protected health information',
          'Provide individuals with access to their health information',
          'Train employees on HIPAA requirements'
        ],
        citations: ['42 U.S.C. § 1320d et seq.'],
        applies_to: ['healthcare', 'health insurance'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'continuous',
          description: 'Ongoing compliance required; employee training typically annual'
        },
        reference_url: 'https://www.hhs.gov/hipaa/index.html',
        penalties: 'Varies from $100 to $50,000 per violation with annual maximum of $1.5 million',
        last_updated: '2023-01-01'
      }
    ];
    
    // Construction industry requirements
    const constructionRequirements = [
      {
        id: 'osha_construction',
        name: 'OSHA Construction Safety Standards',
        description: 'Safety standards specific to the construction industry',
        scope: 'industry',
        requirements: [
          'Provide fall protection for employees working at heights of 6 feet or more',
          'Ensure proper scaffolding safety',
          'Implement proper trenching and excavation safety measures',
          'Provide appropriate personal protective equipment (PPE)',
          'Maintain OSHA 300 logs of work-related injuries and illnesses'
        ],
        citations: ['29 CFR Part 1926'],
        applies_to: ['construction'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'continuous',
          description: 'Ongoing compliance required; OSHA Form 300A must be posted from February 1 to April 30 each year'
        },
        reference_url: 'https://www.osha.gov/construction',
        penalties: 'Up to $14,502 per violation for serious violations; up to $145,027 for willful or repeated violations',
        last_updated: '2024-01-01'
      }
    ];
    
    // Initialize the industry requirements map
    this.industryRequirements = {
      'healthcare': healthcareRequirements,
      'construction': constructionRequirements
    };
  }
  
  /**
   * Get compliance requirements based on parameters
   */
  private async getComplianceRequirements(params: any): Promise<any> {
    const { region, company_size, industry, requirement_type } = params;
    
    const result: any = {
      timestamp: new Date().toISOString(),
      params: params,
      requirements: []
    };
    
    // Get federal requirements
    const federalReqs = this.federalRequirements.filter(req => {
      // Filter by employee threshold if applicable
      if (req.employee_threshold && company_size < req.employee_threshold) {
        return false;
      }
      
      // Filter by requirement type if specified
      if (requirement_type !== 'all') {
        const reqType = req.name.toLowerCase();
        if (requirement_type === 'payroll' && !reqType.includes('pay') && !reqType.includes('wage') && !reqType.includes('tax')) {
          return false;
        }
        if (requirement_type === 'tax' && !reqType.includes('tax') && !reqType.includes('form')) {
          return false;
        }
        if (requirement_type === 'benefits' && !reqType.includes('leave') && !reqType.includes('benefit')) {
          return false;
        }
        if (requirement_type === 'reporting' && !reqType.includes('report') && !reqType.includes('form')) {
          return false;
        }
      }
      
      return true;
    });
    
    // Get state requirements if applicable
    let stateReqs: ComplianceRequirement[] = [];
    if (region && region.length === 2 && this.stateRequirements[region]) {
      stateReqs = this.stateRequirements[region].filter(req => {
        // Filter by requirement type if specified
        if (requirement_type !== 'all') {
          const reqType = req.name.toLowerCase();
          if (requirement_type === 'payroll' && !reqType.includes('pay') && !reqType.includes('wage')) {
            return false;
          }
          if (requirement_type === 'tax' && !reqType.includes('tax')) {
            return false;
          }
          if (requirement_type === 'benefits' && !reqType.includes('leave') && !reqType.includes('benefit')) {
            return false;
          }
          if (requirement_type === 'reporting' && !reqType.includes('report') && !reqType.includes('form')) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    // Get industry requirements if applicable
    let industryReqs: ComplianceRequirement[] = [];
    if (industry && this.industryRequirements[industry]) {
      industryReqs = this.industryRequirements[industry];
    }
    
    // Combine all requirements
    result.requirements = [...federalReqs, ...stateReqs, ...industryReqs];
    
    // Create a compliance check result for storage if we have a user ID
    if (this.userId) {
      const complianceResult: ComplianceResult = {
        id: uuidv4(),
        query: `Get compliance requirements for region ${region}, company size ${company_size}, industry ${industry}`,
        result: result,
        timestamp: new Date(),
        confidence: 0.9,
        user_id: this.userId,
        company_id: this.companyId
      };
      
      try {
        await supabase
          .from('compliance_results')
          .insert(complianceResult);
      } catch (error) {
        console.error('Error saving compliance result:', error);
      }
    }
    
    return result;
  }
  
  /**
   * Check compliance status for specific requirements
   */
  private async checkComplianceStatus(params: any): Promise<any> {
    const { requirement_ids, company_id } = params;
    
    // In a real implementation, this would check actual company compliance records
    // For this demo, we'll just return some sample statuses
    
    const result: any = {
      timestamp: new Date().toISOString(),
      params: params,
      statuses: []
    };
    
    // Get the requirements to check
    const requirementsToCheck = requirement_ids.map((id: string) => {
      // Check in federal requirements first
      const fedReq = this.federalRequirements.find(req => req.id === id);
      if (fedReq) return fedReq;
      
      // Check in state requirements
      for (const state in this.stateRequirements) {
        const stateReq = this.stateRequirements[state].find(req => req.id === id);
        if (stateReq) return stateReq;
      }
      
      // Check in industry requirements
      for (const industry in this.industryRequirements) {
        const industryReq = this.industryRequirements[industry].find(req => req.id === id);
        if (industryReq) return industryReq;
      }
      
      return null;
    }).filter((req: ComplianceRequirement | null) => req !== null);
    
    // Generate statuses for each requirement
    for (const req of requirementsToCheck) {
      if (!req) continue;
      
      // In a real implementation, you would check actual compliance status
      // For demo purposes, we'll randomize the status
      const random = Math.random();
      const status = random > 0.8 ? 'non_compliant' : 
                   random > 0.6 ? 'partially_compliant' : 'compliant';
      
      const nextDueDate = this.calculateNextDeadline(req);
      
      result.statuses.push({
        requirement_id: req.id,
        requirement_name: req.name,
        status: status,
        last_checked: new Date().toISOString(),
        next_due_date: nextDueDate,
        issues: status !== 'compliant' ? [
          'Sample compliance issue for demonstration purposes'
        ] : [],
        recommendations: status !== 'compliant' ? [
          'Sample recommendation for demonstration purposes'
        ] : []
      });
    }
    
    return result;
  }
  
  /**
   * Get upcoming compliance deadlines
   */
  private async getUpcomingDeadlines(params: any): Promise<any> {
    const { region, period, requirement_type } = params;
    
    // Calculate date range based on period
    const now = new Date();
    const endDate = new Date();
    switch (period) {
      case 'week':
        endDate.setDate(now.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(now.getMonth() + 1);
        break;
      case 'quarter':
        endDate.setMonth(now.getMonth() + 3);
        break;
      case 'year':
        endDate.setFullYear(now.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(now.getMonth() + 1); // Default to month
    }
    
    const result: any = {
      timestamp: new Date().toISOString(),
      params: params,
      period_start: now.toISOString(),
      period_end: endDate.toISOString(),
      deadlines: []
    };
    
    // Get all applicable requirements
    const allRequirements: ComplianceRequirement[] = [
      ...this.federalRequirements
    ];
    
    // Add state requirements if specified
    if (region && region.length === 2 && this.stateRequirements[region]) {
      allRequirements.push(...this.stateRequirements[region]);
    }
    
    // Filter requirements by type if specified
    const filteredRequirements = requirement_type === 'all' ? 
      allRequirements : 
      allRequirements.filter(req => {
        const reqName = req.name.toLowerCase();
        if (requirement_type === 'payroll' && (reqName.includes('pay') || reqName.includes('wage'))) {
          return true;
        }
        if (requirement_type === 'tax' && (reqName.includes('tax') || reqName.includes('form'))) {
          return true;
        }
        if (requirement_type === 'benefits' && (reqName.includes('leave') || reqName.includes('benefit'))) {
          return true;
        }
        if (requirement_type === 'reporting' && (reqName.includes('report') || reqName.includes('form'))) {
          return true;
        }
        return false;
      });
    
    // For each requirement, calculate next deadline
    for (const req of filteredRequirements) {
      const nextDeadline = this.calculateNextDeadline(req);
      if (!nextDeadline) continue;
      
      // Parse the deadline date
      const deadlineDate = new Date(nextDeadline);
      
      // Check if deadline is within the specified period
      if (deadlineDate >= now && deadlineDate <= endDate) {
        result.deadlines.push({
          requirement_id: req.id,
          requirement_name: req.name,
          deadline: nextDeadline,
          description: req.deadline_details?.description || 'Compliance deadline',
          scope: req.scope
        });
      }
    }
    
    // Sort deadlines by date
    result.deadlines.sort((a: any, b: any) => {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
    
    return result;
  }
  
  /**
   * Calculate the next deadline for a requirement
   */
  private calculateNextDeadline(requirement: ComplianceRequirement & { deadline_details?: any }): string | null {
    if (!requirement.deadline_type || !requirement.deadline_details) {
      return null;
    }
    
    const now = new Date();
    
    switch (requirement.deadline_type) {
      case 'fixed':
        // Fixed annual date like "January 31"
        if (requirement.deadline_details.date) {
          const dateStr = requirement.deadline_details.date;
          const [month, day] = dateStr.split(' ');
          const monthIndex = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ].indexOf(month);
          
          if (monthIndex >= 0) {
            const year = now.getFullYear();
            const deadlineDate = new Date(year, monthIndex, parseInt(day, 10));
            
            // If the deadline already passed this year, use next year
            if (deadlineDate < now) {
              deadlineDate.setFullYear(year + 1);
            }
            
            return deadlineDate.toISOString();
          }
        }
        break;
        
      case 'recurring':
        // Recurring deadlines like quarterly filings
        if (requirement.deadline_details.frequency === 'quarterly' && 
            requirement.deadline_details.dates) {
          const dates = requirement.deadline_details.dates as string[];
          let nextDeadline: Date | null = null;
          
          for (const dateStr of dates) {
            const [month, day] = dateStr.split(' ');
            const monthIndex = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].indexOf(month);
            
            if (monthIndex >= 0) {
              const year = now.getFullYear();
              let deadlineDate = new Date(year, monthIndex, parseInt(day, 10));
              
              // If the deadline already passed this year, use next year
              if (deadlineDate < now) {
                deadlineDate.setFullYear(year + 1);
              }
              
              // Track the earliest upcoming deadline
              if (!nextDeadline || deadlineDate < nextDeadline) {
                nextDeadline = deadlineDate;
              }
            }
          }
          
          if (nextDeadline) {
            return nextDeadline.toISOString();
          }
        }
        break;
    }
    
    return null;
  }
  
  /**
   * Get relevant context for a compliance query from the knowledge base
   */
  protected async getRelevantContext(query: string): Promise<string | null> {
    try {
      // Get relevant knowledge base entries
      const complianceInfoEntries = await supabase.rpc('match_documents', {
        query_embedding: [0.1], // Placeholder, will be replaced by embedding model
        match_threshold: 0.7,
        match_count: 3,
        collection_name: 'compliance_information'
      });
      
      if (complianceInfoEntries && complianceInfoEntries.data && Array.isArray(complianceInfoEntries.data) && complianceInfoEntries.data.length > 0) {
        return complianceInfoEntries.data
          .map((entry: any) => `${entry.title || 'Compliance Information'}: ${entry.content}`)
          .join('\n\n');
      }
      
      return null;
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return null;
    }
  }
}