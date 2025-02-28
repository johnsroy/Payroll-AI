import { BaseAgent, AgentResponse, Message, AgentConfig, ToolCallResult } from './baseAgent';
import { anthropic } from './anthropic';
import { searchWithPerplexity, searchTaxRegulations } from './perplexity';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tax rate definition
 */
interface TaxRate {
  type: string;
  rate: number;
  threshold?: number;
  maxThreshold?: number;
  description?: string;
  applicability: string;
}

/**
 * Tax bracket definition
 */
interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  description?: string;
}

/**
 * Tax calculation result
 */
interface TaxCalculationResult {
  id: string;
  calculation_type: string;
  input_values: any;
  result_values: any;
  explanation: string;
  created_at: string;
  user_id?: string;
  company_id?: string;
}

/**
 * Tax Calculation Agent specializes in calculating taxes and providing
 * information about tax laws and regulations
 */
export class TaxCalculationAgent extends BaseAgent {
  private federalTaxBrackets: Record<string, TaxBracket[]> = {};
  private stateTaxRates: Record<string, TaxBracket[]> = {};
  private federalFicaTaxRates: Record<string, number> = {
    socialSecurity: 0.062,
    medicare: 0.0145,
    additionalMedicare: 0.009,
  };
  
  // 2024 values for tax calculations
  private socialSecurityWageCap = 168600;
  private additionalMedicareThreshold = 200000; // Individual threshold

  constructor(config: AgentConfig = { name: "Tax Calculation Agent" }) {
    const defaultSystemPrompt = `You are the Tax Calculation Agent, specialized in tax calculations and providing tax information.
        
Your capabilities include:
1. Calculating federal, state, and local income taxes
2. Calculating FICA taxes (Social Security and Medicare)
3. Providing information about tax rates, brackets, and thresholds
4. Explaining tax laws and regulations
5. Answering questions about tax filing requirements

Always strive for accuracy in tax calculations. When uncertain about specific tax laws or rates for a jurisdiction, clearly indicate this and suggest where the user might find the exact information they need.

When performing calculations, show your work step-by-step for transparency. Use the most current tax year information available.`;

    // Create calculation tools first
    const calculationTools = [
      {
        name: "calculate_payroll_taxes",
        description: "Calculate payroll taxes based on gross pay and other parameters",
        parameters: {
          type: "object",
          properties: {
            gross_pay: {
              type: "number",
              description: "Gross pay amount for the period"
            },
            pay_frequency: {
              type: "string",
              enum: ["weekly", "biweekly", "semimonthly", "monthly", "quarterly", "annually"],
              description: "Pay frequency"
            },
            filing_status: {
              type: "string",
              enum: ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"],
              description: "Tax filing status"
            },
            state: {
              type: "string",
              description: "State code (e.g., CA, NY, TX)"
            },
            allowances: {
              type: "number",
              description: "Number of allowances/exemptions claimed"
            },
            ytd_earnings: {
              type: "number",
              description: "Year-to-date earnings before this pay period"
            }
          },
          required: ["gross_pay", "pay_frequency", "filing_status", "state"]
        }
      },
      {
        name: "get_tax_rates",
        description: "Get tax rates for a specific tax type and state",
        parameters: {
          type: "object",
          properties: {
            tax_type: {
              type: "string",
              enum: ["federal_income", "state_income", "fica", "all"],
              description: "Type of tax rates to retrieve"
            },
            state: {
              type: "string",
              description: "State code for state income tax rates (e.g., CA, NY, TX)"
            },
            year: {
              type: "number",
              description: "Tax year"
            }
          },
          required: ["tax_type"]
        }
      }
    ];

    super({
      name: config.name || "Tax Calculation Agent",
      systemPrompt: config.systemPrompt || defaultSystemPrompt,
      model: config.model || 'claude-3-7-sonnet-20250219',  // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      temperature: config.temperature !== undefined ? config.temperature : 0.2,
      maxTokens: config.maxTokens || 1500,
      tools: config.tools || calculationTools,
      memory: config.memory !== undefined ? config.memory : true,
      conversationId: config.conversationId,
      userId: config.userId,
      companyId: config.companyId
    });
    
    // Initialize tax data
    this.initializeDefaultTaxData();
    this.loadTaxData();
  }
  
