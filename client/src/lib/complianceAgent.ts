import { BaseAgent, AgentConfig } from './baseAgent';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';

interface Regulation {
  id: string;
  name: string;
  description: string;
  scope: string;
  requirements: string[];
  citations: string[];
  lastUpdated: string;
}

interface ComplianceResult {
  id: string;
  query: string;
  result: any;
  timestamp: Date;
  confidence: number;
}

export class ComplianceAgent extends BaseAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;
  private model: string = 'claude-3-sonnet-20240229';
  private temperature: number = 0.2;
  private regulations: Map<string, Regulation> = new Map();
  private complianceResults: ComplianceResult[] = [];
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Initialize Anthropic client with API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for ComplianceAgent');
    }
    
    this.anthropic = new Anthropic({
      apiKey
    });
    
    // Set up system prompt for compliance agent
    this.systemPrompt = `You are an advanced compliance agent in a multi-agent system for payroll management.
Your primary responsibilities are:

1. Monitor and interpret regulatory requirements for payroll and HR operations
2. Provide guidance on compliance with federal, state, and local laws
3. Advise on documentation requirements and record-keeping practices
4. Alert about upcoming regulatory changes and deadlines
5. Assess compliance risks and recommend mitigation strategies

You specialize in:
- Fair Labor Standards Act (FLSA) requirements
- Employment verification and I-9 compliance
- Equal Employment Opportunity (EEO) regulations
- State-specific employment laws and reporting requirements
- Employee classification (W-2 vs. 1099) compliance
- Leave policies (FMLA, PTO, sick leave) requirements

When responding, always:
- Cite specific laws, regulations, or guidance documents
- Indicate jurisdictional considerations (federal, state, local)
- Note the effective dates of regulations or requirements
- Highlight potential compliance risks or gray areas
- Suggest practical compliance steps or best practices`;

    // Initialize regulations database
    this.initializeRegulations();
  }

  /**
   * Reset the agent state
   */
  public reset(): void {
    this.complianceResults = [];
    this.initializeRegulations();
  }

  /**
   * Process a query using the compliance agent
   */
  public async processQuery(query: string): Promise<{ response: string; confidence: number; metadata?: any }> {
    // Identify relevant regulations for the query
    const relevantRegulations = this.identifyRelevantRegulations(query);
    
    // Create a compliance prompt based on the query and relevant regulations
    const compliancePrompt = this.createCompliancePrompt(query, relevantRegulations);
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: compliancePrompt
        }
      ]
    });
    
    // Extract response
    const content = response.content[0];
    const assistantMessage = typeof content === 'object' && 'text' in content 
      ? content.text 
      : JSON.stringify(content);
    
    // Store compliance result
    const complianceResult = this.createComplianceResult(query, assistantMessage);
    this.storeComplianceResult(complianceResult);
    
    return {
      response: assistantMessage,
      confidence: complianceResult.confidence,
      metadata: {
        regulationIds: relevantRegulations.map(reg => reg.id),
        resultId: complianceResult.id
      }
    };
  }

  /**
   * Initialize regulations database with current information
   */
  private initializeRegulations(): void {
    // FLSA regulations
    const flsaRegulation: Regulation = {
      id: 'flsa',
      name: 'Fair Labor Standards Act',
      description: 'Federal law that establishes minimum wage, overtime pay, recordkeeping, and youth employment standards',
      scope: 'Federal, applies to employees of enterprises with annual sales of $500,000+ or engaged in interstate commerce',
      requirements: [
        'Minimum wage of $7.25 per hour (federal)',
        'Overtime pay at 1.5x regular rate for hours worked over 40 in a workweek',
        'Recordkeeping of employee wages, hours, and other conditions of employment',
        'Restrictions on employment of minors under 18 in certain occupations'
      ],
      citations: [
        '29 U.S.C. §§ 201-219',
        '29 C.F.R. §§ 510-794'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // FMLA regulations
    const fmlaRegulation: Regulation = {
      id: 'fmla',
      name: 'Family and Medical Leave Act',
      description: 'Federal law that provides eligible employees with unpaid, job-protected leave for family and medical reasons',
      scope: 'Federal, applies to employers with 50+ employees within 75 miles',
      requirements: [
        'Up to 12 workweeks of unpaid leave in a 12-month period for qualifying conditions',
        'Continuation of group health insurance coverage during leave',
        'Restoration to same or equivalent position upon return from leave',
        'Employers must provide notice of FMLA rights and maintain relevant records'
      ],
      citations: [
        '29 U.S.C. §§ 2601-2654',
        '29 C.F.R. §§ 825.100-825.803'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // ADA regulations
    const adaRegulation: Regulation = {
      id: 'ada',
      name: 'Americans with Disabilities Act',
      description: 'Federal law that prohibits discrimination against individuals with disabilities in employment and other contexts',
      scope: 'Federal, applies to employers with 15+ employees',
      requirements: [
        'Prohibition of discrimination on the basis of disability in all employment practices',
        'Requirement to provide reasonable accommodations to qualified individuals with disabilities',
        'Medical information must be kept confidential and in separate files',
        'Job descriptions should identify essential functions of positions'
      ],
      citations: [
        '42 U.S.C. §§ 12101-12213',
        '29 C.F.R. §§ 1630.1-1630.16'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // Title VII regulations
    const titleViiRegulation: Regulation = {
      id: 'title_vii',
      name: 'Title VII of the Civil Rights Act of 1964',
      description: 'Federal law that prohibits employment discrimination based on race, color, religion, sex, and national origin',
      scope: 'Federal, applies to employers with 15+ employees',
      requirements: [
        'Prohibition of discrimination in hiring, firing, compensation, classification, promotion, training, and other terms of employment',
        'Prohibition of harassing conduct based on protected characteristics',
        'Employers must post notices of rights under Title VII',
        'Employers must maintain relevant employment records'
      ],
      citations: [
        '42 U.S.C. §§ 2000e-2000e-17',
        '29 C.F.R. §§ 1600-1616'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // EEOC regulations
    const eeocRegulation: Regulation = {
      id: 'eeoc',
      name: 'Equal Employment Opportunity Commission Guidelines',
      description: 'Federal agency guidelines for enforcing anti-discrimination laws in employment',
      scope: 'Federal, applies to employers covered by federal EEO laws',
      requirements: [
        'Employers must maintain records relevant to determining whether unlawful employment practices have occurred',
        'Employers with 100+ employees must file annual EEO-1 reports',
        'Prohibition of retaliation against individuals who file charges or participate in investigations',
        'Guidelines for preventing and addressing workplace harassment'
      ],
      citations: [
        '29 C.F.R. §§ 1600-1691',
        'EEOC Enforcement Guidance on Retaliation and Related Issues (2016)',
        'EEOC Enforcement Guidance on Pregnancy Discrimination (2015)'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // IRCA regulations
    const ircaRegulation: Regulation = {
      id: 'irca',
      name: 'Immigration Reform and Control Act',
      description: 'Federal law requiring employers to verify identity and employment eligibility of employees',
      scope: 'Federal, applies to all employers regardless of size',
      requirements: [
        'Completion of Form I-9 for all employees within 3 business days of start of employment',
        'Verification of identity and employment authorization documents',
        'Retention of I-9 forms for 3 years after hire or 1 year after termination, whichever is later',
        'Prohibition of knowingly hiring or continuing to employ unauthorized workers'
      ],
      citations: [
        '8 U.S.C. §§ 1324a-1324c',
        '8 C.F.R. §§ 274a.1-274a.14'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // FCRA regulations
    const fcraRegulation: Regulation = {
      id: 'fcra',
      name: 'Fair Credit Reporting Act',
      description: 'Federal law governing the collection and use of consumer credit information, including for employment purposes',
      scope: 'Federal, applies to employers using consumer reports for employment decisions',
      requirements: [
        'Written disclosure and authorization before obtaining consumer reports',
        'Pre-adverse action notice with copy of report and summary of rights before taking adverse action',
        'Post-adverse action notice after taking adverse action based on consumer report',
        'Special procedures for investigative consumer reports'
      ],
      citations: [
        '15 U.S.C. §§ 1681-1681x',
        '16 C.F.R. § 600-603'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // COBRA regulations
    const cobraRegulation: Regulation = {
      id: 'cobra',
      name: 'Consolidated Omnibus Budget Reconciliation Act',
      description: 'Federal law requiring continuation of group health coverage after qualifying events',
      scope: 'Federal, applies to employers with 20+ employees in prior year',
      requirements: [
        'Continuation of group health coverage for qualified beneficiaries after qualifying events',
        'Initial COBRA notice to employees and dependents when coverage begins',
        'COBRA election notice within 14 days of notification of qualifying event',
        'Maximum continuation period of 18, 29, or 36 months depending on qualifying event'
      ],
      citations: [
        '29 U.S.C. §§ 1161-1169',
        '26 C.F.R. §§ 54.4980B-1-54.4980B-10'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // California specific
    const californiaRegulation: Regulation = {
      id: 'california_employment',
      name: 'California Employment Laws',
      description: 'California state-specific employment laws that often exceed federal requirements',
      scope: 'California employers',
      requirements: [
        'Minimum wage of $15.50 per hour (as of 2023)',
        'Overtime pay for hours worked beyond 8 in a day or 40 in a week',
        'Mandatory paid sick leave of at least 24 hours or 3 days per year',
        'California Family Rights Act (CFRA) leave for employers with 5+ employees',
        'Detailed requirements for final paychecks and payroll records',
        'Meal and rest break requirements'
      ],
      citations: [
        'California Labor Code',
        'California Fair Employment and Housing Act (FEHA)',
        'California Family Rights Act (CFRA)',
        'Cal/OSHA regulations'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // New York specific
    const newYorkRegulation: Regulation = {
      id: 'new_york_employment',
      name: 'New York Employment Laws',
      description: 'New York state-specific employment laws that often exceed federal requirements',
      scope: 'New York employers',
      requirements: [
        'Minimum wage varies by location (NYC: $15.00, Long Island & Westchester: $15.00, remainder of state: $14.20 as of 2023)',
        'New York Paid Family Leave providing up to 12 weeks of paid leave',
        'Paid sick leave requirements based on employer size',
        'Specific requirements for wage notices, pay statements, and recordkeeping',
        'Expanded workplace discrimination and harassment protections'
      ],
      citations: [
        'New York Labor Law',
        'New York State Human Rights Law',
        'New York Paid Family Leave Law',
        'New York Paid Sick Leave Law'
      ],
      lastUpdated: '2023-01-01'
    };
    
    // Store all regulations
    this.regulations.set('flsa', flsaRegulation);
    this.regulations.set('fmla', fmlaRegulation);
    this.regulations.set('ada', adaRegulation);
    this.regulations.set('title_vii', titleViiRegulation);
    this.regulations.set('eeoc', eeocRegulation);
    this.regulations.set('irca', ircaRegulation);
    this.regulations.set('fcra', fcraRegulation);
    this.regulations.set('cobra', cobraRegulation);
    this.regulations.set('california_employment', californiaRegulation);
    this.regulations.set('new_york_employment', newYorkRegulation);
  }

  /**
   * Identify relevant regulations for a given query
   */
  private identifyRelevantRegulations(query: string): Regulation[] {
    const queryLower = query.toLowerCase();
    const relevantRegulations: Regulation[] = [];
    
    // FLSA relevance
    if (
      queryLower.includes('wage') ||
      queryLower.includes('overtime') ||
      queryLower.includes('hour') ||
      queryLower.includes('minimum wage') ||
      queryLower.includes('flsa') ||
      queryLower.includes('fair labor')
    ) {
      const flsaRegulation = this.regulations.get('flsa');
      if (flsaRegulation) relevantRegulations.push(flsaRegulation);
    }
    
    // FMLA relevance
    if (
      queryLower.includes('leave') ||
      queryLower.includes('medical leave') ||
      queryLower.includes('family leave') ||
      queryLower.includes('fmla') ||
      queryLower.includes('maternity') ||
      queryLower.includes('paternity')
    ) {
      const fmlaRegulation = this.regulations.get('fmla');
      if (fmlaRegulation) relevantRegulations.push(fmlaRegulation);
    }
    
    // ADA relevance
    if (
      queryLower.includes('disability') ||
      queryLower.includes('accommodation') ||
      queryLower.includes('ada') ||
      queryLower.includes('americans with disabilities')
    ) {
      const adaRegulation = this.regulations.get('ada');
      if (adaRegulation) relevantRegulations.push(adaRegulation);
    }
    
    // Title VII relevance
    if (
      queryLower.includes('discrimination') ||
      queryLower.includes('harassment') ||
      queryLower.includes('title vii') ||
      queryLower.includes('civil rights') ||
      queryLower.includes('equal opportunity')
    ) {
      const titleViiRegulation = this.regulations.get('title_vii');
      if (titleViiRegulation) relevantRegulations.push(titleViiRegulation);
    }
    
    // EEOC relevance
    if (
      queryLower.includes('eeoc') ||
      queryLower.includes('equal employment') ||
      queryLower.includes('discrimination report')
    ) {
      const eeocRegulation = this.regulations.get('eeoc');
      if (eeocRegulation) relevantRegulations.push(eeocRegulation);
    }
    
    // IRCA/I-9 relevance
    if (
      queryLower.includes('i-9') ||
      queryLower.includes('immigration') ||
      queryLower.includes('work authorization') ||
      queryLower.includes('employment eligibility') ||
      queryLower.includes('irca')
    ) {
      const ircaRegulation = this.regulations.get('irca');
      if (ircaRegulation) relevantRegulations.push(ircaRegulation);
    }
    
    // FCRA relevance
    if (
      queryLower.includes('background check') ||
      queryLower.includes('credit report') ||
      queryLower.includes('consumer report') ||
      queryLower.includes('fcra')
    ) {
      const fcraRegulation = this.regulations.get('fcra');
      if (fcraRegulation) relevantRegulations.push(fcraRegulation);
    }
    
    // COBRA relevance
    if (
      queryLower.includes('cobra') ||
      queryLower.includes('continuation') ||
      queryLower.includes('health insurance termination') ||
      queryLower.includes('benefits after')
    ) {
      const cobraRegulation = this.regulations.get('cobra');
      if (cobraRegulation) relevantRegulations.push(cobraRegulation);
    }
    
    // State-specific relevance
    if (
      queryLower.includes('california') ||
      queryLower.includes('ca law') ||
      queryLower.includes('ca requirement')
    ) {
      const californiaRegulation = this.regulations.get('california_employment');
      if (californiaRegulation) relevantRegulations.push(californiaRegulation);
    }
    
    if (
      queryLower.includes('new york') ||
      queryLower.includes('ny law') ||
      queryLower.includes('ny requirement')
    ) {
      const newYorkRegulation = this.regulations.get('new_york_employment');
      if (newYorkRegulation) relevantRegulations.push(newYorkRegulation);
    }
    
    // If no specific relevance is found, include general federal regulations
    if (relevantRegulations.length === 0) {
      const flsaRegulation = this.regulations.get('flsa');
      if (flsaRegulation) relevantRegulations.push(flsaRegulation);
      
      const fmlaRegulation = this.regulations.get('fmla');
      if (fmlaRegulation) relevantRegulations.push(fmlaRegulation);
      
      const titleViiRegulation = this.regulations.get('title_vii');
      if (titleViiRegulation) relevantRegulations.push(titleViiRegulation);
    }
    
    return relevantRegulations;
  }

  /**
   * Create a compliance prompt based on the query and relevant regulations
   */
  private createCompliancePrompt(query: string, relevantRegulations: Regulation[]): string {
    let prompt = `I need compliance information and guidance regarding the following query:\n\n"${query}"\n\n`;
    
    prompt += "Here are the relevant regulations and requirements to consider:\n\n";
    
    relevantRegulations.forEach(regulation => {
      prompt += `== ${regulation.name.toUpperCase()} ==\n`;
      prompt += `Description: ${regulation.description}\n`;
      prompt += `Scope: ${regulation.scope}\n`;
      prompt += `Requirements:\n`;
      
      regulation.requirements.forEach(requirement => {
        prompt += `- ${requirement}\n`;
      });
      
      prompt += `Citations: ${regulation.citations.join(', ')}\n`;
      prompt += `Last Updated: ${regulation.lastUpdated}\n\n`;
    });
    
    prompt += `Please provide comprehensive compliance guidance for this query. Your response should:

1. Identify the specific regulatory requirements that apply to the situation
2. Explain compliance obligations in clear, actionable terms
3. Note any jurisdictional considerations (federal vs. state requirements)
4. Highlight common compliance pitfalls or areas of risk
5. Recommend practical compliance steps or best practices

If the query touches on multiple regulatory areas, provide an integrated response that addresses all relevant aspects. If there are areas where requirements might conflict or overlap, explain how to navigate those complexities.`;
    
    return prompt;
  }

  /**
   * Create a compliance result object
   */
  private createComplianceResult(query: string, response: string): ComplianceResult {
    // Calculate confidence based on the response
    const confidence = this.calculateConfidence(response);
    
    // Create and return compliance result
    return {
      id: uuidv4(),
      query,
      result: response,
      timestamp: new Date(),
      confidence
    };
  }

  /**
   * Store a compliance result
   */
  private storeComplianceResult(result: ComplianceResult): void {
    this.complianceResults.push(result);
    
    // Limit the number of stored results
    if (this.complianceResults.length > 100) {
      this.complianceResults.shift();  // Remove oldest result
    }
  }

  /**
   * Calculate confidence based on the response
   */
  private calculateConfidence(response: string): number {
    // Start with a baseline confidence
    let confidence = 0.7;
    
    // Citations increase confidence
    if (
      response.includes('U.S.C.') || 
      response.includes('C.F.R.') || 
      response.includes('section') || 
      response.includes('§')
    ) {
      confidence += 0.1;
    }
    
    // Specific regulation names increase confidence
    if (
      response.includes('FLSA') || 
      response.includes('FMLA') || 
      response.includes('ADA') || 
      response.includes('Title VII')
    ) {
      confidence += 0.1;
    }
    
    // Detailed guidance increases confidence
    if (
      response.includes('requirement') || 
      response.includes('compliance') || 
      response.includes('employer must') || 
      response.includes('legally')
    ) {
      confidence += 0.1;
    }
    
    // Uncertainty language decreases confidence
    const uncertaintyPatterns = ["may", "might", "could", "possibly", "unclear", "limited guidance", "varies by jurisdiction"];
    const uncertaintyCount = uncertaintyPatterns.reduce((count, pattern) => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      return count + (response.match(regex) || []).length;
    }, 0);
    
    confidence -= Math.min(0.3, uncertaintyCount * 0.05);
    
    // Ensure confidence stays within [0, 1] range
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get a regulation by ID
   */
  public getRegulation(id: string): Regulation | undefined {
    return this.regulations.get(id);
  }

  /**
   * Get all regulations
   */
  public getAllRegulations(): Regulation[] {
    return Array.from(this.regulations.values());
  }

  /**
   * Get all compliance results
   */
  public getComplianceResults(): ComplianceResult[] {
    return this.complianceResults;
  }
}