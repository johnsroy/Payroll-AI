import { BaseAgent, AgentResponse, Message } from './baseAgent';
import { anthropic } from './anthropic';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Expense category definition
 */
interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  tax_deductible: boolean;
  examples: string[];
  tags: string[];
  parent_category_id?: string;
  company_id?: string;
}

/**
 * Expense rule for category matching
 */
interface ExpenseRule {
  id: string;
  category_id: string;
  keywords: string[];
  confidence: number;
  company_id?: string;
}

/**
 * Categorization result
 */
interface CategorizationResult {
  id: string;
  query: string;
  result: any;
  timestamp: Date;
  confidence: number;
  user_id?: string;
  company_id?: string;
}

/**
 * Expense Categorization Agent specializes in categorizing and analyzing expenses
 */
export class ExpenseCategorizationAgent extends BaseAgent {
  private standardCategories: ExpenseCategory[] = [];
  private customCategories: ExpenseCategory[] = [];
  private categorizationRules: ExpenseRule[] = [];
  private taxGuidelines: Record<string, string> = {};
  
  // Tool definitions
  private expenseTools = [
    {
      name: "categorize_expense",
      description: "Categorize an expense based on description and amount",
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "Description of the expense"
          },
          amount: {
            type: "number",
            description: "Amount of the expense"
          },
          vendor: {
            type: "string",
            description: "Vendor or merchant name"
          },
          date: {
            type: "string",
            description: "Date of the expense (YYYY-MM-DD)"
          },
          include_tax_notes: {
            type: "boolean",
            description: "Whether to include tax deductibility notes"
          }
        },
        required: ["description"]
      }
    },
    {
      name: "get_expense_categories",
      description: "Get available expense categories",
      parameters: {
        type: "object",
        properties: {
          include_custom: {
            type: "boolean",
            description: "Whether to include custom categories"
          },
          only_tax_deductible: {
            type: "boolean",
            description: "Whether to only return tax-deductible categories"
          },
          parent_category_id: {
            type: "string",
            description: "ID of parent category to filter by"
          }
        }
      }
    },
    {
      name: "create_custom_category",
      description: "Create a new custom expense category",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the new category"
          },
          description: {
            type: "string",
            description: "Description of the category"
          },
          tax_deductible: {
            type: "boolean",
            description: "Whether expenses in this category are tax-deductible"
          },
          examples: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Example expenses that belong in this category"
          },
          tags: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Tags associated with this category"
          },
          parent_category_id: {
            type: "string",
            description: "ID of parent category if this is a subcategory"
          }
        },
        required: ["name", "tax_deductible"]
      }
    }
  ];
  
  constructor(config: any = {}) {
    // Define expense tools before the super call
    const expenseTools = [
      {
        name: "categorize_expense",
        description: "Categorize an expense based on its description and amount",
        parameters: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Description of the expense"
            },
            amount: {
              type: "number",
              description: "Amount of the expense"
            },
            vendor: {
              type: "string",
              description: "Vendor or merchant name"
            },
            date: {
              type: "string",
              description: "Date of the expense (YYYY-MM-DD format)"
            }
          },
          required: ["description"]
        }
      },
      {
        name: "get_expense_categories",
        description: "Get available expense categories",
        parameters: {
          type: "object",
          properties: {
            tax_deductible_only: {
              type: "boolean",
              description: "If true, return only tax deductible categories"
            },
            business_type: {
              type: "string",
              description: "Business type for filtering categories"
            }
          },
          required: []
        }
      },
      {
        name: "create_custom_category",
        description: "Create a new custom expense category",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the new category"
            },
            description: {
              type: "string",
              description: "Description of the category"
            },
            tax_deductible: {
              type: "boolean",
              description: "Whether expenses in this category are tax deductible"
            }
          },
          required: ["name", "tax_deductible"]
        }
      }
    ];
    
    super({
      name: config.name || "Expense Categorization Agent",
      systemPrompt: config.systemPrompt || 
        `You are the Expense Categorization Agent, specialized in categorizing and analyzing business expenses.
        
Your capabilities include:
1. Categorizing expenses based on descriptions and vendors
2. Providing information about tax deductibility of expenses
3. Creating and managing expense categories
4. Identifying potential tax savings opportunities
5. Answering questions about expense management best practices

Always prioritize accurate categorization. When uncertain about a specific expense category, suggest the most likely category while indicating your uncertainty.

For tax deductibility information, be clear about the general principles while acknowledging that specific tax treatment varies by jurisdiction and business structure.`,
      model: config.model || 'claude-3-7-sonnet-20250219',
      temperature: config.temperature !== undefined ? config.temperature : 0.2,
      maxTokens: config.maxTokens || 1500,
      tools: config.tools || expenseTools,
      memory: config.memory !== undefined ? config.memory : true,
      conversationId: config.conversationId,
      userId: config.userId,
      companyId: config.companyId
    });
    
    // Assign the tools to the class property after super call
    this.expenseTools = expenseTools;
    
    // Initialize expense categories and rules
    this.initializeDefaultCategories();
    this.initializeDefaultRules();
    this.initializeTaxGuidelines();
    
    // Load custom categories and rules if available
    this.loadCategoriesAndRules();
  }
  
  /**
   * Process a query using the expense categorization agent
   */
  public async processQuery(query: string): Promise<AgentResponse> {
    try {
      // Add the user message to conversation history
      this.addMessage('user', query);
      
      // Prepare the context
      let context = '';
      
      // Get relevant context from knowledge base if available
      const knowledgeContext = await this.getRelevantContext(query);
      if (knowledgeContext) {
        context += `\nRelevant expense management information from our knowledge base:\n${knowledgeContext}\n`;
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
      const responseText = response.content[0].text;
      
      // Add the response to conversation history
      this.addMessage('assistant', responseText);
      
      // Check if the response includes tool calls (not directly supported in anthropic)
      // but we parse for expense categorization requests
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
          toolCalls: toolCallResults.length > 0,
        },
        toolCalls: toolCallResults
      };
    } catch (error) {
      console.error('Error processing query in Expense Categorization Agent:', error);
      
      // Return a graceful error response
      return {
        response: "I'm sorry, I encountered an error while processing your expense categorization question. Please try rephrasing your question or try again later.",
        confidence: 0.1,
        metadata: {
          error: error.message
        }
      };
    }
  }
  
  /**
   * Parse the response for expense categorization requests and execute them
   */
  private async parseAndExecuteToolCalls(responseText: string, query: string): Promise<any[]> {
    const toolCallResults = [];
    
    // Check for expense categorization patterns in the response or query
    const hasExpenseCategorization = 
      (responseText.includes('categorize') || query.includes('categorize')) &&
      (responseText.includes('expense') || query.includes('expense'));
    
    const hasCategoryRequest =
      (responseText.includes('category list') || query.includes('category list')) ||
      (responseText.includes('expense categories') || query.includes('expense categories'));
    
    const hasCreateCategoryRequest =
      (responseText.includes('create category') || query.includes('create category')) ||
      (responseText.includes('new category') || query.includes('new category'));
    
    // Execute appropriate tool calls
    if (hasExpenseCategorization) {
      // Extract expense details from the text
      const description = this.extractString(responseText, query, /expense\s+for\s+["'](.+?)["']/i) ||
                          this.extractString(responseText, query, /expense\s+description\s*:\s*["'](.+?)["']/i) ||
                          this.extractString(responseText, query, /["'](.+?)["']\s+expense/i);
      
      const amount = this.extractNumber(responseText, query, /\$(\d+(?:\.\d+)?)/);
      
      const vendor = this.extractString(responseText, query, /vendor\s*:\s*["'](.+?)["']/i) ||
                     this.extractString(responseText, query, /from\s+["'](.+?)["']/i) ||
                     this.extractString(responseText, query, /at\s+["'](.+?)["']/i);
      
      const date = this.extractString(responseText, query, /date\s*:\s*["'](.+?)["']/i) ||
                   this.extractString(responseText, query, /on\s+(\d{4}-\d{2}-\d{2})/i);
      
      // Only attempt categorization if we have a description
      if (description) {
        const params = {
          description,
          amount: amount || 0,
          vendor: vendor || '',
          date: date || new Date().toISOString().split('T')[0],
          include_tax_notes: true
        };
        
        const result = await this.categorizeExpense(params);
        toolCallResults.push({
          name: 'categorize_expense',
          arguments: params,
          result
        });
      }
    }
    
    if (hasCategoryRequest) {
      const includeCustom = 
        (responseText.includes('custom categories') || query.includes('custom categories')) ||
        (responseText.includes('all categories') || query.includes('all categories'));
      
      const onlyTaxDeductible = 
        (responseText.includes('tax deductible') || query.includes('tax deductible')) ||
        (responseText.includes('tax-deductible') || query.includes('tax-deductible'));
      
      const params = {
        include_custom: includeCustom,
        only_tax_deductible: onlyTaxDeductible
      };
      
      const result = await this.getExpenseCategories(params);
      toolCallResults.push({
        name: 'get_expense_categories',
        arguments: params,
        result
      });
    }
    
    if (hasCreateCategoryRequest) {
      // For demonstration purposes, we'll only execute this if there are clear
      // parameters in the query, to avoid creating unwanted categories
      const categoryName = this.extractString(responseText, query, /category\s+name\s*:\s*["'](.+?)["']/i) ||
                           this.extractString(responseText, query, /create\s+category\s+["'](.+?)["']/i);
      
      const categoryDesc = this.extractString(responseText, query, /description\s*:\s*["'](.+?)["']/i);
      
      const taxDeductibleStr = this.extractString(responseText, query, /tax[\s-]deductible\s*:\s*(\w+)/i);
      const taxDeductible = taxDeductibleStr ? 
        taxDeductibleStr.toLowerCase() === 'true' || taxDeductibleStr.toLowerCase() === 'yes' : 
        false;
      
      if (categoryName) {
        const params = {
          name: categoryName,
          description: categoryDesc || `Custom category for ${categoryName}`,
          tax_deductible: taxDeductible,
          examples: [],
          tags: [categoryName.toLowerCase()]
        };
        
        const result = await this.createCustomCategory(params);
        toolCallResults.push({
          name: 'create_custom_category',
          arguments: params,
          result
        });
      }
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
      return match1[1].trim();
    }
    
    const match2 = text2.match(pattern);
    if (match2 && match2[1]) {
      return match2[1].trim();
    }
    
    return null;
  }
  
  /**
   * Load categories and rules from database
   */
  private async loadCategoriesAndRules(): Promise<void> {
    try {
      // Load standard categories
      const { data: standardData, error: standardError } = await supabase
        .from('expense_categories')
        .select('*')
        .is('company_id', null);
      
      if (standardError) {
        throw standardError;
      }
      
      if (standardData) {
        this.standardCategories = standardData as ExpenseCategory[];
      }
      
      // Load custom categories for this company if available
      if (this.companyId) {
        const { data: customData, error: customError } = await supabase
          .from('expense_categories')
          .select('*')
          .eq('company_id', this.companyId);
        
        if (customError) {
          throw customError;
        }
        
        if (customData) {
          this.customCategories = customData as ExpenseCategory[];
        }
        
        // Load categorization rules
        const { data: rulesData, error: rulesError } = await supabase
          .from('expense_rules')
          .select('*')
          .or(`company_id.is.null,company_id.eq.${this.companyId}`);
        
        if (rulesError) {
          throw rulesError;
        }
        
        if (rulesData) {
          this.categorizationRules = rulesData as ExpenseRule[];
        }
      }
    } catch (error) {
      console.error('Error loading expense categories and rules:', error);
      // Fallback to default data already initialized
    }
  }
  
  /**
   * Initialize default expense categories
   */
  private initializeDefaultCategories(): void {
    this.standardCategories = [
      {
        id: 'travel',
        name: 'Travel',
        description: 'Travel expenses including airfare, lodging, and transportation',
        tax_deductible: true,
        examples: [
          'Airline tickets to Chicago for business meeting',
          'Hotel stay during conference',
          'Taxi fare to client site',
          'Car rental for business trip'
        ],
        tags: ['travel', 'transportation', 'lodging', 'airfare', 'hotel', 'taxi', 'uber', 'lyft']
      },
      {
        id: 'meals',
        name: 'Meals & Entertainment',
        description: 'Business meals and entertainment expenses',
        tax_deductible: true,
        examples: [
          'Business lunch with client',
          'Team dinner during conference',
          'Coffee meeting with prospect',
          'Entertainment for business clients'
        ],
        tags: ['meals', 'food', 'dining', 'entertainment', 'restaurant', 'lunch', 'dinner']
      },
      {
        id: 'office',
        name: 'Office Supplies',
        description: 'General office supplies and materials',
        tax_deductible: true,
        examples: [
          'Printer paper',
          'Pens and notebooks',
          'Staplers and paperclips',
          'Desk organizers'
        ],
        tags: ['office', 'supplies', 'stationery', 'paper', 'printing']
      },
      {
        id: 'tech',
        name: 'Technology',
        description: 'Computer hardware, software, and services',
        tax_deductible: true,
        examples: [
          'Laptop purchase',
          'Software subscription fees',
          'Cloud storage services',
          'Computer accessories',
          'Mobile phone for business use'
        ],
        tags: ['technology', 'software', 'hardware', 'computer', 'subscription', 'digital']
      },
      {
        id: 'prof_services',
        name: 'Professional Services',
        description: 'Legal, accounting, consulting, and other professional services',
        tax_deductible: true,
        examples: [
          'Legal consultation fees',
          'Accounting services',
          'Tax preparation fees',
          'Business consulting fees'
        ],
        tags: ['professional', 'services', 'legal', 'accounting', 'consulting']
      },
      {
        id: 'marketing',
        name: 'Marketing & Advertising',
        description: 'Expenses related to marketing, advertising, and promotion',
        tax_deductible: true,
        examples: [
          'Digital ad campaign costs',
          'Social media advertising',
          'Marketing materials printing',
          'Trade show registration fees'
        ],
        tags: ['marketing', 'advertising', 'promotion', 'ads', 'branding']
      },
      {
        id: 'training',
        name: 'Training & Education',
        description: 'Professional development, training courses, and educational materials',
        tax_deductible: true,
        examples: [
          'Conference registration fees',
          'Professional certification costs',
          'Online course subscription',
          'Books and training materials'
        ],
        tags: ['training', 'education', 'conference', 'course', 'certification', 'development']
      },
      {
        id: 'utilities',
        name: 'Rent & Utilities',
        description: 'Office rent, utilities, and related expenses',
        tax_deductible: true,
        examples: [
          'Office space rent',
          'Electricity bill',
          'Internet service fees',
          'Water and sewage bills',
          'Trash service'
        ],
        tags: ['rent', 'utilities', 'office', 'space', 'electric', 'internet', 'water']
      },
      {
        id: 'insurance',
        name: 'Insurance',
        description: 'Business insurance premiums and related costs',
        tax_deductible: true,
        examples: [
          'Business liability insurance',
          'Professional liability insurance',
          'Property insurance for office',
          'Workers compensation insurance'
        ],
        tags: ['insurance', 'premium', 'liability', 'coverage', 'protection']
      },
      {
        id: 'vehicle',
        name: 'Vehicle Expenses',
        description: 'Business vehicle expenses including mileage, fuel, and maintenance',
        tax_deductible: true,
        examples: [
          'Fuel for business travel',
          'Business mileage reimbursement',
          'Vehicle repairs for business vehicle',
          'Auto insurance for business vehicle'
        ],
        tags: ['vehicle', 'car', 'auto', 'mileage', 'fuel', 'gas', 'maintenance']
      },
      {
        id: 'other',
        name: 'Other Expenses',
        description: 'Miscellaneous business expenses not categorized elsewhere',
        tax_deductible: false,
        examples: [
          'Donations',
          'Membership dues',
          'Postage and delivery',
          'Miscellaneous expenses'
        ],
        tags: ['other', 'miscellaneous', 'general', 'various']
      },
      {
        id: 'personal',
        name: 'Personal (Non-Business)',
        description: 'Personal expenses not related to business operations',
        tax_deductible: false,
        examples: [
          'Personal meals',
          'Clothing purchases',
          'Gifts for family',
          'Personal entertainment'
        ],
        tags: ['personal', 'non-business', 'private', 'individual']
      }
    ];
  }
  
  /**
   * Initialize default categorization rules
   */
  private initializeDefaultRules(): void {
    // Create simple keyword-based rules for categorization
    this.categorizationRules = [
      // Travel rules
      {
        id: 'rule_travel_1',
        category_id: 'travel',
        keywords: ['airfare', 'flight', 'airline', 'plane ticket', 'airport'],
        confidence: 0.9
      },
      {
        id: 'rule_travel_2',
        category_id: 'travel',
        keywords: ['hotel', 'lodging', 'accommodation', 'motel', 'inn', 'hilton', 'marriott', 'hyatt'],
        confidence: 0.9
      },
      {
        id: 'rule_travel_3',
        category_id: 'travel',
        keywords: ['taxi', 'uber', 'lyft', 'cab', 'rental car', 'car rental', 'hertz', 'avis', 'enterprise'],
        confidence: 0.85
      },
      
      // Meals rules
      {
        id: 'rule_meals_1',
        category_id: 'meals',
        keywords: ['restaurant', 'cafe', 'dining', 'lunch', 'dinner', 'breakfast', 'coffee', 'meal'],
        confidence: 0.85
      },
      {
        id: 'rule_meals_2',
        category_id: 'meals',
        keywords: ['starbucks', 'mcdonald', 'chipotle', 'applebee', 'ihop', 'olive garden', 'panera'],
        confidence: 0.9
      },
      
      // Office supplies rules
      {
        id: 'rule_office_1',
        category_id: 'office',
        keywords: ['office depot', 'staples', 'office supplies', 'paper', 'pens', 'notebook', 'printer ink'],
        confidence: 0.9
      },
      {
        id: 'rule_office_2',
        category_id: 'office',
        keywords: ['stapler', 'paperclip', 'binder', 'folder', 'desk organizer', 'post-it', 'whiteboard'],
        confidence: 0.85
      },
      
      // Technology rules
      {
        id: 'rule_tech_1',
        category_id: 'tech',
        keywords: ['laptop', 'computer', 'keyboard', 'mouse', 'monitor', 'hardware', 'printer'],
        confidence: 0.9
      },
      {
        id: 'rule_tech_2',
        category_id: 'tech',
        keywords: ['software', 'subscription', 'saas', 'zoom', 'microsoft', 'adobe', 'aws', 'cloud'],
        confidence: 0.85
      },
      {
        id: 'rule_tech_3',
        category_id: 'tech',
        keywords: ['apple', 'dell', 'hp', 'best buy', 'amazon tech', 'newegg', 'logitech'],
        confidence: 0.8
      },
      
      // Professional services rules
      {
        id: 'rule_prof_1',
        category_id: 'prof_services',
        keywords: ['legal', 'lawyer', 'attorney', 'law firm', 'legal advice', 'legal services'],
        confidence: 0.9
      },
      {
        id: 'rule_prof_2',
        category_id: 'prof_services',
        keywords: ['accounting', 'accountant', 'cpa', 'tax preparation', 'bookkeeping', 'financial advisor'],
        confidence: 0.9
      },
      {
        id: 'rule_prof_3',
        category_id: 'prof_services',
        keywords: ['consulting', 'consultant', 'professional service', 'advisor', 'specialist'],
        confidence: 0.8
      },
      
      // Marketing rules
      {
        id: 'rule_marketing_1',
        category_id: 'marketing',
        keywords: ['advertising', 'marketing', 'promotion', 'ad campaign', 'social media ad', 'google ads'],
        confidence: 0.9
      },
      {
        id: 'rule_marketing_2',
        category_id: 'marketing',
        keywords: ['print materials', 'brochure', 'business card', 'flyer', 'banner', 'signage'],
        confidence: 0.85
      },
      {
        id: 'rule_marketing_3',
        category_id: 'marketing',
        keywords: ['trade show', 'exhibition', 'booth', 'conference display', 'sponsorship'],
        confidence: 0.8
      }
    ];
  }
  
  /**
   * Initialize tax guidelines for expense categories
   */
  private initializeTaxGuidelines(): void {
    this.taxGuidelines = {
      'travel': 'Business travel expenses are generally 100% deductible, including transportation, lodging, and incidental expenses. Meals during business travel are typically 50% deductible.',
      'meals': 'Business meal expenses are typically 50% deductible if they involve business discussions with clients, customers, or colleagues. Entertainment expenses are generally not deductible under current tax law.',
      'office': 'Office supplies used for business purposes are generally 100% deductible in the year they are purchased.',
      'tech': 'Technology purchases may need to be capitalized and depreciated if the cost exceeds certain thresholds, but many software subscriptions and lower-cost items can be fully deducted in the year of purchase.',
      'prof_services': 'Professional services related to business operations are generally 100% deductible, including legal, accounting, and consulting fees.',
      'marketing': 'Marketing and advertising expenses for promoting your business are generally 100% deductible as ordinary business expenses.',
      'training': 'Education and training expenses that maintain or improve skills needed for your current business are generally 100% deductible.',
      'utilities': 'Rent and utilities for business premises are generally 100% deductible. For home offices, special rules apply regarding the percentage of space used exclusively for business.',
      'insurance': 'Business insurance premiums are generally 100% deductible as ordinary and necessary business expenses.',
      'vehicle': 'Vehicle expenses can be deducted using either the standard mileage rate or actual expenses method. Personal use portion is not deductible.',
      'other': 'Miscellaneous business expenses may be deductible if they are ordinary and necessary for your business operations.',
      'personal': 'Personal expenses are not tax-deductible as business expenses.'
    };
  }
  
  /**
   * Categorize an expense based on description and other parameters
   */
  private async categorizeExpense(params: any): Promise<any> {
    const { description, amount, vendor, date, include_tax_notes } = params;
    
    // Combine standard and custom categories
    const allCategories = [...this.standardCategories, ...this.customCategories];
    
    // First, check if there are any exact matches by keyword in the rules
    const matchResults = [];
    
    // Convert description to lowercase for case-insensitive matching
    const lowerDesc = description.toLowerCase();
    const lowerVendor = (vendor || '').toLowerCase();
    const searchText = `${lowerDesc} ${lowerVendor}`;
    
    // Check against each rule
    for (const rule of this.categorizationRules) {
      // Find the corresponding category
      const category = allCategories.find(cat => cat.id === rule.category_id);
      if (!category) continue;
      
      // Check if any keywords match
      const keywordMatches = rule.keywords.filter(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        // Calculate a score based on number of matches and rule confidence
        const score = (keywordMatches.length / rule.keywords.length) * rule.confidence;
        
        matchResults.push({
          category,
          score,
          matched_keywords: keywordMatches
        });
      }
    }
    
    // If no rule matches, use keyword matching based on category examples and tags
    if (matchResults.length === 0) {
      for (const category of allCategories) {
        // Check if description matches any examples or tags
        const exampleMatches = (category.examples || []).filter(example => 
          lowerDesc.includes(example.toLowerCase())
        );
        
        const tagMatches = (category.tags || []).filter(tag => 
          searchText.includes(tag.toLowerCase())
        );
        
        if (exampleMatches.length > 0 || tagMatches.length > 0) {
          // Calculate a score based on matches
          const exampleScore = exampleMatches.length / (category.examples?.length || 1) * 0.7;
          const tagScore = tagMatches.length / (category.tags?.length || 1) * 0.5;
          
          matchResults.push({
            category,
            score: Math.max(exampleScore, tagScore),
            matched_examples: exampleMatches,
            matched_tags: tagMatches
          });
        }
      }
    }
    
    // Sort match results by score
    matchResults.sort((a, b) => b.score - a.score);
    
    // Determine the best category match
    let bestMatch = null;
    let alternativeMatches = [];
    
    if (matchResults.length > 0) {
      bestMatch = matchResults[0];
      
      // Get alternative matches if available
      if (matchResults.length > 1) {
        alternativeMatches = matchResults.slice(1, 4).map(match => ({
          category_id: match.category.id,
          category_name: match.category.name,
          confidence: match.score
        }));
      }
    } else {
      // If no match, default to "Other Expenses"
      bestMatch = {
        category: allCategories.find(cat => cat.id === 'other'),
        score: 0.3
      };
    }
    
    // Generate tax notes if requested and available
    let taxNotes = null;
    if (include_tax_notes && bestMatch && bestMatch.category) {
      taxNotes = this.getTaxNotes(bestMatch.category.id, amount);
    }
    
    // Prepare the result
    const result = {
      expense: {
        description,
        amount: amount || 0,
        vendor: vendor || '',
        date: date || new Date().toISOString().split('T')[0]
      },
      categorization: {
        category_id: bestMatch?.category?.id || 'other',
        category_name: bestMatch?.category?.name || 'Other Expenses',
        confidence: bestMatch?.score || 0.3,
        alternative_categories: alternativeMatches,
        tax_deductible: bestMatch?.category?.tax_deductible || false,
        tax_notes: taxNotes
      }
    };
    
    // Save the categorization result if user ID is available
    if (this.userId) {
      const categorizationResult: CategorizationResult = {
        id: uuidv4(),
        query: `Categorize expense: ${description}`,
        result,
        timestamp: new Date(),
        confidence: bestMatch?.score || 0.3,
        user_id: this.userId,
        company_id: this.companyId
      };
      
      try {
        await supabase
          .from('categorization_results')
          .insert(categorizationResult);
      } catch (error) {
        console.error('Error saving categorization result:', error);
      }
    }
    
    return result;
  }
  
  /**
   * Get available expense categories
   */
  private async getExpenseCategories(params: any): Promise<any> {
    const { include_custom = true, only_tax_deductible = false, parent_category_id = null } = params;
    
    // Start with standard categories
    let categories = [...this.standardCategories];
    
    // Add custom categories if requested
    if (include_custom) {
      categories = [...categories, ...this.customCategories];
    }
    
    // Filter by tax deductibility if requested
    if (only_tax_deductible) {
      categories = categories.filter(cat => cat.tax_deductible);
    }
    
    // Filter by parent category if requested
    if (parent_category_id) {
      categories = categories.filter(cat => cat.parent_category_id === parent_category_id);
    }
    
    // Transform the categories for response
    const result = {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        tax_deductible: cat.tax_deductible,
        examples: cat.examples,
        tags: cat.tags,
        parent_category_id: cat.parent_category_id,
        is_custom: this.customCategories.some(c => c.id === cat.id)
      }))
    };
    
    return result;
  }
  
  /**
   * Create a new custom category
   */
  private async createCustomCategory(params: any): Promise<any> {
    const { name, description, tax_deductible, examples = [], tags = [], parent_category_id = null } = params;
    
    // Create a new category
    const newCategory: ExpenseCategory = {
      id: `custom_${Date.now()}`,
      name,
      description: description || `Custom category for ${name}`,
      tax_deductible: !!tax_deductible,
      examples: examples || [],
      tags: tags || [name.toLowerCase()],
      parent_category_id,
      company_id: this.companyId
    };
    
    // Add to custom categories
    this.customCategories.push(newCategory);
    
    // Save to database if company ID available
    if (this.companyId) {
      try {
        await supabase
          .from('expense_categories')
          .insert(newCategory);
      } catch (error) {
        console.error('Error saving custom category:', error);
      }
    }
    
    // Return the created category
    return {
      category: newCategory,
      success: true,
      message: `Successfully created custom category "${name}"`
    };
  }
  
  /**
   * Get tax notes for a category
   */
  private getTaxNotes(categoryId: string, amount: number): string {
    // Get the basic tax guidelines for this category
    const basicGuidelines = this.taxGuidelines[categoryId] || 'Tax deductibility depends on the specific nature of the expense and your business circumstances.';
    
    // For meals, add specific percentage information
    if (categoryId === 'meals') {
      const deductibleAmount = amount * 0.5;
      return `${basicGuidelines} For this $${amount.toFixed(2)} expense, approximately $${deductibleAmount.toFixed(2)} (50%) may be tax-deductible.`;
    }
    
    // For travel, add context about mixed personal/business
    if (categoryId === 'travel') {
      return `${basicGuidelines} Ensure this travel was primarily for business purposes, as personal portions of trips are not deductible.`;
    }
    
    // For vehicle expenses, add context about documentation
    if (categoryId === 'vehicle') {
      return `${basicGuidelines} Maintain detailed records of business mileage, dates, and purposes to support deductions.`;
    }
    
    // For technology, add context about capitalization
    if (categoryId === 'tech' && amount > 2500) {
      return `${basicGuidelines} This expense may need to be capitalized and depreciated since it exceeds $2,500. Consult your tax professional.`;
    }
    
    return basicGuidelines;
  }
  
  /**
   * Get relevant context for an expense categorization query from the knowledge base
   */
  protected async getRelevantContext(query: string): Promise<string | null> {
    try {
      // Get relevant knowledge base entries
      const expenseInfoEntries = await supabase.rpc('match_documents', {
        query_embedding: [0.1], // Placeholder, will be replaced by embedding model
        match_threshold: 0.7,
        match_count: 3,
        collection_name: 'expense_information'
      });
      
      if (expenseInfoEntries && expenseInfoEntries.length > 0) {
        return expenseInfoEntries
          .map(entry => `${entry.title || 'Expense Information'}: ${entry.content}`)
          .join('\n\n');
      }
      
      return null;
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return null;
    }
  }
}