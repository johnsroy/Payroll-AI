import { BaseAgent, AgentConfig } from './baseAgent';
import { supabase } from '../supabase';

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  tax_deductible: boolean;
  business_type?: string[];
}

interface ExpenseRule {
  keywords: string[];
  category_id: string;
  confidence: number;
}

export class ExpenseCategorizationAgent extends BaseAgent {
  private standardCategories: ExpenseCategory[] = [];
  private customCategories: ExpenseCategory[] = [];
  private categorySuggestionRules: ExpenseRule[] = [];
  private companyId?: string;

  constructor(config: AgentConfig) {
    // Define comprehensive system prompt for expense categorization
    const expenseSystemPrompt = `You are an expert expense categorization assistant for payroll and accounting.
Your primary responsibilities include:
1. Analyzing transaction descriptions to accurately categorize business expenses
2. Identifying tax-deductible expenses
3. Suggesting expense categories based on transaction patterns
4. Helping users understand expense categorization best practices

When categorizing expenses:
- Focus on the actual business purpose of the expense, not just the vendor
- Consider industry-specific expense patterns
- Flag potentially personal expenses that may not be business-related
- Identify expenses that may qualify for special tax treatment

Always explain your reasoning when suggesting categories, especially for ambiguous expenses.
When uncertain about categorization, suggest possible categories with explanations rather than guessing.`;

    // Define tools for the expense agent
    const expenseTools = [
      {
        type: 'function',
        function: {
          name: 'categorize_expense',
          description: 'Categorize an expense based on description and amount',
          parameters: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of the expense or transaction'
              },
              amount: {
                type: 'number',
                description: 'Amount of the expense'
              },
              vendor: {
                type: 'string',
                description: 'Vendor or merchant name'
              },
              date: {
                type: 'string',
                description: 'Date of the transaction (YYYY-MM-DD)'
              },
              payment_method: {
                type: 'string',
                description: 'Payment method used (e.g., credit card, cash, check)'
              }
            },
            required: ['description', 'amount']
          }
        },
        handler: this.categorizeExpense.bind(this)
      },
      {
        type: 'function',
        function: {
          name: 'get_expense_categories',
          description: 'Get available expense categories',
          parameters: {
            type: 'object',
            properties: {
              business_type: {
                type: 'string',
                description: 'Business type to filter categories (optional)'
              },
              include_custom: {
                type: 'boolean',
                description: 'Whether to include custom categories'
              }
            }
          }
        },
        handler: this.getExpenseCategories.bind(this)
      },
      {
        type: 'function',
        function: {
          name: 'create_custom_category',
          description: 'Create a new custom expense category',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the new category'
              },
              description: {
                type: 'string',
                description: 'Description of the category'
              },
              tax_deductible: {
                type: 'boolean',
                description: 'Whether expenses in this category are typically tax deductible'
              }
            },
            required: ['name', 'tax_deductible']
          }
        },
        handler: this.createCustomCategory.bind(this)
      }
    ];

    // Initialize the agent with expense-specific configuration
    super({
      ...config,
      systemPrompt: expenseSystemPrompt,
      tools: expenseTools,
      temperature: 0.3 // Moderate temperature for balanced creativity and accuracy
    });

    this.companyId = config.companyId;

    // Load standard categories and rules
    this.loadCategoriesAndRules();
  }

  // Load categories and rules from database
  private async loadCategoriesAndRules(): Promise<void> {
    try {
      // Load standard categories
      const { data: standardCats, error: standardError } = await supabase
        .from('knowledge_base')
        .select('content')
        .eq('category', 'expense_categories')
        .single();

      if (!standardError && standardCats) {
        this.standardCategories = JSON.parse(standardCats.content);
      } else {
        // Use defaults if not found
        this.initializeDefaultCategories();
      }

      // Load categorization rules
      const { data: rules, error: rulesError } = await supabase
        .from('knowledge_base')
        .select('content')
        .eq('category', 'expense_rules')
        .single();

      if (!rulesError && rules) {
        this.categorySuggestionRules = JSON.parse(rules.content);
      } else {
        this.initializeDefaultRules();
      }

      // Load custom categories if company ID is provided
      if (this.companyId) {
        const { data: customCats, error: customError } = await supabase
          .from('expense_categories')
          .select('*')
          .eq('company_id', this.companyId);

        if (!customError && customCats) {
          this.customCategories = customCats.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            tax_deductible: cat.tax_deductible
          }));
        }
      }
    } catch (error) {
      console.error('Error loading categories and rules:', error);
      this.initializeDefaultCategories();
      this.initializeDefaultRules();
    }
  }

  // Initialize with default expense categories
  private initializeDefaultCategories(): void {
    this.standardCategories = [
      {
        id: 'advertising',
        name: 'Advertising & Marketing',
        description: 'Expenses related to promoting your business',
        tax_deductible: true
      },
      {
        id: 'bank_fees',
        name: 'Bank Fees & Charges',
        description: 'Fees charged by financial institutions',
        tax_deductible: true
      },
      {
        id: 'office_supplies',
        name: 'Office Supplies',
        description: 'Items used in daily office operations',
        tax_deductible: true
      },
      {
        id: 'rent',
        name: 'Rent & Lease',
        description: 'Payments for business property',
        tax_deductible: true
      },
      {
        id: 'utilities',
        name: 'Utilities',
        description: 'Electricity, water, internet, phone services',
        tax_deductible: true
      },
      {
        id: 'travel',
        name: 'Travel',
        description: 'Business travel expenses',
        tax_deductible: true
      },
      {
        id: 'meals',
        name: 'Meals & Entertainment',
        description: 'Business meals and entertainment (partially deductible)',
        tax_deductible: true
      },
      {
        id: 'insurance',
        name: 'Insurance',
        description: 'Business insurance premiums',
        tax_deductible: true
      },
      {
        id: 'professional_services',
        name: 'Professional Services',
        description: 'Legal, accounting, consulting fees',
        tax_deductible: true
      },
      {
        id: 'software',
        name: 'Software & Subscriptions',
        description: 'Software licenses and subscription services',
        tax_deductible: true
      },
      {
        id: 'equipment',
        name: 'Equipment',
        description: 'Business equipment purchases',
        tax_deductible: true
      },
      {
        id: 'repairs',
        name: 'Repairs & Maintenance',
        description: 'Costs to maintain business property and equipment',
        tax_deductible: true
      },
      {
        id: 'vehicle',
        name: 'Vehicle Expenses',
        description: 'Business vehicle costs including mileage',
        tax_deductible: true
      },
      {
        id: 'taxes',
        name: 'Taxes & Licenses',
        description: 'Business taxes, licenses, and permits',
        tax_deductible: true
      },
      {
        id: 'education',
        name: 'Education & Training',
        description: 'Professional development and training costs',
        tax_deductible: true
      },
      {
        id: 'other',
        name: 'Other Expenses',
        description: 'Miscellaneous business expenses',
        tax_deductible: true
      },
      {
        id: 'personal',
        name: 'Personal (Non-Business)',
        description: 'Personal expenses - not business related',
        tax_deductible: false
      }
    ];
  }

  // Initialize with default categorization rules
  private initializeDefaultRules(): void {
    this.categorySuggestionRules = [
      {
        keywords: ['facebook ads', 'google ads', 'advertising', 'marketing', 'promotion'],
        category_id: 'advertising',
        confidence: 0.8
      },
      {
        keywords: ['bank fee', 'service charge', 'transaction fee', 'wire transfer'],
        category_id: 'bank_fees',
        confidence: 0.9
      },
      {
        keywords: ['paper', 'ink', 'toner', 'staples', 'office depot', 'pen', 'notebook'],
        category_id: 'office_supplies',
        confidence: 0.8
      },
      {
        keywords: ['rent', 'lease', 'property', 'workspace'],
        category_id: 'rent',
        confidence: 0.9
      },
      {
        keywords: ['electricity', 'water', 'gas', 'internet', 'phone', 'utility'],
        category_id: 'utilities',
        confidence: 0.9
      },
      {
        keywords: ['flight', 'hotel', 'airfare', 'lodging', 'travel'],
        category_id: 'travel',
        confidence: 0.8
      },
      {
        keywords: ['restaurant', 'meal', 'lunch', 'dinner', 'catering'],
        category_id: 'meals',
        confidence: 0.7
      },
      {
        keywords: ['insurance', 'premium', 'coverage', 'liability'],
        category_id: 'insurance',
        confidence: 0.9
      },
      {
        keywords: ['lawyer', 'accountant', 'attorney', 'legal', 'consulting'],
        category_id: 'professional_services',
        confidence: 0.8
      },
      {
        keywords: ['software', 'subscription', 'saas', 'license', 'adobe', 'microsoft', 'app'],
        category_id: 'software',
        confidence: 0.8
      },
      {
        keywords: ['equipment', 'computer', 'laptop', 'printer', 'machinery', 'furniture'],
        category_id: 'equipment',
        confidence: 0.8
      },
      {
        keywords: ['repair', 'maintenance', 'fix', 'service', 'cleaning'],
        category_id: 'repairs',
        confidence: 0.8
      },
      {
        keywords: ['gas', 'fuel', 'mileage', 'car', 'vehicle', 'auto', 'uber', 'lyft', 'taxi'],
        category_id: 'vehicle',
        confidence: 0.8
      },
      {
        keywords: ['tax', 'license', 'permit', 'registration', 'fee'],
        category_id: 'taxes',
        confidence: 0.8
      },
      {
        keywords: ['training', 'course', 'seminar', 'conference', 'education', 'workshop'],
        category_id: 'education',
        confidence: 0.8
      },
      {
        keywords: ['grocery', 'personal', 'clothing', 'gift'],
        category_id: 'personal',
        confidence: 0.7
      }
    ];
  }

  // Handler for categorize_expense tool
  private async categorizeExpense(params: any): Promise<any> {
    const {
      description,
      amount,
      vendor = '',
      date = new Date().toISOString().split('T')[0],
      payment_method = 'unknown'
    } = params;

    // Combine description and vendor for better matching
    const fullText = `${description.toLowerCase()} ${vendor.toLowerCase()}`;
    
    // Find matching categories based on rules
    const matches: { categoryId: string; confidence: number; }[] = [];
    
    // Check against categorization rules
    for (const rule of this.categorySuggestionRules) {
      const matchCount = rule.keywords.filter(keyword => 
        fullText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        // Adjust confidence based on how many keywords matched
        const adjustedConfidence = rule.confidence * (matchCount / rule.keywords.length);
        
        matches.push({
          categoryId: rule.category_id,
          confidence: adjustedConfidence
        });
      }
    }
    
    // Sort matches by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Get top 3 category matches
    const topMatches = matches.slice(0, 3);
    
    // Prepare category details for top matches
    const suggestedCategories = topMatches.map(match => {
      const category = [...this.standardCategories, ...this.customCategories]
        .find(cat => cat.id === match.categoryId);
      
      return category ? {
        id: category.id,
        name: category.name,
        description: category.description,
        tax_deductible: category.tax_deductible,
        confidence: match.confidence
      } : null;
    }).filter(cat => cat !== null);
    
    // If no categories matched, suggest "Other Expenses"
    if (suggestedCategories.length === 0) {
      const otherCategory = this.standardCategories.find(cat => cat.id === 'other');
      if (otherCategory) {
        suggestedCategories.push({
          id: otherCategory.id,
          name: otherCategory.name,
          description: otherCategory.description,
          tax_deductible: otherCategory.tax_deductible,
          confidence: 0.3 // Low confidence since it's a fallback
        });
      }
    }
    
    return {
      expense_details: {
        description,
        amount,
        vendor,
        date,
        payment_method
      },
      suggested_categories: suggestedCategories,
      tax_notes: this.getTaxNotes(suggestedCategories[0]?.id, amount, fullText)
    };
  }

  // Handler for get_expense_categories tool
  private async getExpenseCategories(params: any): Promise<any> {
    const { business_type, include_custom = true } = params;
    
    let categories = [...this.standardCategories];
    
    // Filter by business type if specified
    if (business_type) {
      categories = categories.filter(cat => 
        !cat.business_type || cat.business_type.includes(business_type)
      );
    }
    
    // Include custom categories if requested
    if (include_custom && this.customCategories.length > 0) {
      categories = [...categories, ...this.customCategories];
    }
    
    return {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        tax_deductible: cat.tax_deductible
      }))
    };
  }

  // Handler for create_custom_category tool
  private async createCustomCategory(params: any): Promise<any> {
    if (!this.companyId) {
      return {
        success: false,
        error: 'Company ID is required to create custom categories'
      };
    }
    
    const { name, description = '', tax_deductible } = params;
    
    try {
      // Check if a similar category already exists
      const existingCategory = [...this.standardCategories, ...this.customCategories]
        .find(cat => cat.name.toLowerCase() === name.toLowerCase());
      
      if (existingCategory) {
        return {
          success: false,
          error: 'A category with this name already exists',
          existing_category: {
            id: existingCategory.id,
            name: existingCategory.name,
            description: existingCategory.description,
            tax_deductible: existingCategory.tax_deductible
          }
        };
      }
      
      // Create new category in database
      const { data, error } = await supabase
        .from('expense_categories')
        .insert({
          company_id: this.companyId,
          name,
          description,
          tax_deductible
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local cache
      const newCategory = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        tax_deductible: data.tax_deductible
      };
      
      this.customCategories.push(newCategory);
      
      return {
        success: true,
        category: newCategory
      };
    } catch (error) {
      console.error('Error creating custom category:', error);
      return {
        success: false,
        error: 'Failed to create custom category'
      };
    }
  }

  // Helper to provide tax-related notes for expenses
  private getTaxNotes(categoryId: string | undefined, amount: number, description: string): string {
    if (!categoryId) return '';
    
    const category = [...this.standardCategories, ...this.customCategories]
      .find(cat => cat.id === categoryId);
    
    if (!category) return '';
    
    switch (categoryId) {
      case 'meals':
        return 'Business meals are generally 50% tax deductible. Keep detailed records of who attended and the business purpose.';
      
      case 'vehicle':
        return 'Track business mileage separately from personal use. Consider using standard mileage rate vs. actual expenses.';
      
      case 'home_office':
        return 'Home office deductions require exclusive and regular use of the space for business. Calculate based on percentage of home used.';
      
      case 'travel':
        return 'Business travel expenses are fully deductible, but personal elements of trips are not. Maintain documentation of business purpose.';
      
      case 'equipment':
        if (amount > 2500) {
          return 'Equipment over $2,500 may need to be capitalized and depreciated rather than expensed immediately. Consult with your accountant.';
        }
        return 'Small equipment purchases under $2,500 can usually be fully expensed in the current year.';
      
      case 'personal':
        return 'This appears to be a personal expense which is not tax deductible for business purposes.';
      
      default:
        return category.tax_deductible 
          ? 'This expense category is generally tax deductible. Keep all receipts and documentation of business purpose.'
          : 'This expense category may not be tax deductible. Consult with your accountant.';
    }
  }
}
