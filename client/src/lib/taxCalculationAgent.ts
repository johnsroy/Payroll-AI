import { BaseAgent, AgentConfig } from './baseAgent';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';

interface TaxRate {
  type: string;
  rate: number;
  description: string;
  applicability: string;
}

interface TaxResult {
  id: string;
  query: string;
  result: any;
  timestamp: Date;
  confidence: number;
}

export class TaxCalculationAgent extends BaseAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;
  private model: string = 'claude-3-sonnet-20240229';
  private temperature: number = 0.2;
  private taxRates: Map<string, TaxRate[]> = new Map();
  private taxResults: TaxResult[] = [];
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Initialize Anthropic client with API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for TaxCalculationAgent');
    }
    
    this.anthropic = new Anthropic({
      apiKey
    });
    
    // Set up system prompt for tax calculation agent
    this.systemPrompt = `You are an advanced tax calculation agent in a multi-agent system for payroll management.
Your primary responsibilities are:

1. Calculate federal, state, and local tax obligations for payroll
2. Provide guidance on tax regulations and compliance
3. Optimize tax strategies within legal frameworks
4. Monitor changes in tax laws and update calculations accordingly
5. Generate tax reports and documentation

You specialize in:
- Federal income tax withholding calculations
- FICA (Social Security and Medicare) tax computations
- State and local income tax determinations
- Unemployment insurance tax requirements
- Tax credits and deductions relevant to payroll

When responding, always:
- Show step-by-step calculations for transparency
- Cite relevant tax codes and regulations
- Indicate the applicable tax year for all calculations
- Note any assumptions or limitations in your analysis
- Provide confidence levels in your calculations`;

    // Initialize tax rates database
    this.initializeTaxRates();
  }

  /**
   * Reset the agent state
   */
  public reset(): void {
    this.taxResults = [];
    this.initializeTaxRates();
  }

  /**
   * Process a query using the tax calculation agent
   */
  public async processQuery(query: string): Promise<{ response: string; confidence: number; metadata?: any }> {
    // Identify relevant tax rates for the query
    const relevantRates = this.identifyRelevantTaxRates(query);
    
    // Create a tax calculation prompt based on the query and relevant tax rates
    const taxPrompt = this.createTaxPrompt(query, relevantRates);
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: taxPrompt
        }
      ]
    });
    
    // Extract response
    const content = response.content[0];
    const assistantMessage = typeof content === 'object' && 'text' in content 
      ? content.text 
      : JSON.stringify(content);
    
    // Store tax result
    const taxResult = this.createTaxResult(query, assistantMessage);
    this.storeTaxResult(taxResult);
    
    return {
      response: assistantMessage,
      confidence: taxResult.confidence,
      metadata: {
        taxTypes: relevantRates.map(rate => rate.type),
        resultId: taxResult.id
      }
    };
  }

  /**
   * Initialize tax rates database with current tax information
   */
  private initializeTaxRates(): void {
    // Federal income tax rates (simplified 2023 rates)
    const federalIncomeTaxRates: TaxRate[] = [
      { 
        type: 'federal_income', 
        rate: 0.10, 
        description: '10% on income up to $11,000 (single) or $22,000 (married filing jointly)', 
        applicability: 'income <= 11000 (single) || income <= 22000 (joint)' 
      },
      { 
        type: 'federal_income', 
        rate: 0.12, 
        description: '12% on income over $11,000 up to $44,725 (single) or over $22,000 up to $89,450 (married filing jointly)', 
        applicability: '11000 < income <= 44725 (single) || 22000 < income <= 89450 (joint)' 
      },
      { 
        type: 'federal_income', 
        rate: 0.22, 
        description: '22% on income over $44,725 up to $95,375 (single) or over $89,450 up to $190,750 (married filing jointly)', 
        applicability: '44725 < income <= 95375 (single) || 89450 < income <= 190750 (joint)' 
      },
      { 
        type: 'federal_income', 
        rate: 0.24, 
        description: '24% on income over $95,375 up to $182,100 (single) or over $190,750 up to $364,200 (married filing jointly)', 
        applicability: '95375 < income <= 182100 (single) || 190750 < income <= 364200 (joint)' 
      },
      { 
        type: 'federal_income', 
        rate: 0.32, 
        description: '32% on income over $182,100 up to $231,250 (single) or over $364,200 up to $462,500 (married filing jointly)', 
        applicability: '182100 < income <= 231250 (single) || 364200 < income <= 462500 (joint)' 
      },
      { 
        type: 'federal_income', 
        rate: 0.35, 
        description: '35% on income over $231,250 up to $578,125 (single) or over $462,500 up to $693,750 (married filing jointly)', 
        applicability: '231250 < income <= 578125 (single) || 462500 < income <= 693750 (joint)' 
      },
      { 
        type: 'federal_income', 
        rate: 0.37, 
        description: '37% on income over $578,125 (single) or over $693,750 (married filing jointly)', 
        applicability: 'income > 578125 (single) || income > 693750 (joint)' 
      }
    ];
    
    // FICA tax rates (2023)
    const ficaTaxRates: TaxRate[] = [
      { 
        type: 'social_security', 
        rate: 0.062, 
        description: '6.2% on first $160,200 of wages (employee portion)', 
        applicability: 'wages <= 160200' 
      },
      { 
        type: 'social_security_employer', 
        rate: 0.062, 
        description: '6.2% on first $160,200 of wages (employer portion)', 
        applicability: 'wages <= 160200' 
      },
      { 
        type: 'medicare', 
        rate: 0.0145, 
        description: '1.45% on all wages (employee portion)', 
        applicability: 'all wages' 
      },
      { 
        type: 'medicare_employer', 
        rate: 0.0145, 
        description: '1.45% on all wages (employer portion)', 
        applicability: 'all wages' 
      },
      { 
        type: 'medicare_additional', 
        rate: 0.009, 
        description: 'Additional 0.9% on wages over $200,000 (single) or $250,000 (married filing jointly)', 
        applicability: 'wages > 200000 (single) || wages > 250000 (joint)' 
      }
    ];
    
    // State income tax rates (sample of a few states, 2023 approximation)
    const californiaIncomeTaxRates: TaxRate[] = [
      { 
        type: 'california_income', 
        rate: 0.01, 
        description: '1% on first $10,099 of taxable income', 
        applicability: 'income <= 10099' 
      },
      { 
        type: 'california_income', 
        rate: 0.02, 
        description: '2% on taxable income over $10,099 up to $23,942', 
        applicability: '10099 < income <= 23942' 
      },
      { 
        type: 'california_income', 
        rate: 0.04, 
        description: '4% on taxable income over $23,942 up to $37,788', 
        applicability: '23942 < income <= 37788' 
      },
      { 
        type: 'california_income', 
        rate: 0.06, 
        description: '6% on taxable income over $37,788 up to $52,455', 
        applicability: '37788 < income <= 52455' 
      },
      { 
        type: 'california_income', 
        rate: 0.08, 
        description: '8% on taxable income over $52,455 up to $66,295', 
        applicability: '52455 < income <= 66295' 
      },
      { 
        type: 'california_income', 
        rate: 0.093, 
        description: '9.3% on taxable income over $66,295 up to $338,639', 
        applicability: '66295 < income <= 338639' 
      },
      { 
        type: 'california_income', 
        rate: 0.103, 
        description: '10.3% on taxable income over $338,639 up to $406,364', 
        applicability: '338639 < income <= 406364' 
      },
      { 
        type: 'california_income', 
        rate: 0.113, 
        description: '11.3% on taxable income over $406,364 up to $677,275', 
        applicability: '406364 < income <= 677275' 
      },
      { 
        type: 'california_income', 
        rate: 0.123, 
        description: '12.3% on taxable income over $677,275 up to $1,000,000', 
        applicability: '677275 < income <= 1000000' 
      },
      { 
        type: 'california_income', 
        rate: 0.133, 
        description: '13.3% on taxable income over $1,000,000', 
        applicability: 'income > 1000000' 
      }
    ];
    
    const texasIncomeTaxRates: TaxRate[] = [
      { 
        type: 'texas_income', 
        rate: 0, 
        description: 'Texas has no state income tax', 
        applicability: 'all income' 
      }
    ];
    
    const newYorkIncomeTaxRates: TaxRate[] = [
      { 
        type: 'new_york_income', 
        rate: 0.04, 
        description: '4% on first $8,500 of taxable income', 
        applicability: 'income <= 8500' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.045, 
        description: '4.5% on taxable income over $8,500 up to $11,700', 
        applicability: '8500 < income <= 11700' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.0525, 
        description: '5.25% on taxable income over $11,700 up to $13,900', 
        applicability: '11700 < income <= 13900' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.0585, 
        description: '5.85% on taxable income over $13,900 up to $80,650', 
        applicability: '13900 < income <= 80650' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.0625, 
        description: '6.25% on taxable income over $80,650 up to $215,400', 
        applicability: '80650 < income <= 215400' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.0685, 
        description: '6.85% on taxable income over $215,400 up to $1,077,550', 
        applicability: '215400 < income <= 1077550' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.0965, 
        description: '9.65% on taxable income over $1,077,550 up to $5,000,000', 
        applicability: '1077550 < income <= 5000000' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.1030, 
        description: '10.3% on taxable income over $5,000,000 up to $25,000,000', 
        applicability: '5000000 < income <= 25000000' 
      },
      { 
        type: 'new_york_income', 
        rate: 0.1090, 
        description: '10.9% on taxable income over $25,000,000', 
        applicability: 'income > 25000000' 
      }
    ];
    
    // Unemployment tax rates (approximations, 2023)
    const unemploymentTaxRates: TaxRate[] = [
      { 
        type: 'futa', 
        rate: 0.006, 
        description: 'Federal Unemployment Tax Act (FUTA) tax of 0.6% on first $7,000 of wages (after state credits)', 
        applicability: 'wages <= 7000' 
      },
      { 
        type: 'suta_california', 
        rate: 0.034, 
        description: 'California State Unemployment Tax (average rate of 3.4% on first $7,000 of wages)', 
        applicability: 'wages <= 7000 && state == CA' 
      },
      { 
        type: 'suta_texas', 
        rate: 0.027, 
        description: 'Texas State Unemployment Tax (average rate of 2.7% on first $9,000 of wages)', 
        applicability: 'wages <= 9000 && state == TX' 
      },
      { 
        type: 'suta_new_york', 
        rate: 0.038, 
        description: 'New York State Unemployment Tax (average rate of 3.8% on first $12,000 of wages)', 
        applicability: 'wages <= 12000 && state == NY' 
      }
    ];
    
    // Store all tax rates
    this.taxRates.set('federal_income', federalIncomeTaxRates);
    this.taxRates.set('fica', ficaTaxRates);
    this.taxRates.set('california_income', californiaIncomeTaxRates);
    this.taxRates.set('texas_income', texasIncomeTaxRates);
    this.taxRates.set('new_york_income', newYorkIncomeTaxRates);
    this.taxRates.set('unemployment', unemploymentTaxRates);
  }

  /**
   * Identify relevant tax rates for a given query
   */
  private identifyRelevantTaxRates(query: string): TaxRate[] {
    const queryLower = query.toLowerCase();
    const relevantRates: TaxRate[] = [];
    
    // Federal income tax relevance
    if (
      queryLower.includes('federal') ||
      queryLower.includes('income tax') ||
      queryLower.includes('tax bracket') ||
      queryLower.includes('withholding') ||
      queryLower.includes('federal income')
    ) {
      const federalRates = this.taxRates.get('federal_income') || [];
      relevantRates.push(...federalRates);
    }
    
    // FICA tax relevance
    if (
      queryLower.includes('fica') ||
      queryLower.includes('social security') ||
      queryLower.includes('medicare') ||
      queryLower.includes('payroll tax')
    ) {
      const ficaRates = this.taxRates.get('fica') || [];
      relevantRates.push(...ficaRates);
    }
    
    // State income tax relevance
    if (queryLower.includes('state tax') || queryLower.includes('state income')) {
      // Check for specific states
      if (queryLower.includes('california') || queryLower.includes('ca')) {
        const caRates = this.taxRates.get('california_income') || [];
        relevantRates.push(...caRates);
      } else if (queryLower.includes('texas') || queryLower.includes('tx')) {
        const txRates = this.taxRates.get('texas_income') || [];
        relevantRates.push(...txRates);
      } else if (queryLower.includes('new york') || queryLower.includes('ny')) {
        const nyRates = this.taxRates.get('new_york_income') || [];
        relevantRates.push(...nyRates);
      } else {
        // If no specific state mentioned, include representative states
        const caRates = this.taxRates.get('california_income') || [];
        const txRates = this.taxRates.get('texas_income') || [];
        const nyRates = this.taxRates.get('new_york_income') || [];
        relevantRates.push(...caRates, ...txRates, ...nyRates);
      }
    }
    
    // Unemployment tax relevance
    if (
      queryLower.includes('unemployment') ||
      queryLower.includes('futa') ||
      queryLower.includes('suta') ||
      queryLower.includes('employer tax')
    ) {
      const unemploymentRates = this.taxRates.get('unemployment') || [];
      relevantRates.push(...unemploymentRates);
    }
    
    // If no specific relevance is found, include federal and FICA taxes as defaults
    if (relevantRates.length === 0) {
      const federalRates = this.taxRates.get('federal_income') || [];
      const ficaRates = this.taxRates.get('fica') || [];
      relevantRates.push(...federalRates, ...ficaRates);
    }
    
    return relevantRates;
  }

  /**
   * Create a tax calculation prompt based on the query and relevant tax rates
   */
  private createTaxPrompt(query: string, relevantRates: TaxRate[]): string {
    let prompt = `I need you to help with the following tax calculation query:\n\n"${query}"\n\n`;
    
    prompt += "Here are the relevant tax rates and rules to consider:\n\n";
    
    // Group tax rates by type
    const ratesByType = new Map<string, TaxRate[]>();
    
    relevantRates.forEach(rate => {
      if (!ratesByType.has(rate.type)) {
        ratesByType.set(rate.type, []);
      }
      
      const ratesForType = ratesByType.get(rate.type);
      if (ratesForType) {
        ratesForType.push(rate);
      }
    });
    
    // Add each type of tax rate to the prompt
    ratesByType.forEach((rates, type) => {
      prompt += `== ${type.toUpperCase().replace('_', ' ')} TAX ==\n`;
      
      rates.forEach(rate => {
        prompt += `Rate: ${(rate.rate * 100).toFixed(2)}%\n`;
        prompt += `Description: ${rate.description}\n`;
        prompt += `Applicability: ${rate.applicability}\n\n`;
      });
    });
    
    prompt += `Please answer the query using these tax rates and rules. Your response should:

1. Provide step-by-step calculations with explanations
2. Show the mathematical formulas used for each calculation
3. Cite specific tax rates and thresholds as applicable
4. Explain any assumptions you need to make
5. Provide the final calculated amount(s) clearly labeled

For complex scenarios, consider multiple approaches or interpretations if appropriate. If the query requires additional information to provide an accurate answer, please indicate what additional details would be helpful.`;
    
    return prompt;
  }

  /**
   * Create a tax result object
   */
  private createTaxResult(query: string, response: string): TaxResult {
    // Calculate confidence based on the response
    const confidence = this.calculateConfidence(response);
    
    // Create and return tax result
    return {
      id: uuidv4(),
      query,
      result: response,
      timestamp: new Date(),
      confidence
    };
  }

  /**
   * Store a tax result
   */
  private storeTaxResult(result: TaxResult): void {
    this.taxResults.push(result);
    
    // Limit the number of stored results
    if (this.taxResults.length > 100) {
      this.taxResults.shift();  // Remove oldest result
    }
  }

  /**
   * Calculate confidence based on the response
   */
  private calculateConfidence(response: string): number {
    // Start with a baseline confidence
    let confidence = 0.7;
    
    // Specific calculations increase confidence
    if (
      response.includes('calculation') || 
      response.includes('formula') || 
      response.includes('computation')
    ) {
      confidence += 0.1;
    }
    
    // Step-by-step explanations increase confidence
    if (
      response.includes('step 1') || 
      response.includes('first step') || 
      response.includes('step-by-step')
    ) {
      confidence += 0.1;
    }
    
    // Citations increase confidence
    if (
      response.includes('IRS') || 
      response.includes('tax code') || 
      response.includes('section') || 
      response.includes('regulation')
    ) {
      confidence += 0.1;
    }
    
    // Uncertainty language decreases confidence
    const uncertaintyPatterns = ["approximately", "estimate", "uncertain", "unclear", "assumption", "may vary"];
    const uncertaintyCount = uncertaintyPatterns.reduce((count, pattern) => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      return count + (response.match(regex) || []).length;
    }, 0);
    
    confidence -= Math.min(0.3, uncertaintyCount * 0.05);
    
    // Ensure confidence stays within [0, 1] range
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get tax rates by type
   */
  public getTaxRates(type: string): TaxRate[] {
    return this.taxRates.get(type) || [];
  }

  /**
   * Get all tax results
   */
  public getTaxResults(): TaxResult[] {
    return this.taxResults;
  }
}