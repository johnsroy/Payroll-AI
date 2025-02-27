import { BaseAgent, AgentConfig } from './baseAgent';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  taxDeductible: boolean;
  examples: string[];
  tags: string[];
}

interface CategorizationResult {
  id: string;
  query: string;
  result: any;
  timestamp: Date;
  confidence: number;
}

export class ExpenseCategorizationAgent extends BaseAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;
  private model: string = 'claude-3-sonnet-20240229';
  private temperature: number = 0.2;
  private expenseCategories: Map<string, ExpenseCategory> = new Map();
  private categorizationResults: CategorizationResult[] = [];
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Initialize Anthropic client with API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for ExpenseCategorizationAgent');
    }
    
    this.anthropic = new Anthropic({
      apiKey
    });
    
    // Set up system prompt for expense categorization agent
    this.systemPrompt = `You are an advanced expense categorization agent in a multi-agent system for payroll management.
Your primary responsibilities are:

1. Categorize business expenses accurately for accounting and tax purposes
2. Determine tax deductibility of expenses based on IRS guidelines
3. Identify and flag unusual or potentially problematic expenses
4. Provide guidance on expense documentation requirements
5. Analyze spending patterns and suggest optimization opportunities

You specialize in:
- Business travel expenses (transportation, lodging, meals)
- Office and administrative expenses
- Professional services and contractor payments
- Equipment and technology purchases
- Marketing and advertising expenses
- Training and education expenses

When responding, always:
- Explain the reasoning behind your categorization
- Indicate tax implications of the expense
- Specify documentation requirements for the expense type
- Highlight any compliance concerns
- Suggest relevant expense policies or best practices`;

    // Initialize expense categories database
    this.initializeExpenseCategories();
  }

  /**
   * Reset the agent state
   */
  public reset(): void {
    this.categorizationResults = [];
    this.initializeExpenseCategories();
  }

  /**
   * Process a query using the expense categorization agent
   */
  public async processQuery(query: string): Promise<{ response: string; confidence: number; metadata?: any }> {
    // Identify relevant expense categories for the query
    const relevantCategories = this.identifyRelevantCategories(query);
    
    // Create a categorization prompt based on the query and relevant categories
    const categorizationPrompt = this.createCategorizationPrompt(query, relevantCategories);
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: categorizationPrompt
        }
      ]
    });
    
    // Extract response
    const content = response.content[0];
    const assistantMessage = typeof content === 'object' && 'text' in content 
      ? content.text 
      : JSON.stringify(content);
    
    // Store categorization result
    const categorizationResult = this.createCategorizationResult(query, assistantMessage);
    this.storeCategorizationResult(categorizationResult);
    
    return {
      response: assistantMessage,
      confidence: categorizationResult.confidence,
      metadata: {
        categoryIds: relevantCategories.map(cat => cat.id),
        resultId: categorizationResult.id
      }
    };
  }

  /**
   * Initialize expense categories database
   */
  private initializeExpenseCategories(): void {
    // Travel expenses
    const travelCategory: ExpenseCategory = {
      id: 'travel',
      name: 'Travel Expenses',
      description: 'Costs incurred while traveling for business purposes',
      taxDeductible: true,
      examples: [
        'Airfare',
        'Hotel accommodations',
        'Rental cars',
        'Taxis and rideshares',
        'Train tickets'
      ],
      tags: ['travel', 'transportation', 'lodging', 'business trip', 'airfare', 'hotel']
    };
    
    // Meals and entertainment
    const mealsCategory: ExpenseCategory = {
      id: 'meals',
      name: 'Meals and Entertainment',
      description: 'Business-related food, beverage, and entertainment expenses',
      taxDeductible: true,
      examples: [
        'Client dinners',
        'Business lunches',
        'Team meals',
        'Conference catering',
        'Entertainment for business purposes'
      ],
      tags: ['meals', 'food', 'restaurant', 'dining', 'entertainment', 'client']
    };
    
    // Office supplies
    const officeSuppliesCategory: ExpenseCategory = {
      id: 'office_supplies',
      name: 'Office Supplies',
      description: 'Consumable items used in day-to-day office operations',
      taxDeductible: true,
      examples: [
        'Paper',
        'Pens and markers',
        'Staplers and paper clips',
        'Printer ink and toner',
        'Notebooks and folders'
      ],
      tags: ['office', 'supplies', 'stationery', 'consumables', 'paper', 'ink']
    };
    
    // Technology
    const technologyCategory: ExpenseCategory = {
      id: 'technology',
      name: 'Technology and Equipment',
      description: 'Hardware, software, and tech services for business use',
      taxDeductible: true,
      examples: [
        'Computers and laptops',
        'Smartphones and tablets',
        'Software subscriptions',
        'Printers and scanners',
        'Cloud storage services'
      ],
      tags: ['technology', 'equipment', 'hardware', 'software', 'subscription', 'digital']
    };
    
    // Professional services
    const professionalServicesCategory: ExpenseCategory = {
      id: 'professional_services',
      name: 'Professional Services',
      description: 'Fees paid to external professionals for specialized services',
      taxDeductible: true,
      examples: [
        'Legal fees',
        'Accounting services',
        'Consulting fees',
        'Freelancer payments',
        'Professional memberships'
      ],
      tags: ['professional', 'services', 'consultant', 'legal', 'accounting', 'freelancer']
    };
    
    // Marketing and advertising
    const marketingCategory: ExpenseCategory = {
      id: 'marketing',
      name: 'Marketing and Advertising',
      description: 'Costs associated with promoting the business and its products/services',
      taxDeductible: true,
      examples: [
        'Online advertising',
        'Print advertisements',
        'Marketing materials',
        'Trade show expenses',
        'Social media promotions'
      ],
      tags: ['marketing', 'advertising', 'promotion', 'branding', 'ads', 'media']
    };
    
    // Training and education
    const trainingCategory: ExpenseCategory = {
      id: 'training',
      name: 'Training and Education',
      description: 'Expenses related to professional development and employee training',
      taxDeductible: true,
      examples: [
        'Conference registration fees',
        'Workshop costs',
        'Online courses',
        'Educational books and materials',
        'Professional certification expenses'
      ],
      tags: ['training', 'education', 'learning', 'development', 'conference', 'workshop']
    };
    
    // Rent and utilities
    const rentUtilitiesCategory: ExpenseCategory = {
      id: 'rent_utilities',
      name: 'Rent and Utilities',
      description: 'Office space costs and associated utility expenses',
      taxDeductible: true,
      examples: [
        'Office rent',
        'Electricity',
        'Water',
        'Internet service',
        'Phone service'
      ],
      tags: ['rent', 'lease', 'utilities', 'office space', 'internet', 'electricity']
    };
    
    // Insurance
    const insuranceCategory: ExpenseCategory = {
      id: 'insurance',
      name: 'Insurance',
      description: 'Business insurance premiums and related costs',
      taxDeductible: true,
      examples: [
        'General liability insurance',
        'Professional liability insurance',
        'Property insurance',
        'Workers\' compensation insurance',
        'Health insurance'
      ],
      tags: ['insurance', 'policy', 'premium', 'coverage', 'liability', 'protection']
    };
    
    // Vehicle expenses
    const vehicleCategory: ExpenseCategory = {
      id: 'vehicle',
      name: 'Vehicle Expenses',
      description: 'Costs associated with business use of vehicles',
      taxDeductible: true,
      examples: [
        'Mileage reimbursement',
        'Fuel',
        'Vehicle maintenance',
        'Car insurance (business portion)',
        'Parking fees'
      ],
      tags: ['vehicle', 'car', 'automobile', 'mileage', 'transportation', 'fuel']
    };
    
    // Store all expense categories
    this.expenseCategories.set(travelCategory.id, travelCategory);
    this.expenseCategories.set(mealsCategory.id, mealsCategory);
    this.expenseCategories.set(officeSuppliesCategory.id, officeSuppliesCategory);
    this.expenseCategories.set(technologyCategory.id, technologyCategory);
    this.expenseCategories.set(professionalServicesCategory.id, professionalServicesCategory);
    this.expenseCategories.set(marketingCategory.id, marketingCategory);
    this.expenseCategories.set(trainingCategory.id, trainingCategory);
    this.expenseCategories.set(rentUtilitiesCategory.id, rentUtilitiesCategory);
    this.expenseCategories.set(insuranceCategory.id, insuranceCategory);
    this.expenseCategories.set(vehicleCategory.id, vehicleCategory);
  }

  /**
   * Identify relevant expense categories for a given query
   */
  private identifyRelevantCategories(query: string): ExpenseCategory[] {
    const queryLower = query.toLowerCase();
    const relevantCategories: ExpenseCategory[] = [];
    
    // Travel relevance
    if (
      queryLower.includes('travel') ||
      queryLower.includes('trip') ||
      queryLower.includes('flight') ||
      queryLower.includes('hotel') ||
      queryLower.includes('airfare') ||
      queryLower.includes('taxi') ||
      queryLower.includes('uber') ||
      queryLower.includes('lyft')
    ) {
      const travelCategory = this.expenseCategories.get('travel');
      if (travelCategory) relevantCategories.push(travelCategory);
    }
    
    // Meals relevance
    if (
      queryLower.includes('meal') ||
      queryLower.includes('food') ||
      queryLower.includes('restaurant') ||
      queryLower.includes('dinner') ||
      queryLower.includes('lunch') ||
      queryLower.includes('breakfast') ||
      queryLower.includes('entertainment')
    ) {
      const mealsCategory = this.expenseCategories.get('meals');
      if (mealsCategory) relevantCategories.push(mealsCategory);
    }
    
    // Office supplies relevance
    if (
      queryLower.includes('office') ||
      queryLower.includes('supplies') ||
      queryLower.includes('paper') ||
      queryLower.includes('stationery') ||
      queryLower.includes('ink') ||
      queryLower.includes('toner')
    ) {
      const officeSuppliesCategory = this.expenseCategories.get('office_supplies');
      if (officeSuppliesCategory) relevantCategories.push(officeSuppliesCategory);
    }
    
    // Technology relevance
    if (
      queryLower.includes('computer') ||
      queryLower.includes('laptop') ||
      queryLower.includes('software') ||
      queryLower.includes('hardware') ||
      queryLower.includes('subscription') ||
      queryLower.includes('tech') ||
      queryLower.includes('equipment')
    ) {
      const technologyCategory = this.expenseCategories.get('technology');
      if (technologyCategory) relevantCategories.push(technologyCategory);
    }
    
    // Professional services relevance
    if (
      queryLower.includes('service') ||
      queryLower.includes('consultant') ||
      queryLower.includes('legal') ||
      queryLower.includes('lawyer') ||
      queryLower.includes('accounting') ||
      queryLower.includes('professional') ||
      queryLower.includes('freelancer')
    ) {
      const professionalServicesCategory = this.expenseCategories.get('professional_services');
      if (professionalServicesCategory) relevantCategories.push(professionalServicesCategory);
    }
    
    // Marketing relevance
    if (
      queryLower.includes('marketing') ||
      queryLower.includes('advertising') ||
      queryLower.includes('promotion') ||
      queryLower.includes('branding') ||
      queryLower.includes('ad') ||
      queryLower.includes('social media')
    ) {
      const marketingCategory = this.expenseCategories.get('marketing');
      if (marketingCategory) relevantCategories.push(marketingCategory);
    }
    
    // Training relevance
    if (
      queryLower.includes('training') ||
      queryLower.includes('education') ||
      queryLower.includes('conference') ||
      queryLower.includes('workshop') ||
      queryLower.includes('course') ||
      queryLower.includes('certification')
    ) {
      const trainingCategory = this.expenseCategories.get('training');
      if (trainingCategory) relevantCategories.push(trainingCategory);
    }
    
    // Rent and utilities relevance
    if (
      queryLower.includes('rent') ||
      queryLower.includes('lease') ||
      queryLower.includes('office space') ||
      queryLower.includes('utility') ||
      queryLower.includes('electric') ||
      queryLower.includes('internet') ||
      queryLower.includes('phone')
    ) {
      const rentUtilitiesCategory = this.expenseCategories.get('rent_utilities');
      if (rentUtilitiesCategory) relevantCategories.push(rentUtilitiesCategory);
    }
    
    // Insurance relevance
    if (
      queryLower.includes('insurance') ||
      queryLower.includes('policy') ||
      queryLower.includes('premium') ||
      queryLower.includes('coverage') ||
      queryLower.includes('liability')
    ) {
      const insuranceCategory = this.expenseCategories.get('insurance');
      if (insuranceCategory) relevantCategories.push(insuranceCategory);
    }
    
    // Vehicle relevance
    if (
      queryLower.includes('vehicle') ||
      queryLower.includes('car') ||
      queryLower.includes('mileage') ||
      queryLower.includes('fuel') ||
      queryLower.includes('gas') ||
      queryLower.includes('parking')
    ) {
      const vehicleCategory = this.expenseCategories.get('vehicle');
      if (vehicleCategory) relevantCategories.push(vehicleCategory);
    }
    
    // If no specific relevance is found, return all categories
    if (relevantCategories.length === 0) {
      return Array.from(this.expenseCategories.values());
    }
    
    return relevantCategories;
  }

  /**
   * Create a categorization prompt based on the query and relevant categories
   */
  private createCategorizationPrompt(query: string, relevantCategories: ExpenseCategory[]): string {
    let prompt = `I need help with the following expense categorization query:\n\n"${query}"\n\n`;
    
    prompt += "Here are the relevant expense categories to consider:\n\n";
    
    relevantCategories.forEach(category => {
      prompt += `== ${category.name.toUpperCase()} ==\n`;
      prompt += `Description: ${category.description}\n`;
      prompt += `Tax Deductible: ${category.taxDeductible ? 'Yes' : 'No'}\n`;
      prompt += `Examples: ${category.examples.join(', ')}\n\n`;
    });
    
    prompt += `Please analyze this query and provide guidance on expense categorization. Your response should:

1. Identify the most appropriate expense category (or categories) for the described expense
2. Explain why this categorization is correct, referencing specific aspects of the expense
3. Provide information about tax deductibility and any applicable limitations
4. Describe the documentation required to support this expense for accounting and tax purposes
5. Offer any relevant best practices or policies related to this type of expense

If there's ambiguity in the query or multiple possible categorizations, please explain the different options and their implications. If you need additional information to make a proper categorization, indicate what details would be helpful.`;
    
    return prompt;
  }

  /**
   * Create a categorization result object
   */
  private createCategorizationResult(query: string, response: string): CategorizationResult {
    // Calculate confidence based on the response
    const confidence = this.calculateConfidence(response);
    
    // Create and return categorization result
    return {
      id: uuidv4(),
      query,
      result: response,
      timestamp: new Date(),
      confidence
    };
  }

  /**
   * Store a categorization result
   */
  private storeCategorizationResult(result: CategorizationResult): void {
    this.categorizationResults.push(result);
    
    // Limit the number of stored results
    if (this.categorizationResults.length > 100) {
      this.categorizationResults.shift();  // Remove oldest result
    }
  }

  /**
   * Calculate confidence based on the response
   */
  private calculateConfidence(response: string): number {
    // Start with a baseline confidence
    let confidence = 0.7;
    
    // Specific categorization increases confidence
    if (
      response.includes('categorize this as') || 
      response.includes('this expense falls under') || 
      response.includes('appropriate category')
    ) {
      confidence += 0.1;
    }
    
    // Tax guidance increases confidence
    if (
      response.includes('tax deductible') || 
      response.includes('tax implications') || 
      response.includes('IRS')
    ) {
      confidence += 0.1;
    }
    
    // Documentation guidance increases confidence
    if (
      response.includes('documentation') || 
      response.includes('receipt') || 
      response.includes('record') || 
      response.includes('proof')
    ) {
      confidence += 0.1;
    }
    
    // Uncertainty language decreases confidence
    const uncertaintyPatterns = ["may", "might", "could be", "possibly", "unclear", "ambiguous", "additional information needed"];
    const uncertaintyCount = uncertaintyPatterns.reduce((count, pattern) => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      return count + (response.match(regex) || []).length;
    }, 0);
    
    confidence -= Math.min(0.3, uncertaintyCount * 0.05);
    
    // Ensure confidence stays within [0, 1] range
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get an expense category by ID
   */
  public getExpenseCategory(id: string): ExpenseCategory | undefined {
    return this.expenseCategories.get(id);
  }

  /**
   * Get all expense categories
   */
  public getAllExpenseCategories(): ExpenseCategory[] {
    return Array.from(this.expenseCategories.values());
  }

  /**
   * Get all categorization results
   */
  public getCategorizationResults(): CategorizationResult[] {
    return this.categorizationResults;
  }
}