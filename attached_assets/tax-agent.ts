import { BaseAgent, AgentConfig } from './baseAgent';
import { supabase } from '../supabase';

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
    additionalMedicare: 0.009 // For income above threshold
  };
  private socialSecurityWageCap = 168600; // 2024 value
  private additionalMedicareThreshold = 200000; // Individual threshold

  constructor(config: AgentConfig) {
    // Define comprehensive system prompt for tax calculations
    const taxSystemPrompt = `You are an expert tax calculation assistant for payroll processing.
Your primary responsibilities include:
1. Calculating accurate federal, state, and local income tax withholdings
2. Determining correct FICA taxes (Social Security and Medicare)
3. Handling special tax situations like multi-state taxation
4. Explaining tax calculations clearly to users

Always show your calculations step-by-step and cite relevant tax codes when applicable.
For complex scenarios, break down the process into smaller, logical steps.
Be precise with calculations and round to the nearest cent as required by tax regulations.

When uncertain about specific state or local tax rates, clarify that you're using estimated rates 
and recommend verification with the latest tax tables or a tax professional.`;

    // Define tools for the tax agent
    const taxTools = [
      {
        type: 'function',
        function: {
          name: 'calculate_payroll_taxes',
          description: 'Calculate payroll taxes based on income and location information',
          parameters: {
            type: 'object',
            properties: {
              gross_income: {
                type: 'number',
                description: 'Gross income amount for the pay period'
              },
              pay_frequency: {
                type: 'string',
                enum: ['weekly', 'biweekly', 'semimonthly', 'monthly'],
                description: 'How often the employee is paid'
              },
              filing_status: {
                type: 'string',
                enum: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'],
                description: 'Federal tax filing status'
              },
              allowances: {
                type: 'number',
                description: 'Number of withholding allowances claimed'
              },
              state: {
                type: 'string',
                description: 'State code (e.g., CA, NY, TX)'
              },
              year: {
                type: 'number',
                description: 'Tax year for the calculation'
              },
              ytd_earnings: {
                type: 'number',
                description: 'Year-to-date earnings before this pay period'
              }
            },
            required: ['gross_income', 'pay_frequency', 'filing_status', 'state']
          }
        },
        handler: this.calculatePayrollTaxes.bind(this)
      },
      {
        type: 'function',
        function: {
          name: 'get_tax_rates',
          description: 'Get current tax rates for a specific state',
          parameters: {
            type: 'object',
            properties: {
              state: {
                type: 'string',
                description: 'State code (e.g., CA, NY, TX)'
              },
              year: {
                type: 'number',
                description: 'Tax year for which to retrieve rates'
              }
            },
            required: ['state']
          }
        },
        handler: this.getTaxRates.bind(this)
      }
    ];

    // Initialize the agent with tax-specific configuration
    super({
      ...config,
      systemPrompt: taxSystemPrompt,
      tools: taxTools,
      temperature: 0.1 // Lower temperature for more deterministic responses on tax matters
    });

    // Load tax data
    this.loadTaxData();
  }

  // Load tax brackets and rates from the database or initialize with defaults
  private async loadTaxData(): Promise<void> {
    try {
      // Try to load from database
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('content, metadata')
        .eq('category', 'tax_rates')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        // Use default values if not found in database
        this.initializeDefaultTaxData();
        return;
      }

      const taxData = JSON.parse(data[0].content);
      this.federalTaxBrackets = taxData.federalTaxBrackets || {};
      this.stateTaxRates = taxData.stateTaxRates || {};
      if (taxData.ficaTaxRates) this.ficaTaxRates = taxData.ficaTaxRates;
      if (taxData.socialSecurityWageCap) this.socialSecurityWageCap = taxData.socialSecurityWageCap;
      if (taxData.additionalMedicareThreshold) this.additionalMedicareThreshold = taxData.additionalMedicareThreshold;
    } catch (error) {
      console.error('Error loading tax data:', error);
      this.initializeDefaultTaxData();
    }
  }

  // Initialize with some default tax data (for 2024)
  private initializeDefaultTaxData(): void {
    // 2024 Federal tax brackets (simplified)
    this.federalTaxBrackets = {
      single: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: null, rate: 0.37 }
      ],
      married_filing_jointly: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: null, rate: 0.37 }
      ],
      // Additional brackets would be added for other filing statuses
    };

    // Sample state tax rates (simplified)
    this.stateTaxRates = {
      CA: [
        { type: 'income', rate: 0.01, threshold: 0 },
        { type: 'income', rate: 0.02, threshold: 10099 },
        { type: 'income', rate: 0.04, threshold: 23942 },
        { type: 'income', rate: 0.06, threshold: 37788 },
        { type: 'income', rate: 0.08, threshold: 52455 },
        { type: 'income', rate: 0.093, threshold: 66295 },
        { type: 'income', rate: 0.103, threshold: 338639 },
        { type: 'income', rate: 0.113, threshold: 406364 },
        { type: 'income', rate: 0.123, threshold: 677275 },
        { type: 'income', rate: 0.133, threshold: 1000000 }
      ],
      NY: [
        { type: 'income', rate: 0.04, threshold: 0 },
        { type: 'income', rate: 0.045, threshold: 8500 },
        { type: 'income', rate: 0.0525, threshold: 11700 },
        { type: 'income', rate: 0.0585, threshold: 13900 },
        { type: 'income', rate: 0.0625, threshold: 80650 },
        { type: 'income', rate: 0.0685, threshold: 215400 },
        { type: 'income', rate: 0.0965, threshold: 1077550 },
        { type: 'income', rate: 0.103, threshold: 5000000 },
        { type: 'income', rate: 0.109, threshold: 25000000 }
      ],
      TX: [
        // Texas has no state income tax
      ]
      // Additional states would be added
    };
  }

  // Handler for calculate_payroll_taxes tool
  private async calculatePayrollTaxes(params: any): Promise<any> {
    const {
      gross_income,
      pay_frequency,
      filing_status,
      allowances = 0,
      state,
      year = new Date().getFullYear(),
      ytd_earnings = 0
    } = params;

    // Calculate annualized income based on pay frequency
    const payPeriodsPerYear = this.getPayPeriodsPerYear(pay_frequency);
    const annualizedIncome = gross_income * payPeriodsPerYear;
    
    // Calculate federal income tax
    const federalTax = this.calculateFederalIncomeTax(
      annualizedIncome,
      filing_status,
      allowances
    ) / payPeriodsPerYear;
    
    // Calculate state income tax
    const stateTax = this.calculateStateIncomeTax(
      annualizedIncome,
      state
    ) / payPeriodsPerYear;
    
    // Calculate FICA taxes
    const totalEarningsAfterThisPeriod = ytd_earnings + gross_income;
    const ficaTaxes = this.calculateFICATaxes(
      gross_income,
      ytd_earnings,
      totalEarningsAfterThisPeriod
    );
    
    // Calculate net pay
    const totalTaxes = federalTax + stateTax + ficaTaxes.socialSecurity + ficaTaxes.medicare;
    const netPay = gross_income - totalTaxes;
    
    return {
      gross_income: gross_income,
      federal_income_tax: parseFloat(federalTax.toFixed(2)),
      state_income_tax: parseFloat(stateTax.toFixed(2)),
      social_security_tax: parseFloat(ficaTaxes.socialSecurity.toFixed(2)),
      medicare_tax: parseFloat(ficaTaxes.medicare.toFixed(2)),
      total_taxes: parseFloat(totalTaxes.toFixed(2)),
      net_pay: parseFloat(netPay.toFixed(2)),
      annual_projection: {
        gross_income: annualizedIncome,
        federal_income_tax: parseFloat((federalTax * payPeriodsPerYear).toFixed(2)),
        state_income_tax: parseFloat((stateTax * payPeriodsPerYear).toFixed(2)),
        social_security_tax: parseFloat((ficaTaxes.socialSecurity * payPeriodsPerYear).toFixed(2)),
        medicare_tax: parseFloat((ficaTaxes.medicare * payPeriodsPerYear).toFixed(2))
      }
    };
  }

  // Handler for get_tax_rates tool
  private async getTaxRates(params: any): Promise<any> {
    const { state, year = new Date().getFullYear() } = params;
    
    const stateRates = this.stateTaxRates[state] || [];
    
    return {
      state,
      year,
      has_income_tax: stateRates.length > 0,
      rates: stateRates,
      fica_rates: {
        social_security: this.ficaTaxRates.socialSecurity,
        social_security_wage_cap: this.socialSecurityWageCap,
        medicare: this.ficaTaxRates.medicare,
        additional_medicare: this.ficaTaxRates.additionalMedicare,
        additional_medicare_threshold: this.additionalMedicareThreshold
      }
    };
  }

  // Helper method to determine pay periods per year
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
      default:
        return 26; // Default to biweekly if not specified
    }
  }

  // Calculate federal income tax
  private calculateFederalIncomeTax(annualIncome: number, filingStatus: string, allowances: number): number {
    // Standard deduction and allowance adjustments would be applied here
    const brackets = this.federalTaxBrackets[filingStatus] || this.federalTaxBrackets.single;
    
    // Simple tax calculation based on brackets
    let tax = 0;
    let remainingIncome = annualIncome;
    
    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      
      const bracketMin = bracket.min;
      const bracketMax = bracket.max === null ? Infinity : bracket.max;
      const rate = bracket.rate;
      
      const taxableInBracket = Math.min(remainingIncome, bracketMax - bracketMin);
      
      if (taxableInBracket > 0) {
        tax += taxableInBracket * rate;
        remainingIncome -= taxableInBracket;
      }
    }
    
    // Apply allowances (simplified)
    const allowanceValue = 4300; // 2024 approximate value per allowance
    const allowanceReduction = allowances * allowanceValue * 0.12; // Simplified adjustment
    
    return Math.max(0, tax - allowanceReduction);
  }

  // Calculate state income tax
  private calculateStateIncomeTax(annualIncome: number, state: string): number {
    const stateRates = this.stateTaxRates[state] || [];
    
    if (stateRates.length === 0) {
      return 0; // No state income tax
    }
    
    // Find applicable rate based on income thresholds
    let tax = 0;
    let previousThreshold = 0;
    
    // Sort by threshold to ensure correct calculation
    const sortedRates = [...stateRates].sort((a, b) => (a.threshold || 0) - (b.threshold || 0));
    
    for (let i = 0; i < sortedRates.length; i++) {
      const rate = sortedRates[i];
      const nextThreshold = i < sortedRates.length - 1 
        ? sortedRates[i + 1].threshold || Infinity
        : Infinity;
      
      const incomeInBracket = Math.min(
        annualIncome - (rate.threshold || 0),
        nextThreshold - (rate.threshold || 0)
      );
      
      if (incomeInBracket > 0) {
        tax += incomeInBracket * rate.rate;
      }
      
      if ((rate.threshold || 0) > annualIncome) break;
    }
    
    return tax;
  }

  // Calculate FICA taxes (Social Security and Medicare)
  private calculateFICATaxes(gross: number, ytdEarnings: number, totalEarnings: number): { socialSecurity: number, medicare: number } {
    // Social Security tax (subject to wage cap)
    let socialSecurityTax = 0;
    
    if (ytdEarnings < this.socialSecurityWageCap) {
      const taxableAmount = Math.min(gross, this.socialSecurityWageCap - ytdEarnings);
      socialSecurityTax = taxableAmount * this.ficaTaxRates.socialSecurity;
    }
    
    // Medicare tax (no wage cap, but additional tax above threshold)
    let medicareTax = gross * this.ficaTaxRates.medicare;
    
    // Additional Medicare tax for high earners
    if (ytdEarnings < this.additionalMedicareThreshold && totalEarnings > this.additionalMedicareThreshold) {
      const amountOverThreshold = totalEarnings - this.additionalMedicareThreshold;
      medicareTax += amountOverThreshold * this.ficaTaxRates.additionalMedicare;
    } else if (ytdEarnings >= this.additionalMedicareThreshold) {
      medicareTax += gross * this.ficaTaxRates.additionalMedicare;
    }
    
    return {
      socialSecurity: socialSecurityTax,
      medicare: medicareTax
    };
  }
}
