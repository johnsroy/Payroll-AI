import { BaseAgent, AgentConfig } from './baseAgent';

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  applies_to: string[];
  employee_threshold?: number;
  regions: string[];
  deadline_type: 'fixed' | 'relative' | 'recurring';
  deadline_details?: any;
  reference_url?: string;
  penalties?: string;
}

export class ComplianceAgent extends BaseAgent {
  private federalRequirements: ComplianceRequirement[] = [];
  private stateRequirements: Record<string, ComplianceRequirement[]> = {};
  private industryRequirements: Record<string, ComplianceRequirement[]> = {};
  private companyProfile: any = null;

  constructor(config: AgentConfig) {
    // Define specialized system prompt for compliance agent
    const complianceSystemPrompt = `You are a payroll compliance assistant specializing in workplace regulations. Your primary functions include:

1. Providing information on federal, state, and local payroll regulations and requirements
2. Tracking compliance deadlines for tax filings, reports, and payments
3. Alerting about upcoming requirements and changes in regulations
4. Answering questions about specific compliance issues

When addressing compliance inquiries:
- Specify which jurisdictions (federal, state, local) the requirements apply to
- Note any size-based exemptions (e.g., requirements that only apply to employers with X or more employees)
- Include filing deadlines and potential penalties for non-compliance
- Provide links to official resources when available
- Clarify when requirements vary by industry or worker classification

Always be clear that you're providing general information, not legal advice, and recommend consulting with a qualified professional for specific situations.`;

    // Initialize the agent with compliance-specific configuration
    super({
      ...config,
      systemPrompt: complianceSystemPrompt,
      temperature: 0.3, // Moderate temperature for balanced responses
    });
    
    // Load the company profile if available
    if (config.companyId) {
      this.loadCompanyProfile(config.companyId).catch(error => {
        console.error('Error loading company profile:', error);
      });
    }
    
    // Initialize compliance data
    this.initializeDefaultFederalRequirements();
    this.initializeDefaultStateRequirements();
    
    // Define compliance tools
    this.tools = [
      {
        type: "function",
        function: {
          name: "get_compliance_requirements",
          description: "Get compliance requirements based on location, company size, and industry",
          parameters: {
            type: "object",
            properties: {
              state: {
                type: "string",
                description: "Two-letter state code (optional)"
              },
              employee_count: {
                type: "number",
                description: "Number of employees (optional)"
              },
              industry: {
                type: "string",
                description: "Industry type (optional)"
              },
              requirement_type: {
                type: "string",
                description: "Type of requirement (filing, reporting, payment, all)",
                enum: ["filing", "reporting", "payment", "all"]
              }
            },
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "check_compliance_status",
          description: "Check compliance status for specific requirements",
          parameters: {
            type: "object",
            properties: {
              requirement_ids: {
                type: "array",
                description: "Array of requirement IDs to check status for",
                items: {
                  type: "string"
                }
              },
              company_id: {
                type: "string",
                description: "Company ID (optional)"
              }
            },
            required: ["requirement_ids"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_upcoming_deadlines",
          description: "Get upcoming compliance deadlines",
          parameters: {
            type: "object",
            properties: {
              days_ahead: {
                type: "number",
                description: "Number of days ahead to look for deadlines"
              },
              state: {
                type: "string",
                description: "Two-letter state code (optional)"
              },
              requirement_type: {
                type: "string",
                description: "Type of requirement (filing, reporting, payment, all)",
                enum: ["filing", "reporting", "payment", "all"]
              }
            },
            required: ["days_ahead"]
          }
        }
      }
    ];
    
    // Load compliance data
    this.loadComplianceData().catch(error => {
      console.error('Error loading compliance data:', error);
    });
  }

  private async loadComplianceData(): Promise<void> {
    // In a real implementation, this would load from a database or API
    // For now, we'll use the default requirements
  }

  private async loadCompanyProfile(companyId?: string): Promise<void> {
    if (!companyId) return;
    
    try {
      // In a real implementation, this would fetch from an API
      // For now, use a mock profile
      this.companyProfile = {
        id: companyId,
        name: "Demo Company Inc.",
        employee_count: 45,
        state: "CA",
        industry: "Technology",
        established_date: "2020-01-01"
      };
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  }

  private initializeDefaultFederalRequirements(): void {
    this.federalRequirements = [
      {
        id: "fed_941",
        name: "Form 941 - Employer's Quarterly Federal Tax Return",
        description: "Quarterly report to reconcile withheld income taxes, Social Security, and Medicare taxes",
        applies_to: ["all_employers"],
        regions: ["federal"],
        deadline_type: "recurring",
        deadline_details: {
          frequency: "quarterly",
          month_days: [31, 30, 31, 31], // Last day of Apr, Jul, Oct, Jan
          months: [4, 7, 10, 1], // Apr, Jul, Oct, Jan
          quarters: [1, 2, 3, 4]
        },
        reference_url: "https://www.irs.gov/forms-pubs/about-form-941",
        penalties: "Penalties range from 2% to 15% of unpaid tax based on how late the filing occurs"
      },
      {
        id: "fed_940",
        name: "Form 940 - Employer's Annual Federal Unemployment Tax Return",
        description: "Annual report for Federal Unemployment Tax Act (FUTA) taxes",
        applies_to: ["employers_with_futa_obligations"],
        regions: ["federal"],
        deadline_type: "fixed",
        deadline_details: {
          month: 1,
          day: 31,
          year: null
        },
        reference_url: "https://www.irs.gov/forms-pubs/about-form-940",
        penalties: "Penalties of up to 25% of unpaid FUTA tax"
      },
      {
        id: "fed_w2",
        name: "Form W-2 Filing",
        description: "Annual wage and tax statement for each employee",
        applies_to: ["all_employers"],
        regions: ["federal"],
        deadline_type: "fixed",
        deadline_details: {
          month: 1,
          day: 31,
          year: null
        },
        reference_url: "https://www.irs.gov/forms-pubs/about-form-w2",
        penalties: "Penalties range from $50 to $280 per form based on lateness"
      },
      {
        id: "fed_1099",
        name: "Form 1099-NEC and 1099-MISC Filing",
        description: "Annual reporting of payments to independent contractors and miscellaneous income",
        applies_to: ["employers_with_contractors"],
        regions: ["federal"],
        deadline_type: "fixed",
        deadline_details: {
          month: 1,
          day: 31,
          year: null
        },
        reference_url: "https://www.irs.gov/forms-pubs/about-form-1099-nec",
        penalties: "Penalties range from $50 to $280 per form based on lateness"
      },
      {
        id: "fed_eeoc",
        name: "EEO-1 Report",
        description: "Annual reporting of workforce demographics by job category, race, and gender",
        applies_to: ["private_employers"],
        employee_threshold: 100,
        regions: ["federal"],
        deadline_type: "fixed",
        deadline_details: {
          month: 5, // Typically due in May but can vary
          day: 31,
          year: null
        },
        reference_url: "https://www.eeoc.gov/employers/eeo-1-data-collection",
        penalties: "Potential contract debarment for federal contractors and legal action"
      },
      {
        id: "fed_aca",
        name: "Affordable Care Act (ACA) Reporting",
        description: "Annual reporting of health insurance coverage information (Forms 1095-B/C)",
        applies_to: ["applicable_large_employers"],
        employee_threshold: 50,
        regions: ["federal"],
        deadline_type: "fixed",
        deadline_details: {
          month: 2, // Forms to individuals by January, to IRS by February/March
          day: 28,
          year: null
        },
        reference_url: "https://www.irs.gov/affordable-care-act/employers/aca-information-center-for-applicable-large-employers-ales",
        penalties: "Penalties range from $50 to $280 per form based on lateness"
      },
      {
        id: "fed_newHire",
        name: "New Hire Reporting",
        description: "Reporting of newly hired employees to the National Directory of New Hires",
        applies_to: ["all_employers"],
        regions: ["federal"],
        deadline_type: "relative",
        deadline_details: {
          days: 20,
          event: "hire_date"
        },
        reference_url: "https://www.acf.hhs.gov/css/employers/new-hire-reporting",
        penalties: "Varies by state, typically $25 per unreported employee"
      }
    ];
  }

  private initializeDefaultStateRequirements(): void {
    // California requirements
    const californiaRequirements: ComplianceRequirement[] = [
      {
        id: "ca_de9",
        name: "DE 9 - Quarterly Contribution Return and Report of Wages",
        description: "Quarterly reporting of wages and state payroll taxes in California",
        applies_to: ["california_employers"],
        regions: ["CA"],
        deadline_type: "recurring",
        deadline_details: {
          frequency: "quarterly",
          month_days: [31, 31, 31, 31], // Last day of Apr, Jul, Oct, Jan
          months: [4, 7, 10, 1],
          quarters: [1, 2, 3, 4]
        },
        reference_url: "https://edd.ca.gov/en/Payroll_Taxes/Forms_and_Publications",
        penalties: "Penalties of 10% to 25% of tax due, plus interest"
      },
      {
        id: "ca_de9c",
        name: "DE 9C - Quarterly Contribution Return and Report of Wages (Continuation)",
        description: "Detailed report of individual employee wages and withholdings in California",
        applies_to: ["california_employers"],
        regions: ["CA"],
        deadline_type: "recurring",
        deadline_details: {
          frequency: "quarterly",
          month_days: [31, 31, 31, 31], // Last day of Apr, Jul, Oct, Jan
          months: [4, 7, 10, 1],
          quarters: [1, 2, 3, 4]
        },
        reference_url: "https://edd.ca.gov/en/Payroll_Taxes/Forms_and_Publications",
        penalties: "Penalties of 10% to 25% of tax due, plus interest"
      },
      {
        id: "ca_cpfl",
        name: "California Paid Family Leave (PFL) Notice",
        description: "Required notice to employees about California's Paid Family Leave program",
        applies_to: ["california_employers"],
        regions: ["CA"],
        deadline_type: "relative",
        deadline_details: {
          days: 0, // At time of hire and when employee requests leave
          event: "hire_date"
        },
        reference_url: "https://edd.ca.gov/en/disability/Paid_Family_Leave",
        penalties: "Potential penalties for non-compliance with notification requirements"
      },
      {
        id: "ca_payDay",
        name: "California Payday Notice",
        description: "Requirements to post information about regular paydays",
        applies_to: ["california_employers"],
        regions: ["CA"],
        deadline_type: "relative",
        deadline_details: {
          days: 0, // Ongoing requirement
          event: "continuous"
        },
        reference_url: "https://www.dir.ca.gov/dlse/paydaynotice.pdf",
        penalties: "Civil penalties of $50-$100 per violation"
      }
    ];
    
    // New York requirements
    const newYorkRequirements: ComplianceRequirement[] = [
      {
        id: "ny_nys45",
        name: "NYS-45 - Quarterly Combined Withholding, Wage Reporting, and Unemployment Insurance Return",
        description: "Quarterly reporting of wages and state withholding taxes in New York",
        applies_to: ["new_york_employers"],
        regions: ["NY"],
        deadline_type: "recurring",
        deadline_details: {
          frequency: "quarterly",
          month_days: [31, 31, 31, 31], // Last day of Apr, Jul, Oct, Jan
          months: [4, 7, 10, 1],
          quarters: [1, 2, 3, 4]
        },
        reference_url: "https://www.tax.ny.gov/bus/ads/efile_addfaq_nys45.htm",
        penalties: "Penalties range from $50 to percentage-based penalties on unpaid taxes"
      },
      {
        id: "ny_pfl",
        name: "New York Paid Family Leave (PFL) Notice",
        description: "Required notice to employees about New York's Paid Family Leave program",
        applies_to: ["new_york_employers"],
        regions: ["NY"],
        deadline_type: "relative",
        deadline_details: {
          days: 0, // At time of hire and annually
          event: "hire_date"
        },
        reference_url: "https://paidfamilyleave.ny.gov/employers",
        penalties: "Potential penalties for non-compliance with notification requirements"
      }
    ];
    
    // Texas requirements (fewer due to no state income tax)
    const texasRequirements: ComplianceRequirement[] = [
      {
        id: "tx_c3",
        name: "Form C-3 - Employer's Quarterly Report",
        description: "Quarterly unemployment tax reporting in Texas",
        applies_to: ["texas_employers"],
        regions: ["TX"],
        deadline_type: "recurring",
        deadline_details: {
          frequency: "quarterly",
          month_days: [31, 31, 31, 31], // Last day of Apr, Jul, Oct, Jan
          months: [4, 7, 10, 1],
          quarters: [1, 2, 3, 4]
        },
        reference_url: "https://www.twc.texas.gov/businesses/unemployment-tax-reports-and-payments",
        penalties: "Interest accrues at 1.5% per month on unpaid amounts"
      },
      {
        id: "tx_newHire",
        name: "Texas New Hire Reporting",
        description: "Reporting of newly hired employees to the Texas Workforce Commission",
        applies_to: ["texas_employers"],
        regions: ["TX"],
        deadline_type: "relative",
        deadline_details: {
          days: 20,
          event: "hire_date"
        },
        reference_url: "https://www.twc.texas.gov/businesses/new-hire-reporting",
        penalties: "Penalties of $25 per unreported employee"
      }
    ];
    
    // Add all state requirements to the map
    this.stateRequirements = {
      CA: californiaRequirements,
      NY: newYorkRequirements,
      TX: texasRequirements
    };
  }

  private initializeDefaultIndustryRequirements(): void {
    // Healthcare industry requirements
    const healthcareRequirements: ComplianceRequirement[] = [
      {
        id: "hc_hipaa",
        name: "HIPAA Training",
        description: "Required training for employees on handling protected health information",
        applies_to: ["healthcare_providers", "health_plans", "healthcare_clearinghouses"],
        regions: ["federal"],
        deadline_type: "relative",
        deadline_details: {
          days: 90,
          event: "hire_date",
          recurring: true,
          recurring_period: "annual"
        },
        reference_url: "https://www.hhs.gov/hipaa/for-professionals/training/index.html",
        penalties: "Civil penalties range from $100 to $50,000 per violation"
      }
    ];
    
    // Construction industry requirements
    const constructionRequirements: ComplianceRequirement[] = [
      {
        id: "const_osha",
        name: "OSHA Construction Safety Training",
        description: "Required safety training for construction workers",
        applies_to: ["construction"],
        regions: ["federal"],
        deadline_type: "relative",
        deadline_details: {
          days: 30,
          event: "hire_date",
          recurring: true,
          recurring_period: "annual"
        },
        reference_url: "https://www.osha.gov/training/construction",
        penalties: "OSHA penalties can range from $14,502 to $145,027 per violation"
      }
    ];
    
    // Add all industry requirements to the map
    this.industryRequirements = {
      healthcare: healthcareRequirements,
      construction: constructionRequirements
    };
  }

  private async getComplianceRequirements(params: any): Promise<any> {
    const { state, employee_count, industry, requirement_type = 'all' } = params;
    
    // Start with federal requirements
    let requirements = [...this.federalRequirements];
    
    // Add state-specific requirements if a state is specified
    if (state && this.stateRequirements[state.toUpperCase()]) {
      requirements = [...requirements, ...this.stateRequirements[state.toUpperCase()]];
    }
    
    // Add industry-specific requirements if an industry is specified
    if (industry && this.industryRequirements[industry.toLowerCase()]) {
      requirements = [...requirements, ...this.industryRequirements[industry.toLowerCase()]];
    }
    
    // Filter by employee threshold if employee count is provided
    if (employee_count !== undefined) {
      requirements = requirements.filter(req => 
        !req.employee_threshold || employee_count >= req.employee_threshold
      );
    }
    
    // Filter by requirement type if specified
    if (requirement_type !== 'all') {
      // This is a simplified approach; in reality, requirements would have a type field
      const typeKeywords: Record<string, string[]> = {
        filing: ['form', 'filing', 'return', 'report'],
        reporting: ['report', 'reporting', 'notice'],
        payment: ['payment', 'tax', 'withholding', 'contribution']
      };
      
      const keywords = typeKeywords[requirement_type] || [];
      
      if (keywords.length > 0) {
        requirements = requirements.filter(req => 
          keywords.some(keyword => 
            req.name.toLowerCase().includes(keyword) || 
            req.description.toLowerCase().includes(keyword)
          )
        );
      }
    }
    
    // Format the response
    return {
      count: requirements.length,
      requirements: requirements.map(req => ({
        id: req.id,
        name: req.name,
        description: req.description,
        regions: req.regions,
        deadline_type: req.deadline_type,
        deadline_details: req.deadline_details,
        reference_url: req.reference_url,
        penalties: req.penalties
      }))
    };
  }

  private async checkComplianceStatus(params: any): Promise<any> {
    const { requirement_ids, company_id } = params;
    
    // In a real implementation, this would check against a database of completed requirements
    // For this demo, we'll generate random statuses
    
    const statuses = requirement_ids.map((id: string) => {
      // Find the requirement details
      let requirement = this.federalRequirements.find(r => r.id === id);
      
      if (!requirement) {
        // Check state requirements
        for (const state in this.stateRequirements) {
          const stateReq = this.stateRequirements[state].find(r => r.id === id);
          if (stateReq) {
            requirement = stateReq;
            break;
          }
        }
      }
      
      if (!requirement) {
        // Check industry requirements
        for (const industry in this.industryRequirements) {
          const industryReq = this.industryRequirements[industry].find(r => r.id === id);
          if (industryReq) {
            requirement = industryReq;
            break;
          }
        }
      }
      
      if (!requirement) {
        return {
          requirement_id: id,
          status: 'unknown',
          details: 'Requirement not found'
        };
      }
      
      // Generate a random status for demo purposes
      const statuses = ['completed', 'pending', 'overdue', 'not_applicable'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // If status is completed, generate a completed date
      let completedDate = null;
      let nextDueDate = null;
      
      if (randomStatus === 'completed') {
        // Random date in the past 1-90 days
        const daysAgo = Math.floor(Math.random() * 90) + 1;
        const completedDateObj = new Date();
        completedDateObj.setDate(completedDateObj.getDate() - daysAgo);
        completedDate = completedDateObj.toISOString().split('T')[0];
        
        // If recurring, calculate next due date
        if (requirement.deadline_type === 'recurring') {
          nextDueDate = this.calculateNextDeadline(requirement);
        }
      } else if (randomStatus === 'pending') {
        // Calculate upcoming due date
        nextDueDate = this.calculateNextDeadline(requirement);
      } else if (randomStatus === 'overdue') {
        // Random date in the past 1-30 days
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() - daysAgo);
        nextDueDate = dueDateObj.toISOString().split('T')[0];
      }
      
      return {
        requirement_id: id,
        name: requirement.name,
        status: randomStatus,
        completed_date: completedDate,
        next_due_date: nextDueDate,
        details: `Status for ${requirement.name}`
      };
    });
    
    return {
      company_id: company_id || (this.companyProfile ? this.companyProfile.id : 'unknown'),
      statuses
    };
  }

  private async getUpcomingDeadlines(params: any): Promise<any> {
    const { days_ahead, state, requirement_type = 'all' } = params;
    
    // Get all applicable requirements
    const requirementsResponse = await this.getComplianceRequirements({
      state,
      requirement_type
    });
    
    const requirements = requirementsResponse.requirements;
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + days_ahead);
    
    // Calculate upcoming deadlines
    const deadlines = [];
    
    for (const req of requirements) {
      const nextDeadline = this.calculateNextDeadline(req);
      
      if (nextDeadline) {
        const deadlineDate = new Date(nextDeadline);
        
        if (deadlineDate > today && deadlineDate <= maxDate) {
          const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          deadlines.push({
            requirement_id: req.id,
            name: req.name,
            deadline_date: nextDeadline,
            days_until: daysUntil,
            description: req.description,
            penalties: req.penalties,
            reference_url: req.reference_url
          });
        }
      }
    }
    
    // Sort by deadline date
    deadlines.sort((a, b) => {
      return new Date(a.deadline_date || '').getTime() - new Date(b.deadline_date || '').getTime();
    });
    
    return {
      count: deadlines.length,
      deadlines
    };
  }

  private calculateNextDeadline(requirement: ComplianceRequirement): string | null {
    const today = new Date();
    
    if (requirement.deadline_type === 'fixed') {
      // Fixed annual deadline like Jan 31 every year
      const details = requirement.deadline_details;
      const month: number = details.month;
      const day: number = details.day;
      let year = today.getFullYear();
      
      // If this year's deadline has passed, use next year
      const deadlineThisYear = new Date(year, month - 1, day);
      if (deadlineThisYear < today) {
        year++;
      }
      
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else if (requirement.deadline_type === 'recurring') {
      // Recurring deadlines like quarterly filings
      const details = requirement.deadline_details;
      
      if (details.frequency === 'quarterly') {
        const currentMonth = today.getMonth() + 1; // JS months are 0-11
        const currentQuarter = Math.ceil(currentMonth / 3);
        
        // Find the next quarter deadline
        let nextQuarter = currentQuarter;
        let deadlineYear = today.getFullYear();
        
        // If we're close to or past this quarter's deadline, use next quarter
        const quarterDeadlineMonth = details.months[currentQuarter - 1];
        const quarterDeadlineDay = details.month_days[currentQuarter - 1];
        
        // Handle Q4 which might have deadline in next year (e.g., January)
        let quarterDeadlineYear = deadlineYear;
        if (currentQuarter === 4 && quarterDeadlineMonth < 4) {
          quarterDeadlineYear++;
        }
        
        const quarterDeadline = new Date(quarterDeadlineYear, quarterDeadlineMonth - 1, quarterDeadlineDay);
        
        if (today >= quarterDeadline) {
          nextQuarter = currentQuarter % 4 + 1;
          if (nextQuarter === 1) {
            deadlineYear++;
          }
        }
        
        // Calculate the next deadline
        const nextDeadlineMonth = details.months[nextQuarter - 1];
        const nextDeadlineDay = details.month_days[nextQuarter - 1];
        
        // Handle Q4 which might have deadline in next year (e.g., January)
        let nextDeadlineYear = deadlineYear;
        if (nextQuarter === 1 && nextDeadlineMonth < 4) {
          nextDeadlineYear++;
        }
        
        return `${nextDeadlineYear}-${nextDeadlineMonth.toString().padStart(2, '0')}-${nextDeadlineDay.toString().padStart(2, '0')}`;
      }
      
      // Handle other frequencies if needed
      return null;
    } else if (requirement.deadline_type === 'relative') {
      // Relative deadlines like "20 days after hire"
      // This would normally be calculated based on specific events tracked in the system
      // For demo purposes, return a date a few days in the future
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1); // Random date within 30 days
      return futureDate.toISOString().split('T')[0];
    }
    
    return null;
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
        case 'get_compliance_requirements':
          functionResult = await this.getComplianceRequirements(args);
          break;
        case 'check_compliance_status':
          functionResult = await this.checkComplianceStatus(args);
          break;
        case 'get_upcoming_deadlines':
          functionResult = await this.getUpcomingDeadlines(args);
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