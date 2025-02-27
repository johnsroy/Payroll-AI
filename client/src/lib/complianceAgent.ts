import { BaseAgent, AgentConfig } from './baseAgent';

// Define compliance requirement interface
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
    super({
      ...config,
      systemPrompt: `You are a compliance advisor specializing in payroll and employment regulations. Your expertise is in helping businesses stay compliant with federal, state, and industry-specific requirements.

Always provide accurate and helpful guidance on compliance matters. When addressing compliance questions:
1. Identify relevant requirements based on company size, location, and industry
2. Explain deadlines and filing requirements clearly
3. Highlight potential penalties for non-compliance
4. Provide actionable steps to maintain or achieve compliance

Your goal is to help businesses understand their compliance obligations and avoid penalties or legal issues related to payroll and employment.`,
      tools: [
        {
          function: {
            name: "getComplianceRequirements",
            description: "Get compliance requirements based on company profile",
            parameters: {
              type: "object",
              properties: {
                state: {
                  type: "string",
                  description: "State code (e.g., CA, NY, TX)"
                },
                employeeCount: {
                  type: "number",
                  description: "Number of employees"
                },
                industry: {
                  type: "string",
                  description: "Industry type"
                },
                includeDetails: {
                  type: "boolean",
                  description: "Whether to include detailed information"
                }
              },
              required: ["state"]
            }
          },
          handler: async (params: any) => {
            return await this.getComplianceRequirements(params);
          }
        },
        {
          function: {
            name: "checkComplianceStatus",
            description: "Check compliance status for specific requirements",
            parameters: {
              type: "object",
              properties: {
                requirementIds: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "IDs of requirements to check"
                }
              },
              required: ["requirementIds"]
            }
          },
          handler: async (params: any) => {
            return await this.checkComplianceStatus(params);
          }
        },
        {
          function: {
            name: "getUpcomingDeadlines",
            description: "Get upcoming compliance deadlines",
            parameters: {
              type: "object",
              properties: {
                state: {
                  type: "string",
                  description: "State code (e.g., CA, NY, TX)"
                },
                daysAhead: {
                  type: "number",
                  description: "Number of days to look ahead"
                },
                category: {
                  type: "string",
                  description: "Category of requirements (e.g., 'tax', 'benefits', 'reporting')"
                }
              }
            }
          },
          handler: async (params: any) => {
            return await this.getUpcomingDeadlines(params);
          }
        }
      ]
    });

    this.companyId = config.companyId;
    
    // Load compliance data
    this.loadComplianceData();
    
    // If we have a company ID, load the company profile
    if (config.companyId) {
      this.loadCompanyProfile(config.companyId);
    }
  }

  private async loadComplianceData(): Promise<void> {
    try {
      // In a real implementation, we would fetch this from a database
      // For now, we'll initialize with some default values
      this.initializeDefaultFederalRequirements();
      this.initializeDefaultStateRequirements();
      this.initializeDefaultIndustryRequirements();
    } catch (error) {
      console.error('Error loading compliance data:', error);
    }
  }

  private async loadCompanyProfile(companyId?: string): Promise<void> {
    if (!companyId) return;
    
    try {
      // In a real implementation, we would fetch the company profile from the database
      // For now, we'll use a placeholder
      this.companyProfile = {
        id: companyId,
        name: 'Sample Company',
        state: 'CA',
        employeeCount: 50,
        industry: 'technology'
      };
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  }

  private initializeDefaultFederalRequirements(): void {
    this.federalRequirements = [
      {
        id: 'fed-941',
        name: 'Form 941 - Employer's Quarterly Federal Tax Return',
        description: 'Employers who withhold income taxes, social security tax, or Medicare tax from employee's paychecks or who must pay the employer's portion of social security or Medicare tax.',
        applies_to: ['all'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'quarterly',
          months: [4, 7, 10, 1],
          day: 31
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-941',
        penalties: 'Penalties vary based on how late the filing is, ranging from 2% to 15% of the unpaid tax.'
      },
      {
        id: 'fed-940',
        name: 'Form 940 - Employer's Annual Federal Unemployment Tax Return',
        description: 'Employers who paid wages of $1,500 or more in any calendar quarter or had one or more employees for at least some part of a day in any 20 or more different weeks.',
        applies_to: ['all'],
        regions: ['US'],
        deadline_type: 'fixed',
        deadline_details: {
          month: 1,
          day: 31
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-940',
        penalties: 'Late filing penalties of 5% of the unpaid tax for each month or part of a month the return is late, up to 25%.'
      },
      {
        id: 'fed-w2',
        name: 'Form W-2 - Wage and Tax Statement',
        description: 'Employers must provide W-2 forms to their employees and the Social Security Administration.',
        applies_to: ['all'],
        regions: ['US'],
        deadline_type: 'fixed',
        deadline_details: {
          month: 1,
          day: 31
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-w2',
        penalties: 'Penalties range from $50 to $280 per form, depending on how late the filing is.'
      },
      {
        id: 'fed-aca',
        name: 'Affordable Care Act Reporting (Forms 1094-C and 1095-C)',
        description: 'Applicable Large Employers (ALEs) must report information about health insurance coverage offered to full-time employees.',
        applies_to: ['ale'],
        employee_threshold: 50,
        regions: ['US'],
        deadline_type: 'fixed',
        deadline_details: {
          month: 2,
          day: 28
        },
        reference_url: 'https://www.irs.gov/affordable-care-act/employers/information-reporting-by-applicable-large-employers',
        penalties: 'Penalties range from $50 to $280 per form, depending on how late the filing is.'
      },
      {
        id: 'fed-eeo1',
        name: 'EEO-1 Report',
        description: 'Private employers with 100+ employees and federal contractors with 50+ employees must file annual EEO-1 reports with the EEOC.',
        applies_to: ['private', 'federal-contractor'],
        employee_threshold: 50,
        regions: ['US'],
        deadline_type: 'fixed',
        deadline_details: {
          month: 3,
          day: 31
        },
        reference_url: 'https://www.eeoc.gov/employers/eeo-1-data-collection',
        penalties: 'Potential loss of federal contracts and other legal actions.'
      }
    ];
  }

  private initializeDefaultStateRequirements(): void {
    this.stateRequirements = {
      CA: [
        {
          id: 'ca-de9',
          name: 'DE 9 - Quarterly Contribution Return and Report of Wages',
          description: 'California employers must file this form quarterly to report employee wages and pay unemployment insurance taxes.',
          applies_to: ['all'],
          regions: ['CA'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'quarterly',
            months: [4, 7, 10, 1],
            day: 31
          },
          reference_url: 'https://edd.ca.gov/en/Payroll_Taxes/Forms_and_Publications',
          penalties: 'Penalties of 10% plus interest on late payments.'
        },
        {
          id: 'ca-cpra',
          name: 'California Pay Data Reporting',
          description: 'Private employers with 100+ employees must submit pay data reports to the California Civil Rights Department.',
          applies_to: ['private'],
          employee_threshold: 100,
          regions: ['CA'],
          deadline_type: 'fixed',
          deadline_details: {
            month: 5,
            day: 10
          },
          reference_url: 'https://calcivilrights.ca.gov/paydatareporting/',
          penalties: 'Civil penalties of up to $100 per employee for initial violation and up to $200 per employee for subsequent violations.'
        }
      ],
      NY: [
        {
          id: 'ny-nys45',
          name: 'NYS-45 - Quarterly Combined Withholding, Wage Reporting, and Unemployment Insurance Return',
          description: 'New York employers must file this form quarterly to report employee wages and pay withholding and unemployment insurance taxes.',
          applies_to: ['all'],
          regions: ['NY'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'quarterly',
            months: [4, 7, 10, 1],
            day: 31
          },
          reference_url: 'https://www.tax.ny.gov/bus/ads/efile_addnys45_info.htm',
          penalties: 'Penalties of up to 10% of the taxes due plus interest.'
        }
      ],
      TX: [
        {
          id: 'tx-c3',
          name: 'Form C-3 - Employer's Quarterly Report',
          description: 'Texas employers must file this form quarterly to report employee wages and pay unemployment insurance taxes.',
          applies_to: ['all'],
          regions: ['TX'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'quarterly',
            months: [4, 7, 10, 1],
            day: 31
          },
          reference_url: 'https://www.twc.texas.gov/businesses/unemployment-tax-registration',
          penalties: 'Late reporting penalties of $15 plus interest.'
        }
      ]
    };
  }

  private initializeDefaultIndustryRequirements(): void {
    this.industryRequirements = {
      healthcare: [
        {
          id: 'hipaa-training',
          name: 'Annual HIPAA Training',
          description: 'Healthcare organizations must provide annual HIPAA training to all employees who handle protected health information.',
          applies_to: ['healthcare'],
          regions: ['US'],
          deadline_type: 'relative',
          deadline_details: {
            based_on: 'hire_date',
            recurring: true,
            frequency: 'yearly'
          },
          reference_url: 'https://www.hhs.gov/hipaa/for-professionals/training/index.html',
          penalties: 'HIPAA violations can result in penalties ranging from $100 to $50,000 per violation.'
        }
      ],
      construction: [
        {
          id: 'osha-300a',
          name: 'OSHA Form 300A - Summary of Work-Related Injuries and Illnesses',
          description: 'Construction companies with 10+ employees must post this form from February 1 to April 30 each year.',
          applies_to: ['construction'],
          employee_threshold: 10,
          regions: ['US'],
          deadline_type: 'fixed',
          deadline_details: {
            month: 2,
            day: 1
          },
          reference_url: 'https://www.osha.gov/recordkeeping/forms',
          penalties: 'OSHA penalties for serious violations can be up to $14,502 per violation.'
        }
      ],
      financial: [
        {
          id: 'finra-u4',
          name: 'Form U4 Updates',
          description: 'Financial firms must update Form U4 for registered representatives within 30 days of a reportable event.',
          applies_to: ['financial'],
          regions: ['US'],
          deadline_type: 'relative',
          deadline_details: {
            based_on: 'event_date',
            days: 30
          },
          reference_url: 'https://www.finra.org/registration-exams-ce/classic-crd/forms',
          penalties: 'FINRA can impose fines for late U4 filings, ranging from $5,000 to $10,000 per violation.'
        }
      ]
    };
  }

  private async getComplianceRequirements(params: any): Promise<any> {
    const { state, employeeCount, industry, includeDetails = true } = params;
    
    let requirements: ComplianceRequirement[] = [];
    
    // Add federal requirements that apply to all or those that meet employee threshold
    requirements = this.federalRequirements.filter(req => {
      if (req.employee_threshold && employeeCount < req.employee_threshold) {
        return false;
      }
      return true;
    });
    
    // Add state-specific requirements
    if (state && this.stateRequirements[state]) {
      const stateReqs = this.stateRequirements[state].filter(req => {
        if (req.employee_threshold && employeeCount < req.employee_threshold) {
          return false;
        }
        return true;
      });
      
      requirements = [...requirements, ...stateReqs];
    }
    
    // Add industry-specific requirements
    if (industry && this.industryRequirements[industry]) {
      const industryReqs = this.industryRequirements[industry].filter(req => {
        if (req.employee_threshold && employeeCount < req.employee_threshold) {
          return false;
        }
        return true;
      });
      
      requirements = [...requirements, ...industryReqs];
    }
    
    // Format the response based on includeDetails
    const formattedRequirements = requirements.map(req => {
      if (includeDetails) {
        return {
          id: req.id,
          name: req.name,
          description: req.description,
          deadline_type: req.deadline_type,
          deadline_details: req.deadline_details,
          next_deadline: this.calculateNextDeadline(req),
          reference_url: req.reference_url,
          penalties: req.penalties
        };
      } else {
        return {
          id: req.id,
          name: req.name,
          next_deadline: this.calculateNextDeadline(req)
        };
      }
    });
    
    return {
      requirements: formattedRequirements,
      total: formattedRequirements.length
    };
  }

  private async checkComplianceStatus(params: any): Promise<any> {
    const { requirementIds } = params;
    
    // In a real implementation, we would check a database for compliance status
    // For now, we'll return mock data
    
    const results: any = {};
    
    for (const id of requirementIds) {
      // Find the requirement
      const req = this.federalRequirements.find(r => r.id === id) ||
                 Object.values(this.stateRequirements).flat().find(r => r.id === id) ||
                 Object.values(this.industryRequirements).flat().find(r => r.id === id);
      
      if (!req) {
        results[id] = { status: 'unknown', error: 'Requirement not found' };
        continue;
      }
      
      // Generate a random status for demo purposes
      const statusOptions = ['compliant', 'pending', 'late', 'exempt'];
      const statusIndex = Math.floor(Math.random() * statusOptions.length);
      const status = statusOptions[statusIndex];
      
      results[id] = {
        status,
        requirement_name: req.name,
        last_filed: status === 'compliant' ? '2024-01-15' : null,
        next_deadline: this.calculateNextDeadline(req),
        notes: status === 'exempt' ? 'Company qualifies for exemption' : ''
      };
    }
    
    return { results };
  }

  private async getUpcomingDeadlines(params: any): Promise<any> {
    const { state, daysAhead = 30, category } = params || {};
    
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + daysAhead);
    
    // Get all applicable requirements
    let requirements: ComplianceRequirement[] = [];
    
    // Add federal requirements
    requirements = [...requirements, ...this.federalRequirements];
    
    // Add state-specific requirements if requested
    if (state && this.stateRequirements[state]) {
      requirements = [...requirements, ...this.stateRequirements[state]];
    } else {
      // If no state specified, add all state requirements
      Object.values(this.stateRequirements).forEach(stateReqs => {
        requirements = [...requirements, ...stateReqs];
      });
    }
    
    // Add industry-specific requirements
    Object.values(this.industryRequirements).forEach(industryReqs => {
      requirements = [...requirements, ...industryReqs];
    });
    
    // Get upcoming deadlines
    const deadlines = requirements
      .map(req => {
        const nextDeadline = this.calculateNextDeadline(req);
        if (nextDeadline) {
          return {
            requirement_id: req.id,
            requirement_name: req.name,
            deadline_date: nextDeadline,
            category: this.categorizeRequirement(req.id)
          };
        }
        return null;
      })
      .filter(deadline => {
        if (!deadline || !deadline.deadline_date) return false;
        
        // Check if deadline is within the requested time frame
        const deadlineDate = new Date(deadline.deadline_date);
        const isWithinRange = deadlineDate >= now && deadlineDate <= endDate;
        
        // Check category if specified
        const matchesCategory = !category || deadline.category === category;
        
        return isWithinRange && matchesCategory;
      });
    
    // Sort by date (nearest first)
    deadlines.sort((a, b) => {
      if (!a.deadline_date || !b.deadline_date) return 0;
      return new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
    });
    
    return { deadlines };
  }

  private calculateNextDeadline(requirement: ComplianceRequirement): string | null {
    const now = new Date();
    
    try {
      switch (requirement.deadline_type) {
        case 'fixed': {
          const details = requirement.deadline_details;
          let deadlineDate = new Date(now.getFullYear(), details.month - 1, details.day);
          
          // If the deadline has passed for this year, use next year
          if (deadlineDate < now) {
            deadlineDate.setFullYear(now.getFullYear() + 1);
          }
          
          return deadlineDate.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        
        case 'recurring': {
          const details = requirement.deadline_details;
          
          if (details.frequency === 'quarterly') {
            // Find the next quarterly deadline
            const upcomingDeadlines = details.months.map(month => {
              return new Date(now.getFullYear(), month - 1, details.day);
            });
            
            // Add next year's first deadline
            if (details.months.includes(1)) {
              upcomingDeadlines.push(new Date(now.getFullYear() + 1, 0, details.day));
            }
            
            // Find the next deadline that hasn't passed
            const nextDeadline = upcomingDeadlines.find(date => date > now);
            
            return nextDeadline ? nextDeadline.toISOString().split('T')[0] : null;
          }
          
          return null; // Other frequencies not implemented yet
        }
        
        case 'relative': {
          // Relative deadlines are more complex and would depend on company-specific data
          // This would be implemented in a real application
          return null;
        }
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error calculating deadline:', error);
      return null;
    }
  }

  private categorizeRequirement(requirementId: string): string {
    // Categorize requirements for filtering purposes
    if (requirementId.includes('941') || requirementId.includes('940') || requirementId.includes('w2')) {
      return 'tax';
    } else if (requirementId.includes('aca') || requirementId.includes('hipaa')) {
      return 'benefits';
    } else if (requirementId.includes('eeo') || requirementId.includes('pay-data')) {
      return 'reporting';
    } else if (requirementId.includes('osha')) {
      return 'safety';
    }
    
    return 'general';
  }
}