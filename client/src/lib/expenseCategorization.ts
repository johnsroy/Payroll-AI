import { BaseAgent, AgentConfig } from './baseAgent';

// Define expense category and rule interfaces
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
    super({
      ...config,
      systemPrompt: `You are an expense categorization specialist for payroll and business accounting. Your expertise is in helping users categorize business expenses correctly for tax and accounting purposes.

Always provide accurate guidance on expense categorization. When analyzing expenses:
1. Identify the most appropriate category based on the expense description
2. Explain why the category is appropriate
3. Provide information about tax deductibility where relevant
4. Suggest any documentation requirements for the expense type

Your goal is to help users maintain accurate financial records and maximize legitimate tax deductions while staying compliant with tax regulations.`,
      tools: [
        {
          function: {
            name: "categorizeExpense",
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
                date: {
                  type: "string",
                  description: "Date of the expense (YYYY-MM-DD)"
                },
                vendor: {
                  type: "string",
                  description: "Vendor or payee"
                },
                businessType: {
                  type: "string",
                  description: "Type of business"
                }
              },
              required: ["description", "amount"]
            }
          },
          handler: async (params: any) => {
            return await this.categorizeExpense(params);
          }
        },
        {
          function: {
            name: "getExpenseCategories",
            description: "Get all available expense categories",
            parameters: {
              type: "object",
              properties: {
                includeCustom: {
                  type: "boolean",
                  description: "Whether to include custom categories"
                },
                businessType: {
                  type: "string",
                  description: "Filter categories by business type"
                }
              }
            }
          },
          handler: async (params: any) => {
            return await this.getExpenseCategories(params);
          }
        },
        {
          function: {
            name: "createCustomCategory",
            description: "Create a custom expense category",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the category"
                },
                description: {
                  type: "string",
                  description: "Description of the category"
                },
                tax_deductible: {
                  type: "boolean",
                  description: "Whether expenses in this category are tax deductible"
                },
                business_type: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Business types this category applies to"
                }
              },
              required: ["name", "tax_deductible"]
            }
          },
          handler: async (params: any) => {
            return await this.createCustomCategory(params);
          }
        }
      ]
    });

    this.companyId = config.companyId;
    
    // Load categories and rules
    this.loadCategoriesAndRules();
  }

  private async loadCategoriesAndRules(): Promise<void> {
    try {
      // In a real implementation, we would fetch this from a database
      // For now, we'll initialize with some default values
      this.initializeDefaultCategories();
      this.initializeDefaultRules();
      
      // If we have a company ID, we would also load custom categories
      if (this.companyId) {
        // Load custom categories from database
        // This would be implemented in a real application
      }
    } catch (error) {
      console.error('Error loading categories and rules:', error);
    }
  }

  private initializeDefaultCategories(): void {
    this.standardCategories = [
      {
        id: 'office-supplies',
        name: 'Office Supplies',
        description: 'Paper, pens, staplers, and other office supplies',
        tax_deductible: true
      },
      {
        id: 'rent',
        name: 'Rent or Lease',
        description: 'Office rent, equipment leases, or other rental expenses',
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
        description: 'Business travel expenses including airfare, hotels, and transportation',
        tax_deductible: true
      },
      {
        id: 'meals',
        name: 'Meals and Entertainment',
        description: 'Business meals and entertainment (usually 50% deductible)',
        tax_deductible: true
      },
      {
        id: 'software',
        name: 'Software & Subscriptions',
        description: 'Software licenses, SaaS subscriptions, and digital tools',
        tax_deductible: true
      },
      {
        id: 'professional',
        name: 'Professional Services',
        description: 'Legal, accounting, consulting, and other professional services',
        tax_deductible: true
      },
      {
        id: 'marketing',
        name: 'Marketing & Advertising',
        description: 'Advertising, promotion, and marketing expenses',
        tax_deductible: true
      },
      {
        id: 'insurance',
        name: 'Insurance',
        description: 'Business insurance premiums',
        tax_deductible: true
      },
      {
        id: 'equipment',
        name: 'Equipment',
        description: 'Computers, machinery, and other equipment (may need to be depreciated)',
        tax_deductible: true
      },
      {
        id: 'vehicle',
        name: 'Vehicle Expenses',
        description: 'Fuel, maintenance, and other vehicle-related expenses for business use',
        tax_deductible: true
      },
      {
        id: 'training',
        name: 'Education & Training',
        description: 'Courses, workshops, conferences, and other professional development',
        tax_deductible: true
      },
      {
        id: 'personal',
        name: 'Personal (Non-Business)',
        description: 'Personal expenses not related to business operations',
        tax_deductible: false
      }
    ];
  }

  private initializeDefaultRules(): void {
    this.categorySuggestionRules = [
      // Office Supplies
      { keywords: ['paper', 'pen', 'pencil', 'stapler', 'tape', 'office supplies', 'staples', 'office depot'], category_id: 'office-supplies', confidence: 0.8 },
      
      // Rent
      { keywords: ['rent', 'lease', 'office space', 'coworking', 'wework', 'regus'], category_id: 'rent', confidence: 0.9 },
      
      // Utilities
      { keywords: ['electric', 'electricity', 'water', 'gas', 'internet', 'phone', 'cell phone', 'utility', 'verizon', 'at&t', 'comcast', 'spectrum'], category_id: 'utilities', confidence: 0.85 },
      
      // Travel
      { keywords: ['flight', 'airline', 'hotel', 'airbnb', 'uber', 'lyft', 'taxi', 'rental car', 'delta', 'united', 'american airlines', 'southwest', 'marriott', 'hilton'], category_id: 'travel', confidence: 0.9 },
      
      // Meals
      { keywords: ['restaurant', 'lunch', 'dinner', 'meal', 'coffee', 'starbucks', 'doordash', 'grubhub', 'uber eats'], category_id: 'meals', confidence: 0.8 },
      
      // Software
      { keywords: ['software', 'subscription', 'saas', 'license', 'microsoft', 'adobe', 'google', 'aws', 'amazon web', 'dropbox', 'slack', 'zoom'], category_id: 'software', confidence: 0.85 },
      
      // Professional Services
      { keywords: ['lawyer', 'attorney', 'accountant', 'cpa', 'consultant', 'legal', 'accounting', 'consulting'], category_id: 'professional', confidence: 0.9 },
      
      // Marketing
      { keywords: ['advertising', 'ad', 'promotion', 'marketing', 'facebook ad', 'google ad', 'linkedin ad', 'social media', 'seo', 'brochure', 'flyer'], category_id: 'marketing', confidence: 0.8 },
      
      // Insurance
      { keywords: ['insurance', 'premium', 'coverage', 'liability', 'allstate', 'state farm', 'geico', 'progressive'], category_id: 'insurance', confidence: 0.9 },
      
      // Equipment
      { keywords: ['computer', 'laptop', 'printer', 'monitor', 'server', 'machinery', 'equipment', 'apple', 'dell', 'hp', 'lenovo'], category_id: 'equipment', confidence: 0.85 },
      
      // Vehicle
      { keywords: ['gas', 'fuel', 'oil change', 'maintenance', 'repair', 'car', 'vehicle', 'mileage', 'chevron', 'shell', 'exxon', 'bp'], category_id: 'vehicle', confidence: 0.8 },
      
      // Training
      { keywords: ['training', 'course', 'workshop', 'conference', 'seminar', 'education', 'udemy', 'coursera', 'skillshare', 'certification'], category_id: 'training', confidence: 0.85 }
    ];
  }

  private async categorizeExpense(params: any): Promise<any> {
    const { description, amount, date, vendor, businessType } = params;
    
    // Find potential category matches based on keyword matching
    const matches: { category: ExpenseCategory, confidence: number }[] = [];
    
    // Check description against rules
    for (const rule of this.categorySuggestionRules) {
      for (const keyword of rule.keywords) {
        if (description.toLowerCase().includes(keyword.toLowerCase())) {
          // Find the category
          const category = this.standardCategories.find(c => c.id === rule.category_id) || 
                          this.customCategories.find(c => c.id === rule.category_id);
          
          if (category) {
            // Check if this is a better match than we already have
            const existingMatch = matches.find(m => m.category.id === category.id);
            if (!existingMatch || existingMatch.confidence < rule.confidence) {
              if (existingMatch) {
                // Update confidence if we already have this category
                existingMatch.confidence = rule.confidence;
              } else {
                // Add new match
                matches.push({
                  category,
                  confidence: rule.confidence
                });
              }
            }
          }
        }
      }
    }
    
    // Sort matches by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Get tax notes based on the best match
    const taxNotes = this.getTaxNotes(
      matches.length > 0 ? matches[0].category.id : undefined,
      amount,
      description
    );
    
    // Format response
    return {
      description,
      amount,
      date,
      vendor,
      suggestions: matches.map(match => ({
        category_id: match.category.id,
        category_name: match.category.name,
        confidence: match.confidence,
        tax_deductible: match.category.tax_deductible
      })),
      tax_notes: taxNotes
    };
  }

  private async getExpenseCategories(params: any): Promise<any> {
    const { includeCustom = true, businessType } = params || {};
    
    let categories = [...this.standardCategories];
    
    if (includeCustom) {
      categories = [...categories, ...this.customCategories];
    }
    
    // Filter by business type if provided
    if (businessType) {
      categories = categories.filter(category => {
        return !category.business_type || 
              category.business_type.includes(businessType) ||
              category.business_type.includes('all');
      });
    }
    
    return {
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        tax_deductible: category.tax_deductible
      }))
    };
  }

  private async createCustomCategory(params: any): Promise<any> {
    const { name, description = '', tax_deductible, business_type = ['all'] } = params;
    
    if (!this.companyId) {
      return { error: 'Cannot create custom category without a company ID' };
    }
    
    // Generate a slug-like ID from the name
    const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Check if a category with this ID already exists
    const existingCategory = this.customCategories.find(c => c.id === id);
    if (existingCategory) {
      return { error: 'A category with this name already exists' };
    }
    
    // Create new category
    const newCategory: ExpenseCategory = {
      id,
      name,
      description,
      tax_deductible,
      business_type
    };
    
    // Add to custom categories
    this.customCategories.push(newCategory);
    
    // In a real implementation, we would save this to the database
    
    return {
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        description: newCategory.description,
        tax_deductible: newCategory.tax_deductible
      }
    };
  }

  private getTaxNotes(categoryId: string | undefined, amount: number, description: string): string {
    if (!categoryId) {
      return 'Unable to determine tax status without category classification.';
    }
    
    const category = this.standardCategories.find(c => c.id === categoryId) || 
                     this.customCategories.find(c => c.id === categoryId);
    
    if (!category) {
      return 'Category information not found.';
    }
    
    if (!category.tax_deductible) {
      return 'This expense appears to be non-deductible for business tax purposes.';
    }
    
    let notes = 'This expense may be tax deductible for business purposes. ';
    
    // Add special notes based on category
    switch (categoryId) {
      case 'meals':
        notes += 'Meal expenses are typically 50% deductible. Ensure you have receipts and record the business purpose of the meal.';
        break;
      case 'travel':
        notes += 'Business travel expenses are generally fully deductible. Maintain documentation of the business purpose of your trip.';
        break;
      case 'vehicle':
        notes += 'Vehicle expenses can be deducted using actual expenses or the standard mileage rate. Keep detailed records of business vs. personal use.';
        break;
      case 'equipment':
        if (amount > 2500) {
          notes += 'Equipment over $2,500 may need to be capitalized and depreciated rather than expensed immediately. Consult your accountant.';
        } else {
          notes += 'Small equipment purchases under $2,500 can typically be fully deducted in the current year under de minimis safe harbor rules.';
        }
        break;
      default:
        notes += 'Keep receipts and documentation showing the business purpose of this expense.';
    }
    
    return notes;
  }
}