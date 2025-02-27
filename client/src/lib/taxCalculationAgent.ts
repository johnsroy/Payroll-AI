import { BaseAgent, AgentConfig } from './baseAgent';

// Define tax rate and tax bracket interfaces
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
    socialSecurity: 0.062, // 6.2%
    medicare: 0.0145,      // 1.45%
    additionalMedicare: 0.009 // 0.9% additional Medicare tax for high earners
  };
  private socialSecurityWageCap = 168600; // 2024 value
  private additionalMedicareThreshold = 200000; // Individual threshold

  constructor(config: AgentConfig) {
    super({
      ...config,
      systemPrompt: `You are a tax calculation specialist for payroll processing. Your expertise is in calculating accurate tax withholdings, explaining tax regulations, and answering questions about payroll taxes.

Always provide accurate and up-to-date tax information. If you're unsure about specific rates or regulations, acknowledge the limitation and suggest where the user might find the most current information.

When calculating taxes:
1. Be precise with numbers and percentages
2. Show your work step-by-step
3. Explain which tax brackets and rates you're using
4. Consider federal, state, and FICA taxes where appropriate

Your goal is to help users understand their tax obligations and make informed decisions about payroll processing.`,
      tools: [
        {
          function: {
            name: "calculatePayrollTaxes",
            description: "Calculate payroll taxes based on income information",
            parameters: {
              type: "object",
              properties: {
                grossPay: {
                  type: "number",
                  description: "Gross pay amount for the period"
                },
                payFrequency: {
                  type: "string",
                  enum: ["weekly", "biweekly", "semimonthly", "monthly", "quarterly", "annually"],
                  description: "Pay frequency"
                },
                filingStatus: {
                  type: "string",
                  enum: ["single", "married", "head_of_household"],
                  description: "Federal filing status"
                },
                allowances: {
                  type: "number",
                  description: "Federal withholding allowances"
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
              required: ["grossPay", "payFrequency", "filingStatus", "state"]
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
                year: {
                  type: "number",
                  description: "Tax year (defaults to current year)"
                },
                includeLocalTaxes: {
                  type: "boolean",
                  description: "Whether to include local taxes if available"
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
      // In a real implementation, we might fetch this from a database or API
      // For now, we'll initialize with some default values
      this.initializeDefaultTaxData();
    } catch (error) {
      console.error('Error loading tax data:', error);
    }
  }

  private initializeDefaultTaxData(): void {
    // 2024 Federal tax brackets (simplified)
    this.federalTaxBrackets = {
      single: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11601, max: 47150, rate: 0.12 },
        { min: 47151, max: 100525, rate: 0.22 },
        { min: 100526, max: 191950, rate: 0.24 },
        { min: 191951, max: 243725, rate: 0.32 },
        { min: 243726, max: 609350, rate: 0.35 },
        { min: 609351, max: null, rate: 0.37 }
      ],
      married: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23201, max: 94300, rate: 0.12 },
        { min: 94301, max: 201050, rate: 0.22 },
        { min: 201051, max: 383900, rate: 0.24 },
        { min: 383901, max: 487450, rate: 0.32 },
        { min: 487451, max: 731200, rate: 0.35 },
        { min: 731201, max: null, rate: 0.37 }
      ],
      head_of_household: [
        { min: 0, max: 16550, rate: 0.10 },
        { min: 16551, max: 63100, rate: 0.12 },
        { min: 63101, max: 100500, rate: 0.22 },
        { min: 100501, max: 191950, rate: 0.24 },
        { min: 191951, max: 243700, rate: 0.32 },
        { min: 243701, max: 609350, rate: 0.35 },
        { min: 609351, max: null, rate: 0.37 }
      ]
    };

    // Sample state tax rates (simplified)
    this.stateTaxRates = {
      CA: [{ type: 'income', rate: 0.06 }],
      NY: [{ type: 'income', rate: 0.05 }],
      TX: [{ type: 'income', rate: 0 }], // No state income tax
      FL: [{ type: 'income', rate: 0 }], // No state income tax
      WA: [{ type: 'income', rate: 0 }], // No state income tax
      IL: [{ type: 'income', rate: 0.0495 }],
      PA: [{ type: 'income', rate: 0.0307 }]
    };
  }

  private async calculatePayrollTaxes(params: any): Promise<any> {
    const { grossPay, payFrequency, filingStatus, allowances = 0, state, ytdEarnings = 0 } = params;
    
    // Calculate annual income (estimated)
    const payPeriodsPerYear = this.getPayPeriodsPerYear(payFrequency);
    const estimatedAnnualIncome = grossPay * payPeriodsPerYear;
    
    // Calculate federal income tax
    const federalIncomeTax = this.calculateFederalIncomeTax(
      estimatedAnnualIncome, 
      filingStatus, 
      allowances
    ) / payPeriodsPerYear;
    
    // Calculate state income tax
    const stateIncomeTax = this.calculateStateIncomeTax(
      estimatedAnnualIncome, 
      state
    ) / payPeriodsPerYear;
    
    // Calculate FICA taxes
    const totalEarnings = ytdEarnings + grossPay;
    const ficaTaxes = this.calculateFICATaxes(grossPay, ytdEarnings, totalEarnings);
    
    // Calculate net pay
    const totalTax = federalIncomeTax + stateIncomeTax + ficaTaxes.socialSecurity + ficaTaxes.medicare;
    const netPay = grossPay - totalTax;
    
    return {
      grossPay,
      federalIncomeTax: parseFloat(federalIncomeTax.toFixed(2)),
      stateIncomeTax: parseFloat(stateIncomeTax.toFixed(2)),
      socialSecurityTax: parseFloat(ficaTaxes.socialSecurity.toFixed(2)),
      medicareTax: parseFloat(ficaTaxes.medicare.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      netPay: parseFloat(netPay.toFixed(2))
    };
  }

  private async getTaxRates(params: any): Promise<any> {
    const { state, year = new Date().getFullYear(), includeLocalTaxes = false } = params;
    
    const federalRates = this.federalTaxBrackets;
    const stateRates = this.stateTaxRates[state] || [];
    const ficaRates = {
      socialSecurity: {
        rate: this.ficaTaxRates.socialSecurity,
        wageCap: this.socialSecurityWageCap
      },
      medicare: {
        rate: this.ficaTaxRates.medicare,
        additionalRate: this.ficaTaxRates.additionalMedicare,
        additionalThreshold: this.additionalMedicareThreshold
      }
    };
    
    // For a real implementation, we might include local tax rates here
    const localRates = includeLocalTaxes ? [] : undefined;
    
    return {
      year,
      federal: federalRates,
      state: {
        code: state,
        rates: stateRates
      },
      fica: ficaRates,
      local: localRates
    };
  }

  private getPayPeriodsPerYear(payFrequency: string): number {
    switch (payFrequency.toLowerCase()) {
      case 'weekly': return 52;
      case 'biweekly': return 26;
      case 'semimonthly': return 24;
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'annually': return 1;
      default: return 26; // Default to biweekly
    }
  }

  private calculateFederalIncomeTax(annualIncome: number, filingStatus: string, allowances: number): number {
    // Apply a simplified allowance deduction
    const allowanceValue = 4300; // 2024 value (simplified)
    const taxableIncome = Math.max(0, annualIncome - (allowances * allowanceValue));
    
    // Get the applicable tax brackets
    const brackets = this.federalTaxBrackets[filingStatus as keyof typeof this.federalTaxBrackets] || this.federalTaxBrackets.single;
    
    // Calculate tax using brackets
    let tax = 0;
    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const lowerBound = bracket.min;
      const upperBound = bracket.max === null ? Infinity : bracket.max;
      
      if (taxableIncome > lowerBound) {
        const taxableInThisBracket = Math.min(taxableIncome, upperBound) - lowerBound;
        tax += taxableInThisBracket * bracket.rate;
      }
      
      if (taxableIncome <= upperBound) {
        break;
      }
    }
    
    return tax;
  }

  private calculateStateIncomeTax(annualIncome: number, state: string): number {
    const stateRates = this.stateTaxRates[state];
    
    if (!stateRates) {
      return 0; // Default to 0 if state not found
    }
    
    // Find the income tax rate
    const incomeTaxRate = stateRates.find(rate => rate.type === 'income');
    
    if (!incomeTaxRate) {
      return 0;
    }
    
    // For simplicity, we're applying a flat tax rate
    // In a real implementation, we would apply brackets similar to federal
    return annualIncome * incomeTaxRate.rate;
  }

  private calculateFICATaxes(gross: number, ytdEarnings: number, totalEarnings: number): { socialSecurity: number, medicare: number } {
    // Calculate Social Security withholding
    let socialSecurity = 0;
    if (ytdEarnings < this.socialSecurityWageCap) {
      const taxableSS = Math.min(gross, this.socialSecurityWageCap - ytdEarnings);
      socialSecurity = taxableSS * this.ficaTaxRates.socialSecurity;
    }
    
    // Calculate Medicare withholding
    let medicare = gross * this.ficaTaxRates.medicare;
    
    // Additional Medicare Tax for high earners
    if (totalEarnings > this.additionalMedicareThreshold && ytdEarnings < this.additionalMedicareThreshold) {
      const additionalTaxable = totalEarnings - this.additionalMedicareThreshold;
      medicare += additionalTaxable * this.ficaTaxRates.additionalMedicare;
    } else if (ytdEarnings > this.additionalMedicareThreshold) {
      medicare += gross * this.ficaTaxRates.additionalMedicare;
    }
    
    return { socialSecurity, medicare };
  }
}