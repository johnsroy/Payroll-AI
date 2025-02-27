import { BaseAgent, AgentConfig } from './baseAgent';

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
    // Define specialized system prompt for expense categorization agent
    const expenseSystemPrompt = `You are an expense categorization assistant specialized in business expenses. Your primary functions are:

1. Categorize business expenses based on descriptions, vendors, and amounts
2. Provide information on tax-deductibility of different expense types
3. Suggest appropriate business expense categories for receipts and transactions
4. Explain expense categorization best practices and regulatory requirements

When categorizing expenses:
- Consider both the vendor/merchant and the expense description
- Apply appropriate tax deductibility rules based on current regulations
- Note any special documentation requirements for the expense type
- Provide confidence levels for your categorizations when uncertain
- Consider context such as business type and employee role when available

Be precise about tax deductibility but remind users that tax rules change regularly and can vary by location. Recommend consulting with a tax professional for definitive answers on complex cases.`;

    // Initialize the agent with expense-specific configuration
    super({
      ...config,
      systemPrompt: expenseSystemPrompt,
      temperature: 0.2, // Low temperature for more precise responses
    });
    
    // Store company ID for custom categories
    this.companyId = config.companyId;
    
    // Initialize standard categories and rules
    this.initializeDefaultCategories();
    this.initializeDefaultRules();
    
    // Load any custom categories
    this.loadCategoriesAndRules().catch(error => {
      console.error('Error loading categories and rules:', error);
    });
    
    // Define expense categorization tools
    this.tools = [
      {
        type: "function",
        function: {
          name: "categorize_expense",
          description: "Categorize an expense based on its details",
          parameters: {
            type: "object",
            properties: {
              amount: {
                type: "number",
                description: "The expense amount"
              },
              description: {
                type: "string",
                description: "Description of the expense"
              },
              vendor: {
                type: "string",
                description: "Name of the vendor or merchant"
              },
              date: {
                type: "string",
                description: "Date of the expense (YYYY-MM-DD)"
              },
              business_type: {
                type: "string",
                description: "Type of business (optional)"
              }
            },
            required: ["amount", "description"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_expense_categories",
          description: "Get available expense categories",
          parameters: {
            type: "object",
            properties: {
              include_custom: {
                type: "boolean",
                description: "Whether to include custom categories"
              },
              business_type: {
                type: "string",
                description: "Filter categories by business type"
              },
              tax_deductible_only: {
                type: "boolean",
                description: "Filter to only tax-deductible categories"
              }
            },
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
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
              },
              business_type: {
                type: "array",
                description: "Types of businesses this category applies to",
                items: {
                  type: "string"
                }
              }
            },
            required: ["name", "description", "tax_deductible"]
          }
        }
      }
    ];
  }

  private async loadCategoriesAndRules(): Promise<void> {
    if (this.companyId) {
      try {
        // In a real implementation, load custom categories from database
        // For now we'll just use the defaults
      } catch (error) {
        console.error('Error loading custom categories and rules:', error);
      }
    }
  }

  private initializeDefaultCategories(): void {
    // Standard business expense categories with tax guidance
    this.standardCategories = [
      {
        id: "meals_entertainment",
        name: "Meals & Entertainment",
        description: "Business meals and entertainment expenses",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "travel",
        name: "Travel",
        description: "Business travel expenses including airfare, hotels, and transportation",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "office_supplies",
        name: "Office Supplies",
        description: "Office supplies and equipment under $2,500",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "advertising",
        name: "Advertising & Marketing",
        description: "Advertising, marketing, and promotion expenses",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "professional_services",
        name: "Professional Services",
        description: "Legal, accounting, consulting, and other professional services",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "rent",
        name: "Rent & Utilities",
        description: "Office rent, utilities, and related expenses",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "software_subscription",
        name: "Software & Subscriptions",
        description: "Software licenses, cloud services, and subscriptions",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "telecommunications",
        name: "Telecommunications",
        description: "Phone, internet, and other communication expenses",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "vehicle",
        name: "Vehicle Expenses",
        description: "Business vehicle expenses including mileage, fuel, and maintenance",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "insurance",
        name: "Insurance",
        description: "Business insurance premiums",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "training",
        name: "Training & Education",
        description: "Business-related training, education, and professional development",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "dues_subscriptions",
        name: "Dues & Subscriptions",
        description: "Professional memberships, dues, and non-software subscriptions",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "employee_benefits",
        name: "Employee Benefits",
        description: "Employee benefits and perks",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "bank_fees",
        name: "Bank & Financial Fees",
        description: "Bank fees, merchant fees, and financial service charges",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "taxes_licenses",
        name: "Taxes & Licenses",
        description: "Business taxes, licenses, and permits",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "charitable_contributions",
        name: "Charitable Contributions",
        description: "Donations to charitable organizations",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "office_equipment",
        name: "Office Equipment",
        description: "Depreciable office equipment over $2,500",
        tax_deductible: true,
        business_type: ["all"]
      },
      {
        id: "personal",
        name: "Personal (Non-deductible)",
        description: "Personal expenses (not business-related)",
        tax_deductible: false,
        business_type: ["all"]
      }
    ];
  }

  private initializeDefaultRules(): void {
    // Rules to suggest expense categories based on keywords
    this.categorySuggestionRules = [
      {
        keywords: ["meal", "restaurant", "lunch", "dinner", "breakfast", "cafe", "coffee", "food"],
        category_id: "meals_entertainment",
        confidence: 0.8
      },
      {
        keywords: ["flight", "airline", "hotel", "motel", "lodging", "accommodation", "taxi", "uber", "lyft", "car rental"],
        category_id: "travel",
        confidence: 0.9
      },
      {
        keywords: ["staples", "office depot", "paper", "pens", "ink", "toner", "office supplies"],
        category_id: "office_supplies",
        confidence: 0.85
      },
      {
        keywords: ["ad", "advertising", "facebook ads", "google ads", "marketing", "promotion", "billboard"],
        category_id: "advertising",
        confidence: 0.9
      },
      {
        keywords: ["lawyer", "attorney", "legal", "accountant", "accounting", "consultant", "consulting"],
        category_id: "professional_services",
        confidence: 0.9
      },
      {
        keywords: ["rent", "lease", "electric", "utilities", "water", "gas", "office space"],
        category_id: "rent",
        confidence: 0.85
      },
      {
        keywords: ["software", "saas", "license", "adobe", "microsoft", "subscription", "aws", "azure", "cloud"],
        category_id: "software_subscription",
        confidence: 0.85
      },
      {
        keywords: ["phone", "mobile", "internet", "telecom", "telecommunications", "cell", "data plan"],
        category_id: "telecommunications",
        confidence: 0.8
      },
      {
        keywords: ["fuel", "gas", "mileage", "parking", "toll", "auto", "car", "vehicle", "maintenance"],
        category_id: "vehicle",
        confidence: 0.8
      },
      {
        keywords: ["insurance", "premium", "liability", "coverage"],
        category_id: "insurance",
        confidence: 0.9
      },
      {
        keywords: ["training", "course", "seminar", "conference", "workshop", "education", "certification"],
        category_id: "training",
        confidence: 0.85
      },
      {
        keywords: ["membership", "dues", "subscription", "magazine", "journal", "association"],
        category_id: "dues_subscriptions",
        confidence: 0.8
      },
      {
        keywords: ["benefit", "health", "wellness", "gym", "retirement", "401k", "pension"],
        category_id: "employee_benefits",
        confidence: 0.85
      },
      {
        keywords: ["bank fee", "transaction fee", "service charge", "wire transfer", "merchant fee"],
        category_id: "bank_fees",
        confidence: 0.9
      },
      {
        keywords: ["tax", "license", "permit", "registration", "filing fee"],
        category_id: "taxes_licenses",
        confidence: 0.9
      },
      {
        keywords: ["donation", "charitable", "contribution", "nonprofit", "charity"],
        category_id: "charitable_contributions",
        confidence: 0.9
      },
      {
        keywords: ["laptop", "computer", "equipment", "furniture", "capital", "asset", "machinery"],
        category_id: "office_equipment",
        confidence: 0.8
      },
      {
        keywords: ["personal", "gift", "non-business", "private"],
        category_id: "personal",
        confidence: 0.7
      }
    ];
  }

  private async categorizeExpense(params: any): Promise<any> {
    const { amount, description, vendor = '', date, business_type } = params;
    
    // Combine description and vendor for better keyword matching
    const textToMatch = `${description} ${vendor}`.toLowerCase();
    
    // Get all available categories
    const allCategories = [...this.standardCategories, ...this.customCategories];
    
    // Match against rules to find potential categories
    const matches: { category: ExpenseCategory, confidence: number }[] = [];
    
    for (const rule of this.categorySuggestionRules) {
      // Check if any keywords match
      const matchingKeywords = rule.keywords.filter(keyword => 
        textToMatch.includes(keyword.toLowerCase())
      );
      
      if (matchingKeywords.length > 0) {
        // Calculate confidence based on number of matching keywords
        const keywordMatchRatio = matchingKeywords.length / rule.keywords.length;
        const adjustedConfidence = rule.confidence * keywordMatchRatio;
        
        // Find the category for this rule
        const category = allCategories.find(cat => cat.id === rule.category_id);
        
        if (category) {
          // Check if this category applies to the business type
          if (!business_type || !category.business_type || 
              category.business_type.includes('all') || 
              category.business_type.includes(business_type)) {
            
            matches.push({
              category,
              confidence: adjustedConfidence
            });
          }
        }
      }
    }
    
    // Sort matches by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Get top 3 suggestions
    const topSuggestions = matches.slice(0, 3);
    
    // Include tax notes based on the best match
    const taxNotes = topSuggestions.length > 0 
      ? this.getTaxNotes(topSuggestions[0].category.id, amount, description)
      : "Unable to determine tax status without a category match.";
    
    return {
      expense_details: {
        amount,
        description,
        vendor,
        date
      },
      categorization: {
        best_match: topSuggestions.length > 0 ? {
          category_id: topSuggestions[0].category.id,
          category_name: topSuggestions[0].category.name,
          confidence: parseFloat(topSuggestions[0].confidence.toFixed(2)),
          tax_deductible: topSuggestions[0].category.tax_deductible
        } : null,
        alternative_suggestions: topSuggestions.slice(1).map(match => ({
          category_id: match.category.id,
          category_name: match.category.name,
          confidence: parseFloat(match.confidence.toFixed(2)),
          tax_deductible: match.category.tax_deductible
        }))
      },
      tax_notes: taxNotes
    };
  }

  private async getExpenseCategories(params: any): Promise<any> {
    const { include_custom = true, business_type, tax_deductible_only = false } = params;
    
    // Start with standard categories
    let categories = [...this.standardCategories];
    
    // Add custom categories if requested
    if (include_custom) {
      categories = [...categories, ...this.customCategories];
    }
    
    // Filter by business type if specified
    if (business_type) {
      categories = categories.filter(cat => 
        !cat.business_type || 
        cat.business_type.includes('all') || 
        cat.business_type.includes(business_type)
      );
    }
    
    // Filter by tax deductibility if requested
    if (tax_deductible_only) {
      categories = categories.filter(cat => cat.tax_deductible);
    }
    
    // Format the response
    return {
      count: categories.length,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        tax_deductible: cat.tax_deductible,
        business_type: cat.business_type
      }))
    };
  }

  private async createCustomCategory(params: any): Promise<any> {
    const { name, description, tax_deductible, business_type = ['all'] } = params;
    
    // Generate a unique ID for the new category
    const id = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    // Create the new category
    const newCategory: ExpenseCategory = {
      id,
      name,
      description,
      tax_deductible,
      business_type
    };
    
    // Add to custom categories
    this.customCategories.push(newCategory);
    
    // In a real implementation, save to database here
    
    return {
      success: true,
      category: newCategory
    };
  }

  private getTaxNotes(categoryId: string | undefined, amount: number, description: string): string {
    if (!categoryId) {
      return "Unable to provide tax guidance without a category.";
    }
    
    // Get the category
    const category = [...this.standardCategories, ...this.customCategories]
      .find(cat => cat.id === categoryId);
    
    if (!category) {
      return "Category not found. Unable to provide tax guidance.";
    }
    
    // Generate appropriate tax notes based on the category
    if (!category.tax_deductible) {
      return "This expense appears to be non-deductible. Personal expenses are generally not deductible for business purposes.";
    }
    
    let notes = `This expense is generally tax-deductible as a ${category.name} expense.`;
    
    // Add category-specific tax notes
    switch (categoryId) {
      case "meals_entertainment":
        notes += " Note that meals are typically only 50% deductible for tax purposes. Keep detailed records including who was present and the business purpose.";
        break;
      case "travel":
        notes += " Business travel expenses are deductible when the primary purpose is business. Keep all receipts and document the business purpose.";
        break;
      case "vehicle":
        notes += " Vehicle expenses can be deducted either using actual expenses or the standard mileage rate. Maintain a detailed mileage log.";
        break;
      case "charitable_contributions":
        notes += " Charitable contributions may be deductible, but restrictions apply. Obtain receipts for all donations.";
        break;
      case "office_equipment":
        if (amount > 2500) {
          notes += " Equipment purchases over $2,500 may need to be depreciated rather than expensed immediately. Consider Section 179 deduction or bonus depreciation rules.";
        }
        break;
    }
    
    notes += " Tax rules change frequently. Consult with a tax professional for definitive guidance.";
    
    return notes;
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
        case 'categorize_expense':
          functionResult = await this.categorizeExpense(args);
          break;
        case 'get_expense_categories':
          functionResult = await this.getExpenseCategories(args);
          break;
        case 'create_custom_category':
          functionResult = await this.createCustomCategory(args);
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