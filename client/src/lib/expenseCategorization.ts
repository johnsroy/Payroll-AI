import { BaseAgent, AgentConfig } from './baseAgent';

// Define expense category interface
interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  tax_deductible: boolean;
  business_type?: string[];
}

// Define expense rule interface
interface ExpenseRule {
  keywords: string[];
  category_id: string;
  confidence: number;
}

export class ExpenseCategorizationAgent extends BaseAgent {
  private standardCategories: ExpenseCategory[] = [];
  private customCategories: ExpenseCategory[] = [];
  private categorySuggestionRules: ExpenseRule[] = [];
  protected companyId?: string;

  constructor(config: AgentConfig) {
    super({
      ...config,
      systemPrompt: `You are an expense categorization expert specializing in business expenses and their tax implications. Your expertise is in helping businesses properly categorize expenses and understand their tax deductibility.

Always provide accurate and helpful guidance on expense matters. When addressing expense questions:
1. Help identify the most appropriate category for business expenses
2. Explain tax implications of different expense categories
3. Provide context about deductibility rules and limitations
4. Suggest record-keeping best practices

Your goal is to help businesses maximize legitimate tax deductions while maintaining compliance with tax regulations. Always note that you're providing general guidance, not official tax advice, and recommend consulting with a tax professional for specific situations.`,
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
                  description: "Vendor or merchant name"
                }
              },
              required: ["description"]
            }
          },
          handler: async (params: any) => {
            return await this.categorizeExpense(params);
          }
        },
        {
          function: {
            name: "getExpenseCategories",
            description: "Get available expense categories",
            parameters: {
              type: "object",
              properties: {
                includeCustom: {
                  type: "boolean",
                  description: "Whether to include custom categories"
                },
                filterTaxDeductible: {
                  type: "boolean",
                  description: "Filter to only tax deductible categories"
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
    } catch (error) {
      console.error('Error loading categories and rules:', error);
    }
  }

  private initializeDefaultCategories(): void {
    this.standardCategories = [
      {
        id: 'office_supplies',
        name: 'Office Supplies',
        description: 'Items used in daily office operations such as stationery, paper, pens, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'rent',
        name: 'Rent or Lease',
        description: 'Payments for office space, buildings, land, or equipment leases.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'utilities',
        name: 'Utilities',
        description: 'Expenses for electricity, water, gas, internet, phone services, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'travel',
        name: 'Travel',
        description: 'Business travel expenses including airfare, hotels, transportation, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'meals',
        name: 'Meals & Entertainment',
        description: 'Business meals with clients, team meals, entertainment expenses, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'software',
        name: 'Software & Subscriptions',
        description: 'Software licenses, SaaS subscriptions, online tools, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'professional_services',
        name: 'Professional Services',
        description: 'Legal, accounting, consulting, and other professional services.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'insurance',
        name: 'Insurance',
        description: 'Business insurance premiums including liability, property, workers comp, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'marketing',
        name: 'Marketing & Advertising',
        description: 'Expenses for promoting business including ads, marketing materials, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'training',
        name: 'Training & Education',
        description: 'Employee training, courses, workshops, conferences, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'vehicle',
        name: 'Vehicle Expenses',
        description: 'Business vehicle costs including fuel, maintenance, parking, tolls, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'equipment',
        name: 'Equipment',
        description: 'Purchase of computers, machinery, furniture, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'dues_subscriptions',
        name: 'Dues & Subscriptions',
        description: 'Membership fees, professional subscriptions, publications, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'maintenance',
        name: 'Maintenance & Repairs',
        description: 'Costs to maintain or repair business property or equipment.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'bank_fees',
        name: 'Bank & Credit Card Fees',
        description: 'Fees for business accounts, merchant services, transaction fees, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'payroll',
        name: 'Payroll',
        description: 'Employee wages, salaries, bonuses, and associated costs.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'benefits',
        name: 'Employee Benefits',
        description: 'Health insurance, retirement contributions, and other employee benefits.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'taxes',
        name: 'Taxes & Licenses',
        description: 'Business taxes, licenses, permits, fees, etc.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'charitable',
        name: 'Charitable Contributions',
        description: 'Donations to qualified charitable organizations.',
        tax_deductible: true,
        business_type: ['all']
      },
      {
        id: 'personal',
        name: 'Personal Expenses',
        description: 'Non-business related personal expenses (not tax deductible).',
        tax_deductible: false,
        business_type: ['all']
      }
    ];
  }

  private initializeDefaultRules(): void {
    this.categorySuggestionRules = [
      {
        keywords: ['paper', 'pen', 'stapler', 'clip', 'folder', 'ink', 'toner', 'printer', 'cartridge', 'staples', 'office depot', 'officemax'],
        category_id: 'office_supplies',
        confidence: 0.8
      },
      {
        keywords: ['rent', 'lease', 'office space', 'building', 'property management', 'landlord'],
        category_id: 'rent',
        confidence: 0.9
      },
      {
        keywords: ['electricity', 'water', 'gas', 'power', 'energy', 'internet', 'phone', 'telecom', 'utility', 'water bill', 'electric bill', 'at&t', 'verizon', 'comcast', 'spectrum'],
        category_id: 'utilities',
        confidence: 0.85
      },
      {
        keywords: ['airplane', 'flight', 'hotel', 'motel', 'airbnb', 'uber', 'lyft', 'taxi', 'rental car', 'airline', 'delta', 'southwest', 'united', 'american airlines', 'marriott', 'hilton', 'expedia', 'travelocity'],
        category_id: 'travel',
        confidence: 0.85
      },
      {
        keywords: ['restaurant', 'lunch', 'dinner', 'breakfast', 'coffee', 'meal', 'catering', 'food', 'starbucks', 'grubhub', 'doordash', 'ubereats'],
        category_id: 'meals',
        confidence: 0.8
      },
      {
        keywords: ['software', 'subscription', 'license', 'app', 'microsoft', 'google', 'adobe', 'saas', 'zoom', 'slack', 'dropbox', 'salesforce', 'github', 'aws', 'azure'],
        category_id: 'software',
        confidence: 0.9
      },
      {
        keywords: ['lawyer', 'attorney', 'legal', 'accounting', 'accountant', 'cpa', 'consultant', 'consulting', 'professional', 'bookkeeper', 'tax preparation'],
        category_id: 'professional_services',
        confidence: 0.85
      },
      {
        keywords: ['insurance', 'policy', 'premium', 'coverage', 'liability', 'geico', 'state farm', 'allstate', 'nationwide', 'progressive'],
        category_id: 'insurance',
        confidence: 0.9
      },
      {
        keywords: ['advertising', 'marketing', 'promotion', 'ad', 'campaign', 'facebook ad', 'google ad', 'billboard', 'flyer', 'brochure', 'website', 'seo', 'sem'],
        category_id: 'marketing',
        confidence: 0.85
      },
      {
        keywords: ['training', 'education', 'workshop', 'seminar', 'conference', 'course', 'class', 'certification', 'udemy', 'coursera', 'skillshare', 'edx'],
        category_id: 'training',
        confidence: 0.8
      },
      {
        keywords: ['gas', 'fuel', 'auto', 'vehicle', 'car', 'truck', 'mileage', 'parking', 'toll', 'oil change', 'maintenance', 'repair', 'tire', 'shell', 'exxon', 'chevron', 'bp'],
        category_id: 'vehicle',
        confidence: 0.8
      },
      {
        keywords: ['computer', 'laptop', 'monitor', 'printer', 'server', 'equipment', 'machinery', 'furniture', 'desk', 'chair', 'hardware', 'dell', 'hp', 'apple', 'lenovo', 'ikea'],
        category_id: 'equipment',
        confidence: 0.8
      },
      {
        keywords: ['dues', 'membership', 'subscription', 'journal', 'magazine', 'publication', 'association', 'organization', 'chamber of commerce'],
        category_id: 'dues_subscriptions',
        confidence: 0.8
      },
      {
        keywords: ['maintenance', 'repair', 'cleaning', 'janitor', 'fix', 'service', 'plumber', 'electrician', 'hvac'],
        category_id: 'maintenance',
        confidence: 0.75
      },
      {
        keywords: ['bank fee', 'service charge', 'transaction fee', 'wire fee', 'credit card fee', 'processing fee', 'merchant', 'stripe', 'paypal', 'square'],
        category_id: 'bank_fees',
        confidence: 0.9
      },
      {
        keywords: ['salary', 'wage', 'payroll', 'bonus', 'commission', 'compensation', 'employee', 'staff', 'contractor', 'adp', 'paychex', 'gusto'],
        category_id: 'payroll',
        confidence: 0.9
      },
      {
        keywords: ['health insurance', 'dental', 'vision', 'retirement', '401k', 'pension', 'benefit', 'wellness', 'blue cross', 'aetna', 'cigna', 'united healthcare', 'fidelity', 'vanguard'],
        category_id: 'benefits',
        confidence: 0.85
      },
      {
        keywords: ['tax', 'license', 'permit', 'fee', 'registration', 'incorporation', 'filing', 'irs', 'state tax', 'property tax', 'sales tax'],
        category_id: 'taxes',
        confidence: 0.85
      },
      {
        keywords: ['donation', 'charity', 'charitable', 'nonprofit', 'contribution', 'red cross', 'united way', 'salvation army'],
        category_id: 'charitable',
        confidence: 0.9
      },
      {
        keywords: ['personal', 'private', 'family', 'gift', 'household', 'non-business', 'grocery', 'clothing', 'entertainment'],
        category_id: 'personal',
        confidence: 0.7
      }
    ];
  }

  private async categorizeExpense(params: any): Promise<any> {
    const { description, amount = 0, date, vendor = '' } = params;
    
    const combinedText = `${description} ${vendor}`.toLowerCase();
    
    // Search for matching categories based on rules
    const matches: { category: ExpenseCategory, confidence: number }[] = [];
    
    // Check against standard categories
    for (const rule of this.categorySuggestionRules) {
      let matchCount = 0;
      for (const keyword of rule.keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        const category = this.standardCategories.find(c => c.id === rule.category_id) ||
                         this.customCategories.find(c => c.id === rule.category_id);
        
        if (category) {
          // Adjust confidence based on number of keyword matches
          const adjustedConfidence = rule.confidence * (matchCount / rule.keywords.length);
          
          matches.push({
            category,
            confidence: adjustedConfidence
          });
        }
      }
    }
    
    // Check against custom categories
    for (const customCategory of this.customCategories) {
      if (combinedText.includes(customCategory.name.toLowerCase())) {
        matches.push({
          category: customCategory,
          confidence: 0.9 // High confidence for direct name match
        });
      }
    }
    
    // Sort matches by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Return top matches and confidence levels
    return {
      expense: {
        description,
        amount,
        date,
        vendor
      },
      suggestions: matches.slice(0, 3).map(match => ({
        category_id: match.category.id,
        category_name: match.category.name,
        confidence: parseFloat(match.confidence.toFixed(2)),
        tax_deductible: match.category.tax_deductible
      })),
      tax_notes: this.getTaxNotes(
        matches.length > 0 ? matches[0].category.id : undefined,
        amount,
        description
      )
    };
  }

  private async getExpenseCategories(params: any): Promise<any> {
    const { includeCustom = true, filterTaxDeductible = false } = params || {};
    
    let categories = [...this.standardCategories];
    
    if (includeCustom) {
      categories = [...categories, ...this.customCategories];
    }
    
    if (filterTaxDeductible) {
      categories = categories.filter(category => category.tax_deductible);
    }
    
    // Sort alphabetically by name
    categories.sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        tax_deductible: c.tax_deductible
      })),
      total: categories.length
    };
  }

  private async createCustomCategory(params: any): Promise<any> {
    const { name, description = '', tax_deductible = false } = params;
    
    // Generate a simple ID based on name
    const id = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Check if ID already exists
    const existingCategory = this.standardCategories.find(c => c.id === id) ||
                            this.customCategories.find(c => c.id === id);
    
    if (existingCategory) {
      return {
        success: false,
        error: 'Category with similar name already exists',
        existing_category: {
          id: existingCategory.id,
          name: existingCategory.name
        }
      };
    }
    
    // Create new category
    const newCategory: ExpenseCategory = {
      id,
      name,
      description,
      tax_deductible,
      business_type: ['custom']
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
      return 'Unable to determine tax status without a category.';
    }
    
    const category = this.standardCategories.find(c => c.id === categoryId) ||
                      this.customCategories.find(c => c.id === categoryId);
    
    if (!category) {
      return 'Category not found.';
    }
    
    if (!category.tax_deductible) {
      return 'This expense does not appear to be tax deductible for business purposes.';
    }
    
    let notes = 'This expense is generally tax deductible as a business expense.';
    
    // Add category-specific notes
    switch (categoryId) {
      case 'meals':
        notes += ' Note that business meals are typically limited to 50% deductibility.';
        break;
      case 'vehicle':
        notes += ' Keep detailed mileage logs for business use of vehicles.';
        break;
      case 'equipment':
        if (amount > 2500) {
          notes += ' Items over $2,500 may need to be depreciated rather than expensed.';
        }
        break;
      case 'charitable':
        notes += ' Ensure the organization is a qualified tax-exempt entity to claim deduction.';
        break;
      case 'travel':
        notes += ' Business travel is fully deductible, but mixed personal/business trips require allocation.';
        break;
    }
    
    return notes;
  }
}