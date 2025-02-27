import { BaseAgent, AgentConfig } from './baseAgent';

interface TaxRate {
  type: string;
  rate: number;
  threshold?: number;
  maxThreshold?: number;
}

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export class TaxCalculationAgent extends BaseAgent {
  private federalTaxBrackets: Record<string, TaxBracket[]> = {};
  private stateTaxRates: Record<string, TaxRate[]> = {};
  private ficaTaxRates: Record<string, number> = {
    socialSecurity: 0.062,
    medicare: 0.0145,
    additionalMedicare: 0.009
  };
  private socialSecurityWageCap = 168600; // 2024 value
  private additionalMedicareThreshold = 200000; // Individual threshold

  constructor(config: AgentConfig) {
    // Define specialized system prompt for tax agent
    const taxSystemPrompt = `You are a tax calculation assistant specialized in payroll taxes. Your primary functions are:

1. Calculate various payroll taxes including federal withholding, state income tax, FICA (Social Security and Medicare)
2. Provide information on current tax rates, thresholds, and deductions
3. Explain tax forms and filing requirements for both employers and employees
4. Offer guidance on tax compliance and optimization

When providing tax calculations:
- Use the most current tax rates and thresholds available
- Clearly show each calculation step
- Distinguish between employer and employee tax obligations
- Note any special circumstances or exemptions that may apply
- Consider state-specific tax requirements when applicable

Be precise with numbers and always clarify when estimated figures are used versus exact calculations.
Remember that tax advice should be general in nature - recommend consulting with a tax professional for specific situations.`;

    // Initialize the agent with tax-specific configuration
    super({
      ...config,
      systemPrompt: taxSystemPrompt,
      temperature: 0.1, // Low temperature for more precise responses
    });
    
    // Initialize tax data
    this.initializeDefaultTaxData();
    
    // Define tax calculation tools
    this.tools = [
      {
        type: "function",
        function: {
          name: "calculate_payroll_taxes",
          description: "Calculate payroll taxes including federal, state, and FICA taxes",
          parameters: {
            type: "object",
            properties: {
              gross_pay: {
                type: "number",
                description: "Gross pay amount for the period"
              },
              pay_frequency: {
                type: "string",
                description: "Pay frequency (weekly, biweekly, semimonthly, monthly)",
                enum: ["weekly", "biweekly", "semimonthly", "monthly"]
              },
              filing_status: {
                type: "string",
                description: "Federal tax filing status",
                enum: ["single", "married", "head_of_household"]
              },
              allowances: {
                type: "number",
                description: "Number of allowances or exemptions claimed"
              },
              state: {
                type: "string",
                description: "Two-letter state code"
              },
              ytd_earnings: {
                type: "number",
                description: "Year-to-date earnings before this pay period"
              }
            },
            required: ["gross_pay", "pay_frequency", "filing_status"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_tax_rates",
          description: "Get current tax rates for federal, state, or FICA taxes",
          parameters: {
            type: "object",
            properties: {
              tax_type: {
                type: "string",
                description: "Type of tax (federal, state, fica)",
                enum: ["federal", "state", "fica", "all"]
              },
              state: {
                type: "string",
                description: "Two-letter state code (required for state tax rates)"
              }
            },
            required: ["tax_type"]
          }
        }
      }
    ];
  }

  private async loadTaxData(): Promise<void> {
    // In a real implementation, this would load current tax data from an API
    // For now, we'll use the default tax data
  }

  private initializeDefaultTaxData(): void {
    // Initialize federal tax brackets for different filing statuses
    this.federalTaxBrackets = {
      single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182100, rate: 0.24 },
        { min: 182100, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: null, rate: 0.37 }
      ],
      married: [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: null, rate: 0.37 }
      ],
      head_of_household: [
        { min: 0, max: 15700, rate: 0.10 },
        { min: 15700, max: 59850, rate: 0.12 },
        { min: 59850, max: 95350, rate: 0.22 },
        { min: 95350, max: 182100, rate: 0.24 },
        { min: 182100, max: 231250, rate: 0.32 },
        { min: 231250, max: 578100, rate: 0.35 },
        { min: 578100, max: null, rate: 0.37 }
      ]
    };
    
    // Initialize state tax rates (simplified for a few states)
    this.stateTaxRates = {
      CA: [
        { type: "income", rate: 0.01, threshold: 0, maxThreshold: 10099 },
        { type: "income", rate: 0.02, threshold: 10099, maxThreshold: 23942 },
        { type: "income", rate: 0.04, threshold: 23942, maxThreshold: 37788 },
        { type: "income", rate: 0.06, threshold: 37788, maxThreshold: 52455 },
        { type: "income", rate: 0.08, threshold: 52455, maxThreshold: 66295 },
        { type: "income", rate: 0.093, threshold: 66295, maxThreshold: 338639 },
        { type: "income", rate: 0.103, threshold: 338639, maxThreshold: 406364 },
        { type: "income", rate: 0.113, threshold: 406364, maxThreshold: 677275 },
        { type: "income", rate: 0.123, threshold: 677275, maxThreshold: undefined }
      ],
      NY: [
        { type: "income", rate: 0.04, threshold: 0, maxThreshold: 8500 },
        { type: "income", rate: 0.045, threshold: 8500, maxThreshold: 11700 },
        { type: "income", rate: 0.0525, threshold: 11700, maxThreshold: 13900 },
        { type: "income", rate: 0.059, threshold: 13900, maxThreshold: 80650 },
        { type: "income", rate: 0.0645, threshold: 80650, maxThreshold: 215400 },
        { type: "income", rate: 0.0685, threshold: 215400, maxThreshold: 1077550 },
        { type: "income", rate: 0.0882, threshold: 1077550, maxThreshold: undefined }
      ],
      TX: [], // No state income tax
      FL: []  // No state income tax
    };
  }

  private async calculatePayrollTaxes(params: any): Promise<any> {
    const { 
      gross_pay, 
      pay_frequency, 
      filing_status, 
      allowances = 0, 
      state = 'CA', 
      ytd_earnings = 0 
    } = params;
    
    // Calculate annualized income for tax brackets
    const payPeriodsPerYear = this.getPayPeriodsPerYear(pay_frequency);
    const annualizedIncome = gross_pay * payPeriodsPerYear;
    const totalEarnings = ytd_earnings + gross_pay;
    
    // Calculate federal income tax
    const federalTax = this.calculateFederalIncomeTax(annualizedIncome, filing_status, allowances) / payPeriodsPerYear;
    
    // Calculate state income tax
    const stateTax = this.calculateStateIncomeTax(annualizedIncome, state) / payPeriodsPerYear;
    
    // Calculate FICA taxes
    const ficaTaxes = this.calculateFICATaxes(gross_pay, ytd_earnings, totalEarnings);
    
    // Calculate total deductions and net pay
    const totalTax = federalTax + stateTax + ficaTaxes.socialSecurity + ficaTaxes.medicare;
    const netPay = gross_pay - totalTax;
    
    return {
      gross_pay: gross_pay,
      deductions: {
        federal_income_tax: parseFloat(federalTax.toFixed(2)),
        state_income_tax: parseFloat(stateTax.toFixed(2)),
        social_security: parseFloat(ficaTaxes.socialSecurity.toFixed(2)),
        medicare: parseFloat(ficaTaxes.medicare.toFixed(2)),
        total_tax: parseFloat(totalTax.toFixed(2))
      },
      net_pay: parseFloat(netPay.toFixed(2)),
      annual_projection: {
        gross: parseFloat((gross_pay * payPeriodsPerYear).toFixed(2)),
        federal_tax: parseFloat((federalTax * payPeriodsPerYear).toFixed(2)),
        state_tax: parseFloat((stateTax * payPeriodsPerYear).toFixed(2)),
        fica: parseFloat(((ficaTaxes.socialSecurity + ficaTaxes.medicare) * payPeriodsPerYear).toFixed(2))
      }
    };
  }

  private async getTaxRates(params: any): Promise<any> {
    const { tax_type, state } = params;
    const response: any = {};
    
    if (tax_type === 'all' || tax_type === 'federal') {
      response.federal = {
        brackets: this.federalTaxBrackets
      };
    }
    
    if ((tax_type === 'all' || tax_type === 'state') && state) {
      const stateRates = this.stateTaxRates[state.toUpperCase()] || [];
      response.state = {
        has_income_tax: stateRates.length > 0,
        state_code: state.toUpperCase(),
        rates: stateRates
      };
    }
    
    if (tax_type === 'all' || tax_type === 'fica') {
      response.fica = {
        social_security_rate: this.ficaTaxRates.socialSecurity,
        social_security_wage_cap: this.socialSecurityWageCap,
        medicare_rate: this.ficaTaxRates.medicare,
        additional_medicare_rate: this.ficaTaxRates.additionalMedicare,
        additional_medicare_threshold: this.additionalMedicareThreshold
      };
    }
    
    return response;
  }

  private getPayPeriodsPerYear(payFrequency: string): number {
    switch (payFrequency) {
      case 'weekly': return 52;
      case 'biweekly': return 26;
      case 'semimonthly': return 24;
      case 'monthly': return 12;
      default: return 12;
    }
  }

  private calculateFederalIncomeTax(annualIncome: number, filingStatus: string, allowances: number): number {
    // Apply a simple allowance deduction ($4,000 per allowance for simplicity)
    const allowanceDeduction = allowances * 4000;
    const taxableIncome = Math.max(0, annualIncome - allowanceDeduction);
    
    // Get the appropriate tax brackets
    const brackets = this.federalTaxBrackets[filingStatus as keyof typeof this.federalTaxBrackets] || this.federalTaxBrackets.single;
    
    // Calculate tax using the brackets
    let tax = 0;
    let remainingIncome = taxableIncome;
    
    for (const bracket of brackets) {
      const min = bracket.min;
      const max = bracket.max ?? Number.MAX_SAFE_INTEGER;
      const rate = bracket.rate;
      
      if (remainingIncome > min) {
        const taxableAmountInBracket = Math.min(remainingIncome - min, max - min);
        tax += taxableAmountInBracket * rate;
        
        if (remainingIncome < max) {
          break;
        }
      }
    }
    
    return tax;
  }

  private calculateStateIncomeTax(annualIncome: number, state: string): number {
    // Get state tax rates
    const stateRates = this.stateTaxRates[state.toUpperCase()];
    
    // If no state tax or state not found, return 0
    if (!stateRates || stateRates.length === 0) {
      return 0;
    }
    
    // Calculate state tax using simple brackets
    let tax = 0;
    let remainingIncome = annualIncome;
    
    // Sort rates by threshold to ensure correct calculation
    const sortedRates = [...stateRates].sort((a, b) => 
      (a.threshold || 0) - (b.threshold || 0)
    );
    
    for (const rate of sortedRates) {
      const min = rate.threshold || 0;
      const max = rate.maxThreshold !== undefined ? rate.maxThreshold : Number.MAX_SAFE_INTEGER;
      
      if (remainingIncome > min) {
        const taxableAmountInBracket = Math.min(remainingIncome - min, max - min);
        tax += taxableAmountInBracket * rate.rate;
        
        if (remainingIncome < max) {
          break;
        }
      }
    }
    
    return tax;
  }

  private calculateFICATaxes(gross: number, ytdEarnings: number, totalEarnings: number): { socialSecurity: number, medicare: number } {
    // Calculate Social Security tax
    let socialSecurityTax = 0;
    if (ytdEarnings < this.socialSecurityWageCap) {
      const taxableSSAmount = Math.min(gross, this.socialSecurityWageCap - ytdEarnings);
      socialSecurityTax = taxableSSAmount * this.ficaTaxRates.socialSecurity;
    }
    
    // Calculate Medicare tax
    let medicareTax = gross * this.ficaTaxRates.medicare;
    
    // Add Additional Medicare Tax if applicable
    if (totalEarnings > this.additionalMedicareThreshold) {
      const additionalMedicareTaxableAmount = Math.max(0, totalEarnings - Math.max(ytdEarnings, this.additionalMedicareThreshold));
      medicareTax += additionalMedicareTaxableAmount * this.ficaTaxRates.additionalMedicare;
    }
    
    return {
      socialSecurity: socialSecurityTax,
      medicare: medicareTax
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
        case 'calculate_payroll_taxes':
          functionResult = await this.calculatePayrollTaxes(args);
          break;
        case 'get_tax_rates':
          functionResult = await this.getTaxRates(args);
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