  /**
   * Process a query using the tax calculation agent
   */
  public async processQuery(query: string): Promise<AgentResponse> {
    try {
      // Add the user message to conversation history
      this.addMessage('user', query);
      
      // Check if we need real-time tax information
      let searchResults = '';
      if (
        query.includes('latest') || 
        query.includes('current') || 
        query.includes('recent') || 
        query.includes('update') ||
        query.includes('2024') ||
        query.includes('2025')
      ) {
        try {
          searchResults = await searchTaxRegulations(query);
        } catch (e) {
          console.error('Error searching for tax regulations:', e);
          // Continue without search results
        }
      }
      
      // Prepare the context
      let context = '';
      if (searchResults) {
        context += `\nRecent tax information from reliable sources:\n${searchResults}\n`;
      }
      
      // Get relevant context from knowledge base if available
      const knowledgeContext = await this.getRelevantContext(query);
      if (knowledgeContext) {
        context += `\nRelevant tax information from our knowledge base:\n${knowledgeContext}\n`;
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
      // but we parse for calculation requests
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
      console.error('Error processing query in Tax Calculation Agent:', error);
      
      // Return a graceful error response
      return {
        response: "I'm sorry, I encountered an error while processing your tax question. Please try rephrasing your question or try again later.",
        confidence: 0.1,
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Parse the response for calculation requests and execute them
   */
  private async parseAndExecuteToolCalls(responseText: string, query: string): Promise<ToolCallResult[]> {
    const toolCallResults: ToolCallResult[] = [];
    
    // Check for calculation patterns in the response or query
    const hasPayrollCalculation = 
      (responseText.includes('calculate payroll taxes') || query.includes('calculate payroll taxes')) &&
      (responseText.includes('gross pay') || query.includes('gross pay'));
    
    const hasTaxRateRequest =
      (responseText.includes('tax rates') || query.includes('tax rates')) &&
      (responseText.includes('federal') || query.includes('federal') || 
       responseText.includes('state') || query.includes('state'));
    
    // Execute appropriate calculations
    if (hasPayrollCalculation) {
      // Extract parameters from the text
      const grossPay = this.extractNumber(responseText, query, /gross\s+pay\s+of\s+\$?(\d+(?:\.\d+)?)/i) || 
                       this.extractNumber(responseText, query, /\$?(\d+(?:\.\d+)?)\s+gross\s+pay/i);
      
      const state = this.extractString(responseText, query, /state\s+(?:of\s+)?([A-Z]{2})/i) ||
                   this.extractString(responseText, query, /in\s+([A-Z]{2})/i);
      
      const filingStatus = 
        responseText.includes('single') || query.includes('single') ? 'single' :
        responseText.includes('married') || query.includes('married') ? 'married_filing_jointly' :
        responseText.includes('head of household') || query.includes('head of household') ? 'head_of_household' :
        'single'; // Default
      
      const payFrequency =
        responseText.includes('weekly') || query.includes('weekly') ? 'weekly' :
        responseText.includes('biweekly') || query.includes('biweekly') ? 'biweekly' :
        responseText.includes('monthly') || query.includes('monthly') ? 'monthly' :
        responseText.includes('semi-monthly') || query.includes('semi-monthly') ? 'semimonthly' :
        responseText.includes('quarterly') || query.includes('quarterly') ? 'quarterly' :
        responseText.includes('annually') || query.includes('annually') ? 'annually' :
        'biweekly'; // Default
      
      // Only attempt calculation if we have the minimum required parameters
      if (grossPay && state) {
        const params = {
          gross_pay: grossPay,
          pay_frequency: payFrequency,
          filing_status: filingStatus,
          state: state,
          allowances: 2, // Default
          ytd_earnings: 0 // Default
        };
        
        const result = await this.calculatePayrollTaxes(params);
        toolCallResults.push({
          name: 'calculate_payroll_taxes',
          arguments: params,
          result
        });
      }
    }
    
    if (hasTaxRateRequest) {
      const taxType = 
        (responseText.includes('federal income') || query.includes('federal income')) ? 'federal_income' :
        (responseText.includes('state income') || query.includes('state income')) ? 'state_income' :
        (responseText.includes('fica') || query.includes('fica')) ? 'fica' :
        'all'; // Default
      
      const state = this.extractString(responseText, query, /state\s+(?:of\s+)?([A-Z]{2})/i) ||
                   this.extractString(responseText, query, /in\s+([A-Z]{2})/i);
      
      const params = {
        tax_type: taxType,
        state: state || 'CA', // Default to California if not specified
        year: 2024 // Current tax year
      };
      
      const result = await this.getTaxRates(params);
      toolCallResults.push({
        name: 'get_tax_rates',
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
      return parseFloat(match1[1]);
    }
    
    const match2 = text2.match(pattern);
    if (match2 && match2[1]) {
      return parseFloat(match2[1]);
    }
    
    return null;
  }
  
  /**
   * Helper method to extract a string from text
   */
  private extractString(text1: string, text2: string, pattern: RegExp): string | null {
    const match1 = text1.match(pattern);
    if (match1 && match1[1]) {
      return match1[1];
    }
    
    const match2 = text2.match(pattern);
    if (match2 && match2[1]) {
      return match2[1];
    }
    
    return null;
  }
  
  /**
   * Load tax data from database or other sources
   */
  private async loadTaxData(): Promise<void> {
    try {
      // Check if we have tax data in Supabase
      const { data, error } = await supabase
        .from('tax_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        const taxData = data[0];
        
        // Parse the stored tax data
        if (taxData.federal_tax_brackets) {
          this.federalTaxBrackets = JSON.parse(taxData.federal_tax_brackets);
        }
        
        if (taxData.state_tax_rates) {
          this.stateTaxRates = JSON.parse(taxData.state_tax_rates);
        }
        
        if (taxData.fica_tax_rates) {
          this.federalFicaTaxRates = JSON.parse(taxData.fica_tax_rates);
        }
        
        if (taxData.social_security_wage_cap) {
          this.socialSecurityWageCap = taxData.social_security_wage_cap;
        }
        
        if (taxData.additional_medicare_threshold) {
          this.additionalMedicareThreshold = taxData.additional_medicare_threshold;
        }
      }
    } catch (error) {
      console.error('Error loading tax data:', error);
      // Fallback to default data already initialized
    }
  }
  
  /**
   * Initialize default tax data for 2024
   */
  private initializeDefaultTaxData(): void {
    // 2024 Federal Income Tax Brackets
    this.federalTaxBrackets = {
      'single': [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: null, rate: 0.37 }
      ],
      'married_filing_jointly': [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: null, rate: 0.37 }
      ],
      'married_filing_separately': [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 365600, rate: 0.35 },
        { min: 365600, max: null, rate: 0.37 }
      ],
      'head_of_household': [
        { min: 0, max: 16550, rate: 0.10 },
        { min: 16550, max: 63100, rate: 0.12 },
        { min: 63100, max: 100500, rate: 0.22 },
        { min: 100500, max: 191950, rate: 0.24 },
        { min: 191950, max: 243700, rate: 0.32 },
        { min: 243700, max: 609350, rate: 0.35 },
        { min: 609350, max: null, rate: 0.37 }
      ]
    };
    
    // State Tax Rates (simplified flat rates for example)
    this.stateTaxRates = {
      'CA': [
        { min: 0, max: 10099, rate: 0.01 },
        { min: 10099, max: 23942, rate: 0.02 },
        { min: 23942, max: 37788, rate: 0.04 },
        { min: 37788, max: 52455, rate: 0.06 },
        { min: 52455, max: 66295, rate: 0.08 },
        { min: 66295, max: 338639, rate: 0.093 },
        { min: 338639, max: 406364, rate: 0.103 },
        { min: 406364, max: 677275, rate: 0.113 },
        { min: 677275, max: null, rate: 0.123 }
      ],
      'NY': [
        { min: 0, max: 8500, rate: 0.04 },
        { min: 8500, max: 11700, rate: 0.045 },
        { min: 11700, max: 13900, rate: 0.0525 },
        { min: 13900, max: 80650, rate: 0.055 },
        { min: 80650, max: 215400, rate: 0.06 },
        { min: 215400, max: 1077550, rate: 0.063 },
        { min: 1077550, max: null, rate: 0.0685 }
      ],
      'TX': [
        { min: 0, max: null, rate: 0.0 } // No state income tax
      ],
      'FL': [
        { min: 0, max: null, rate: 0.0 } // No state income tax
      ],
      'WA': [
        { min: 0, max: null, rate: 0.0 } // No state income tax
      ]
    };
  }
  
  /**
   * Calculate payroll taxes based on input parameters
   */
  private async calculatePayrollTaxes(params: any): Promise<any> {
    try {
      const {
        gross_pay,
        pay_frequency,
        filing_status,
        state,
        allowances = 0,
        ytd_earnings = 0
      } = params;
      
      // Calculate total earnings (YTD + current gross)
      const totalEarnings = ytd_earnings + gross_pay;
      
      // Get pay periods per year
      const payPeriodsPerYear = this.getPayPeriodsPerYear(pay_frequency);
      const annualizedIncome = gross_pay * payPeriodsPerYear;
      
      // Calculate federal income tax
      const federalIncomeTax = this.calculateFederalIncomeTax(
        annualizedIncome,
        filing_status,
        allowances
      ) / payPeriodsPerYear;
      
      // Calculate state income tax
      const stateIncomeTax = this.calculateStateIncomeTax(
        annualizedIncome,
        state
      ) / payPeriodsPerYear;
      
      // Calculate FICA taxes
      const ficaTaxes = this.calculateFICATaxes(
        gross_pay,
        ytd_earnings,
        totalEarnings
      );
      
      // Calculate total tax and net pay
      const totalTax = federalIncomeTax + stateIncomeTax + ficaTaxes.socialSecurity + ficaTaxes.medicare;
      const netPay = gross_pay - totalTax;
      
      // Create the result object
      const result = {
        payroll_taxes: {
          input: {
            gross_pay,
            pay_frequency,
            filing_status,
            state,
            allowances,
            ytd_earnings
          },
          federal_income_tax: federalIncomeTax,
          state_income_tax: stateIncomeTax,
          social_security_tax: ficaTaxes.socialSecurity,
          medicare_tax: ficaTaxes.medicare,
          total_tax: totalTax,
          net_pay: netPay
        },
        explanation: `
Calculation breakdown for ${gross_pay} ${pay_frequency} gross pay in ${state} with ${filing_status} filing status:

Federal Income Tax: $${federalIncomeTax.toFixed(2)} 
State Income Tax: $${stateIncomeTax.toFixed(2)}
Social Security Tax (${(this.federalFicaTaxRates.socialSecurity * 100).toFixed(1)}%): $${ficaTaxes.socialSecurity.toFixed(2)}
Medicare Tax (${(this.federalFicaTaxRates.medicare * 100).toFixed(1)}%): $${ficaTaxes.medicare.toFixed(2)}

Total Tax Withholding: $${totalTax.toFixed(2)}
Net Pay: $${netPay.toFixed(2)}
        `
      };
      
      return result;
    } catch (error) {
      console.error('Error calculating payroll taxes:', error);
      return {
        error: 'Error calculating payroll taxes',
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Get tax rates for a specific tax type and state
   */
  private async getTaxRates(params: any): Promise<any> {
    const { tax_type, state, year = 2024 } = params;
    
    const result: {
      tax_type: string;
      state: string | undefined;
      year: number;
      rates: {
        federal_income?: Record<string, TaxBracket[]>;
        state_income?: TaxBracket[] | string;
        fica?: {
          social_security: {
            rate: number;
            wage_cap: number;
          };
          medicare: {
            rate: number;
            additional_rate: number;
            additional_threshold: number;
          };
        };
      }
    } = {
      tax_type,
      state,
      year,
      rates: {}
    };
    
    if (tax_type === 'federal_income' || tax_type === 'all') {
      result.rates.federal_income = this.federalTaxBrackets;
    }
    
    if ((tax_type === 'state_income' || tax_type === 'all') && state) {
      result.rates.state_income = this.stateTaxRates[state] || 
        `No state income tax data available for ${state}`;
    }
    
    if (tax_type === 'fica' || tax_type === 'all') {
      result.rates.fica = {
        social_security: {
          rate: this.federalFicaTaxRates.socialSecurity,
          wage_cap: this.socialSecurityWageCap
        },
        medicare: {
          rate: this.federalFicaTaxRates.medicare,
          additional_rate: this.federalFicaTaxRates.additionalMedicare,
          additional_threshold: this.additionalMedicareThreshold
        }
      };
    }
    
    return result;
  }
  
  /**
   * Calculate the number of pay periods per year
   */
  private getPayPeriodsPerYear(payFrequency: string): number {
    switch (payFrequency) {
      case 'weekly':
        return 52;
      case 'biweekly':
        return 26;
      case 'semimonthly':
        return 24;
      case 'monthly':
        return 12;
      case 'quarterly':
        return 4;
      case 'annually':
        return 1;
      default:
        return 26; // Default to biweekly
    }
  }
  
  /**
   * Calculate federal income tax
   */
  private calculateFederalIncomeTax(annualIncome: number, filingStatus: string, allowances: number): number {
    // Apply standard deduction based on filing status (2024 values)
    let standardDeduction = 0;
    
    // Get filing status-specific standard deduction
    switch (filingStatus) {
      case 'single':
        standardDeduction = 14600;
        break;
      case 'married_filing_jointly':
        standardDeduction = 29200;
        break;
      case 'married_filing_separately':
        standardDeduction = 14600;
        break;
      case 'head_of_household':
        standardDeduction = 21900;
        break;
      default:
        standardDeduction = 14600; // Default to single
    }
    
    // Apply allowances (simplified approach)
    const allowanceValue = 4300; // Approximate value per allowance/exemption
    const totalDeduction = standardDeduction + (allowanceValue * allowances);
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, annualIncome - totalDeduction);
    
    // Get the tax brackets for the filing status
    const brackets = this.federalTaxBrackets[filingStatus];
    if (!brackets) {
      return 0; // Return 0 if we don't have brackets for this filing status
    }
    
    // Calculate tax using the brackets
    let tax = 0;
    
    for (let i = 0; i < brackets.length; i++) {
      const { min, max, rate } = brackets[i];
      
      if (taxableIncome > min) {
        const bracketMax = max !== null ? max : Infinity;
        const bracketAmount = Math.min(taxableIncome, bracketMax) - min;
        tax += bracketAmount * rate;
        
        if (max !== null && taxableIncome <= max) {
          break;
        }
      }
    }
    
    return tax;
  }
  
  /**
   * Calculate state income tax
   */
  private calculateStateIncomeTax(annualIncome: number, state: string): number {
    const brackets = this.stateTaxRates[state];
    if (!brackets) {
      return 0; // Return 0 if we don't have data for this state
    }
    
    // Simple calculation for states with no income tax
    if (brackets.length === 1 && brackets[0].rate === 0) {
      return 0;
    }
    
    // Calculate state tax using the brackets (simplified, doesn't account for deductions)
    let tax = 0;
    
    for (let i = 0; i < brackets.length; i++) {
      const { min, max, rate } = brackets[i];
      
      if (annualIncome > min) {
        const bracketMax = max !== null ? max : Infinity;
        const bracketAmount = Math.min(annualIncome, bracketMax) - min;
        tax += bracketAmount * rate;
        
        if (max !== null && annualIncome <= max) {
          break;
        }
      }
    }
    
    return tax;
  }
  
  /**
   * Calculate FICA taxes (Social Security and Medicare)
   */
  private calculateFICATaxes(grossPay: number, ytdEarnings: number, totalEarnings: number): { socialSecurity: number, medicare: number } {
    // Social Security - apply the wage cap
    let socialSecurityTax = 0;
    
    if (totalEarnings <= this.socialSecurityWageCap) {
      // All earnings are subject to Social Security tax
      socialSecurityTax = grossPay * this.federalFicaTaxRates.socialSecurity;
    } else if (ytdEarnings < this.socialSecurityWageCap) {
      // Only part of the current pay is subject to Social Security tax
      const taxableAmount = this.socialSecurityWageCap - ytdEarnings;
      socialSecurityTax = Math.max(0, taxableAmount) * this.federalFicaTaxRates.socialSecurity;
    }
    // else: ytdEarnings already exceed the cap, so no Social Security tax
    
    // Medicare tax - no wage cap, but additional tax above threshold
    let medicareTax = grossPay * this.federalFicaTaxRates.medicare;
    
    // Add additional Medicare tax if over the threshold
    if (totalEarnings > this.additionalMedicareThreshold && ytdEarnings < this.additionalMedicareThreshold) {
      // Only the amount over the threshold is subject to additional Medicare tax
      const additionalTaxableAmount = totalEarnings - this.additionalMedicareThreshold;
      medicareTax += additionalTaxableAmount * this.federalFicaTaxRates.additionalMedicare;
    } else if (ytdEarnings >= this.additionalMedicareThreshold) {
      // All of the current pay is subject to additional Medicare tax
      medicareTax += grossPay * this.federalFicaTaxRates.additionalMedicare;
    }
    
    return {
      socialSecurity: socialSecurityTax,
      medicare: medicareTax
    };
  }
  
  /**
   * Get relevant context for a tax query from the knowledge base
   */
  protected async getRelevantContext(query: string): Promise<string | null> {
    try {
      // Search the Supabase vector store for relevant tax information
      const { data: taxInfoEntries, error } = await supabase.rpc('match_documents', {
        query_embedding: await createQueryEmbedding(query),
        match_threshold: 0.7,
        match_count: 3,
        filter_categories: ['tax', 'finance', 'payroll']
      });
      
      if (error) {
        console.error('Error searching knowledge base:', error);
        return null;
      }
      
      // Format the results if we found anything
      if (taxInfoEntries && Array.isArray(taxInfoEntries) && taxInfoEntries.length > 0) {
        return taxInfoEntries
          .map(entry => 
            `Source: ${entry.source || 'Knowledge Base'}\n${entry.content}`
          )
          .join('\n\n');
      }
      
      return null;
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return null;
    }
  }
  
  /**
   * Create an embedding for a query (helper method)
   */
  private async createQueryEmbedding(query: string): Promise<number[]> {
    // This function would normally call an embeddings API to vectorize the query
    // For now, we'll return a mock embedding
    return new Array(1536).fill(0).map(() => Math.random());
  }
}

// Helper function for generating query embeddings (simplified version)
async function createQueryEmbedding(query: string): Promise<number[]> {
  // This would normally call an embeddings API
  // For simplicity, we return a random vector
  return new Array(1536).fill(0).map(() => Math.random());
}