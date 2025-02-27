import { BaseAgent, AgentConfig } from './baseAgent';

// Define tax rate interface
interface TaxRate {
  type: string;
  rate: number;
  threshold?: number;
  maxThreshold?: number;
}

// Define tax bracket interface
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
    super({
      ...config,
      systemPrompt: `You are a tax calculation expert specializing in payroll taxes. Your expertise is in calculating and explaining various payroll taxes including federal income tax, state income tax, FICA taxes (Social Security and Medicare), and other employment taxes.

Always provide accurate and helpful guidance on tax matters. When addressing tax questions:
1. Calculate taxes based on the most current tax rates and thresholds
2. Explain how different taxes are calculated and what factors affect them
3. Consider filing status, allowances, and location in your calculations
4. Provide clear breakdowns of tax calculations

Your goal is to help users understand their tax obligations and how different factors impact their tax liability. Always note that you're providing general guidance, not official tax advice, and recommend consulting with a tax professional for specific situations.`,
      tools: [
        {
          function: {
            name: "calculatePayrollTaxes",
            description: "Calculate payroll taxes based on income information",
            parameters: {
              type: "object",
              properties: {
                grossIncome: {
                  type: "number",
                  description: "Gross income amount per pay period"
                },
                payFrequency: {
                  type: "string",
                  enum: ["weekly", "biweekly", "semimonthly", "monthly", "annually"],
                  description: "Pay frequency"
                },
                filingStatus: {
                  type: "string",
                  enum: ["single", "married", "headOfHousehold"],
                  description: "Tax filing status"
                },
                allowances: {
                  type: "number",
                  description: "Number of allowances claimed"
                },
                state: {
                  type: "string",
                  description: "State code (e.g., CA, NY, TX)"
                },
                ytdEarnings: {
                  type: "number",
                  description: "Year-to-date earnings before this pay period"
                }
              },
              required: ["grossIncome", "payFrequency", "filingStatus", "state"]
            }
          },
          handler: async (params: any) => {
            return await this.calculatePayrollTaxes(params);
          }
        },
        {
          function: {
            name: "getTaxRates",
            description: "Get current tax rates for a specific location",
            parameters: {
              type: "object",
              properties: {
                state: {
                  type: "string",
                  description: "State code (e.g., CA, NY, TX)"
                },
                filingStatus: {
                  type: "string",
                  enum: ["single", "married", "headOfHousehold"],
                  description: "Tax filing status"
                },
                includeLocal: {
                  type: "boolean",
                  description: "Whether to include local tax rates"
                }
              },
              required: ["state"]
            }
          },
          handler: async (params: any) => {
            return await this.getTaxRates(params);
          }
        }
      ]
    });

    // Load tax data
    this.loadTaxData();
  }

  private async loadTaxData(): Promise<void> {
    try {
      // In a real implementation, we would fetch this from a database
      // For now, we'll initialize with some default values
      this.initializeDefaultTaxData();
    } catch (error) {
      console.error('Error loading tax data:', error);
    }
  }

  private initializeDefaultTaxData(): void {
    // 2023 federal tax brackets (simplified)
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
      headOfHousehold: [
        { min: 0, max: 15700, rate: 0.10 },
        { min: 15700, max: 59850, rate: 0.12 },
        { min: 59850, max: 95350, rate: 0.22 },
        { min: 95350, max: 182100, rate: 0.24 },
        { min: 182100, max: 231250, rate: 0.32 },
        { min: 231250, max: 578100, rate: 0.35 },
        { min: 578100, max: null, rate: 0.37 }
      ]
    };

    // State tax rates (simplified)
    this.stateTaxRates = {
      CA: [
        { type: 'income', rate: 0.01, threshold: 0, maxThreshold: 10099 },
        { type: 'income', rate: 0.02, threshold: 10099, maxThreshold: 23942 },
        { type: 'income', rate: 0.04, threshold: 23942, maxThreshold: 37788 },
        { type: 'income', rate: 0.06, threshold: 37788, maxThreshold: 52455 },
        { type: 'income', rate: 0.08, threshold: 52455, maxThreshold: 66295 },
        { type: 'income', rate: 0.093, threshold: 66295, maxThreshold: 338639 },
        { type: 'income', rate: 0.103, threshold: 338639, maxThreshold: 406364 },
        { type: 'income', rate: 0.113, threshold: 406364, maxThreshold: 677275 },
        { type: 'income', rate: 0.123, threshold: 677275, maxThreshold: null }
      ],
      NY: [
        { type: 'income', rate: 0.04, threshold: 0, maxThreshold: 8500 },
        { type: 'income', rate: 0.045, threshold: 8500, maxThreshold: 11700 },
        { type: 'income', rate: 0.0525, threshold: 11700, maxThreshold: 13900 },
        { type: 'income', rate: 0.059, threshold: 13900, maxThreshold: 80650 },
        { type: 'income', rate: 0.0597, threshold: 80650, maxThreshold: 215400 },
        { type: 'income', rate: 0.0633, threshold: 215400, maxThreshold: 1077550 },
        { type: 'income', rate: 0.0685, threshold: 1077550, maxThreshold: 5000000 },
        { type: 'income', rate: 0.0882, threshold: 5000000, maxThreshold: 25000000 },
        { type: 'income', rate: 0.103, threshold: 25000000, maxThreshold: null }
      ],
      TX: [
        // Texas has no state income tax
      ]
    };

    // Add more states as needed
  }

  private async calculatePayrollTaxes(params: any): Promise<any> {
    const { 
      grossIncome,
      payFrequency,
      filingStatus = 'single',
      allowances = 0,
      state,
      ytdEarnings = 0
    } = params;

    // Calculate annual income based on pay frequency
    const payPeriodsPerYear = this.getPayPeriodsPerYear(payFrequency);
    const annualIncome = grossIncome * payPeriodsPerYear;
    
    // Calculate Federal Income Tax
    const federalIncomeTax = this.calculateFederalIncomeTax(annualIncome, filingStatus, allowances) / payPeriodsPerYear;
    
    // Calculate State Income Tax
    const stateIncomeTax = this.calculateStateIncomeTax(annualIncome, state) / payPeriodsPerYear;
    
    // Calculate FICA taxes
    const totalEarnings = ytdEarnings + grossIncome;
    const ficaTaxes = this.calculateFICATaxes(grossIncome, ytdEarnings, totalEarnings);
    
    // Calculate total tax and net pay
    const totalTax = federalIncomeTax + stateIncomeTax + ficaTaxes.socialSecurity + ficaTaxes.medicare;
    const netPay = grossIncome - totalTax;
    
    return {
      grossPay: grossIncome,
      deductions: {
        federalIncomeTax: parseFloat(federalIncomeTax.toFixed(2)),
        stateIncomeTax: parseFloat(stateIncomeTax.toFixed(2)),
        socialSecurityTax: parseFloat(ficaTaxes.socialSecurity.toFixed(2)),
        medicareTax: parseFloat(ficaTaxes.medicare.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2))
      },
      netPay: parseFloat(netPay.toFixed(2)),
      annualProjection: {
        grossIncome: parseFloat((grossIncome * payPeriodsPerYear).toFixed(2)),
        federalIncomeTax: parseFloat((federalIncomeTax * payPeriodsPerYear).toFixed(2)),
        stateIncomeTax: parseFloat((stateIncomeTax * payPeriodsPerYear).toFixed(2)),
        socialSecurityTax: parseFloat((ficaTaxes.socialSecurity * payPeriodsPerYear).toFixed(2)),
        medicareTax: parseFloat((ficaTaxes.medicare * payPeriodsPerYear).toFixed(2)),
        totalTax: parseFloat((totalTax * payPeriodsPerYear).toFixed(2)),
        netIncome: parseFloat((netPay * payPeriodsPerYear).toFixed(2))
      }
    };
  }

  private async getTaxRates(params: any): Promise<any> {
    const { state, filingStatus = 'single' } = params;
    
    // Get federal tax brackets
    const federalBrackets = this.federalTaxBrackets[filingStatus] || this.federalTaxBrackets.single;
    
    // Get state tax rates
    const stateTaxRates = this.stateTaxRates[state] || [];
    
    // Get FICA rates
    const ficaRates = {
      socialSecurity: {
        rate: this.ficaTaxRates.socialSecurity,
        cap: this.socialSecurityWageCap
      },
      medicare: {
        rate: this.ficaTaxRates.medicare,
        additionalRate: this.ficaTaxRates.additionalMedicare,
        additionalThreshold: this.additionalMedicareThreshold
      }
    };
    
    return {
      federalBrackets,
      stateTaxRates,
      ficaRates,
      filingStatus,
      state
    };
  }

  private getPayPeriodsPerYear(payFrequency: string): number {
    switch (payFrequency.toLowerCase()) {
      case 'weekly': return 52;
      case 'biweekly': return 26;
      case 'semimonthly': return 24;
      case 'monthly': return 12;
      case 'annually': return 1;
      default: return 26; // Default to biweekly
    }
  }

  private calculateFederalIncomeTax(annualIncome: number, filingStatus: string, allowances: number): number {
    // Get the correct tax brackets based on filing status
    const brackets = this.federalTaxBrackets[filingStatus] || this.federalTaxBrackets.single;
    
    // Apply a simple standard deduction based on filing status
    let standardDeduction = 0;
    switch (filingStatus) {
      case 'single': standardDeduction = 13850; break;
      case 'married': standardDeduction = 27700; break;
      case 'headOfHousehold': standardDeduction = 20800; break;
      default: standardDeduction = 13850;
    }
    
    // Apply allowances (simplified - $4,050 per allowance)
    const allowanceAmount = 4050 * allowances;
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, annualIncome - standardDeduction - allowanceAmount);
    
    // Calculate tax using brackets
    let tax = 0;
    let remainingIncome = taxableIncome;
    
    for (const bracket of brackets) {
      const min = bracket.min;
      const max = bracket.max === null ? Infinity : bracket.max;
      const rate = bracket.rate;
      
      if (remainingIncome <= 0) break;
      
      const taxableAmountInBracket = Math.min(remainingIncome, max - min);
      tax += taxableAmountInBracket * rate;
      remainingIncome -= taxableAmountInBracket;
    }
    
    return tax;
  }

  private calculateStateIncomeTax(annualIncome: number, state: string): number {
    // Get state rates
    const rates = this.stateTaxRates[state] || [];
    
    // If no rates (e.g., TX), return 0
    if (rates.length === 0) return 0;
    
    // Calculate state tax (simplified)
    let tax = 0;
    let remainingIncome = annualIncome;
    
    // Sort rates by threshold (lowest first)
    const sortedRates = [...rates].sort((a, b) => (a.threshold || 0) - (b.threshold || 0));
    
    for (const rate of sortedRates) {
      if (remainingIncome <= 0) break;
      
      const min = rate.threshold || 0;
      const max = rate.maxThreshold === null ? Infinity : (rate.maxThreshold || Infinity);
      
      if (annualIncome > min) {
        const taxableAmountInBracket = Math.min(remainingIncome, max - min);
        tax += taxableAmountInBracket * rate.rate;
        remainingIncome -= taxableAmountInBracket;
      }
    }
    
    return tax;
  }

  private calculateFICATaxes(gross: number, ytdEarnings: number, totalEarnings: number): { socialSecurity: number, medicare: number } {
    // Calculate Social Security tax (subject to wage cap)
    let socialSecurity = 0;
    if (ytdEarnings < this.socialSecurityWageCap) {
      const taxableAmount = Math.min(gross, this.socialSecurityWageCap - ytdEarnings);
      socialSecurity = taxableAmount * this.ficaTaxRates.socialSecurity;
    }
    
    // Calculate Medicare tax (regular + additional for high earners)
    let medicare = gross * this.ficaTaxRates.medicare;
    
    // Add Additional Medicare Tax for high earners
    if (totalEarnings > this.additionalMedicareThreshold && ytdEarnings < this.additionalMedicareThreshold) {
      const additionalTaxableAmount = totalEarnings - Math.max(ytdEarnings, this.additionalMedicareThreshold);
      if (additionalTaxableAmount > 0) {
        medicare += additionalTaxableAmount * this.ficaTaxRates.additionalMedicare;
      }
    } else if (ytdEarnings >= this.additionalMedicareThreshold) {
      medicare += gross * this.ficaTaxRates.additionalMedicare;
    }
    
    return { socialSecurity, medicare };
  }
}