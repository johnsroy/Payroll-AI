import { BaseAgent, AgentConfig } from './baseAgent';
import { supabase } from '../supabase';

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
    // Define comprehensive system prompt for compliance assistance
    const complianceSystemPrompt = `You are an expert payroll compliance assistant.
Your primary responsibilities include:
1. Monitoring and alerting users about upcoming filing deadlines
2. Explaining tax and labor law compliance requirements
3. Identifying potential compliance issues based on company operations
4. Recommending actions to maintain compliance with regulations

Always provide accurate, up-to-date information about:
- Payroll tax filing deadlines (federal, state, and local)
- Labor law requirements (minimum wage, overtime, paid leave, etc.)
- Required forms and documentation
- Notice and posting requirements

When addressing compliance questions:
- Cite specific laws, regulations, or government resources when applicable
- Clarify which requirements apply based on company size, location, and industry
- Emphasize deadlines and potential penalties for non-compliance
- Acknowledge when certain situations require consultation with legal counsel

Be thorough but practical in your recommendations, focusing on helping the user maintain compliance efficiently.`;

    // Define tools for the compliance agent
    const complianceTools = [
      {
        type: 'function',
        function: {
          name: 'get_compliance_requirements',
          description: 'Get applicable compliance requirements based on company profile',
          parameters: {
            type: 'object',
            properties: {
              state: {
                type: 'string',
                description: 'State code (e.g., CA, NY, TX)'
              },
              employee_count: {
                type: 'number',
                description: 'Number of employees'
              },
              industry: {
                type: 'string',
                description: 'Industry type'
              },
              include_deadlines: {
                type: 'boolean',
                description: 'Whether to include upcoming deadlines'
              }
            },
            required: ['state']
          }
        },
        handler: this.getComplianceRequirements.bind(this)
      },
      {
        type: 'function',
        function: {
          name: 'check_compliance_status',
          description: 'Check compliance status for a specific requirement',
          parameters: {
            type: 'object',
            properties: {
              requirement_id: {
                type: 'string',
                description: 'ID of the requirement to check'
              }
            },
            required: ['requirement_id']
          }
        },
        handler: this.checkComplianceStatus.bind(this)
      },
      {
        type: 'function',
        function: {
          name: 'get_upcoming_deadlines',
          description: 'Get upcoming filing and compliance deadlines',
          parameters: {
            type: 'object',
            properties: {
              days_ahead: {
                type: 'number',
                description: 'Number of days ahead to check for deadlines'
              },
              state: {
                type: 'string',
                description: 'State code to filter deadlines'
              }
            }
          }
        },
        handler: this.getUpcomingDeadlines.bind(this)
      }
    ];

    // Initialize the agent with compliance-specific configuration
    super({
      ...config,
      systemPrompt: complianceSystemPrompt,
      tools: complianceTools,
      temperature: 0.1 // Low temperature for more deterministic responses on compliance matters
    });

    // Load compliance data
    this.loadComplianceData();
    this.loadCompanyProfile(config.companyId);
  }

  // Load compliance data from the database
  private async loadComplianceData(): Promise<void> {
    try {
      // Try to load federal requirements from database
      const { data: federalData, error: federalError } = await supabase
        .from('knowledge_base')
        .select('content')
        .eq('category', 'compliance_federal')
        .single();

      if (!federalError && federalData) {
        this.federalRequirements = JSON.parse(federalData.content);
      } else {
        this.initializeDefaultFederalRequirements();
      }

      // Try to load state requirements from database
      const { data: stateData, error: stateError } = await supabase
        .from('knowledge_base')
        .select('content')
        .eq('category', 'compliance_state')
        .single();

      if (!stateError && stateData) {
        this.stateRequirements = JSON.parse(stateData.content);
      } else {
        this.initializeDefaultStateRequirements();
      }

      // Try to load industry requirements from database
      const { data: industryData, error: industryError } = await supabase
        .from('knowledge_base')
        .select('content')
        .eq('category', 'compliance_industry')
        .single();

      if (!industryError && industryData) {
        this.industryRequirements = JSON.parse(industryData.content);
      } else {
        this.initializeDefaultIndustryRequirements();
      }
    } catch (error) {
      console.error('Error loading compliance data:', error);
      this.initializeDefaultFederalRequirements();
      this.initializeDefaultStateRequirements();
      this.initializeDefaultIndustryRequirements();
    }
  }

  // Load company profile if company ID is provided
  private async loadCompanyProfile(companyId?: string): Promise<void> {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*, employees(count)')
        .eq('id', companyId)
        .single();

      if (error) throw error;

      this.companyProfile = data;
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  }

  // Initialize with default federal requirements
  private initializeDefaultFederalRequirements(): void {
    this.federalRequirements = [
      {
        id: 'form_941',
        name: 'Form 941 - Employer\'s Quarterly Federal Tax Return',
        description: 'Employers must file Form 941 to report income taxes, Social Security tax, and Medicare tax withheld from employee paychecks.',
        applies_to: ['all_employers'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'quarterly',
          months: [4, 7, 10, 1],
          day: 31
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-941',
        penalties: 'Penalties range from 2% to 15% of unpaid tax depending on how late the filing occurs.'
      },
      {
        id: 'form_940',
        name: 'Form 940 - Employer\'s Annual Federal Unemployment Tax Return',
        description: 'Employers must file Form 940 to report annual Federal Unemployment Tax Act (FUTA) tax.',
        applies_to: ['all_employers'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'annual',
          month: 1,
          day: 31
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-940',
        penalties: 'Penalties for late filing start at 5% of the unpaid tax for each month or part of a month the return is late.'
      },
      {
        id: 'form_w2',
        name: 'Form W-2 - Wage and Tax Statement',
        description: 'Employers must provide W-2 forms to employees and file with the Social Security Administration.',
        applies_to: ['all_employers'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'annual',
          month: 1,
          day: 31
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-w-2',
        penalties: 'Penalties range from $50 to $560 per form, depending on how late the filing occurs.'
      },
      {
        id: 'form_1099',
        name: 'Form 1099-NEC - Nonemployee Compensation',
        description: 'Businesses must report payments of $600 or more to nonemployees and independent contractors.',
        applies_to: ['all_businesses'],
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'annual',
          month: 1,
          day: 31
        },
        reference_url: 'https://www.irs.gov/forms-pubs/about-form-1099-nec',
        penalties: 'Penalties range from $50 to $560 per form, depending on how late the filing occurs.'
      },
      {
        id: 'form_i9',
        name: 'Form I-9 - Employment Eligibility Verification',
        description: 'Employers must verify the identity and employment authorization of each person hired.',
        applies_to: ['all_employers'],
        regions: ['US'],
        deadline_type: 'relative',
        deadline_details: {
          event: 'new_hire',
          days: 3
        },
        reference_url: 'https://www.uscis.gov/i-9',
        penalties: 'Penalties for violations range from $234 to $2,332 per employee for first-time offenders.'
      },
      {
        id: 'eeoc_reporting',
        name: 'EEO-1 Component 1 Report',
        description: 'Certain employers must report employment data categorized by race/ethnicity, gender, and job category.',
        applies_to: ['large_employers', 'federal_contractors'],
        employee_threshold: 100,
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'annual',
          month: 5,
          day: 31
        },
        reference_url: 'https://www.eeoc.gov/employers/eeo-1-data-collection',
        penalties: 'Employers may be subject to court enforcement by the EEOC for non-compliance.'
      },
      {
        id: 'fmla',
        name: 'Family and Medical Leave Act Compliance',
        description: 'Covered employers must provide eligible employees with job-protected, unpaid leave for qualified medical and family reasons.',
        applies_to: ['covered_employers'],
        employee_threshold: 50,
        regions: ['US'],
        deadline_type: 'relative',
        deadline_details: {
          event: 'request',
          days: 5
        },
        reference_url: 'https://www.dol.gov/agencies/whd/fmla',
        penalties: 'Violations may result in payment of back wages, employment benefits, and other compensatory damages.'
      },
      {
        id: 'aca_reporting',
        name: 'Affordable Care Act Reporting (Forms 1094-C and 1095-C)',
        description: 'Applicable Large Employers must report health coverage offered to full-time employees.',
        applies_to: ['large_employers'],
        employee_threshold: 50,
        regions: ['US'],
        deadline_type: 'recurring',
        deadline_details: {
          frequency: 'annual',
          month: 1,
          day: 31
        },
        reference_url: 'https://www.irs.gov/affordable-care-act/employers/information-reporting-by-applicable-large-employers',
        penalties: 'Penalties range from $50 to $560 per form, depending on how late the filing occurs.'
      }
    ];
  }

  // Initialize with default state requirements
  private initializeDefaultStateRequirements(): void {
    this.stateRequirements = {
      'CA': [
        {
          id: 'ca_de9',
          name: 'DE 9 - Quarterly Contribution Return and Report of Wages',
          description: 'California employers must file this form quarterly to report wages and pay unemployment insurance taxes.',
          applies_to: ['all_employers'],
          regions: ['CA'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'quarterly',
            months: [4, 7, 10, 1],
            day: 31
          },
          reference_url: 'https://edd.ca.gov/en/Payroll_Taxes/Forms_and_Publications',
          penalties: 'Late filing penalties of 10% of the amount of contributions due plus interest.'
        },
        {
          id: 'ca_paid_sick_leave',
          name: 'California Paid Sick Leave',
          description: 'Employers must provide paid sick leave to employees who work at least 30 days in a year.',
          applies_to: ['all_employers'],
          regions: ['CA'],
          deadline_type: 'relative',
          deadline_details: {
            event: 'accrual',
            ongoing: true
          },
          reference_url: 'https://www.dir.ca.gov/dlse/paid_sick_leave.htm',
          penalties: 'Penalties include back pay, administrative penalties, and possible litigation.'
        }
      ],
      'NY': [
        {
          id: 'ny_nys45',
          name: 'NYS-45 - Quarterly Combined Withholding, Wage Reporting, and Unemployment Insurance Return',
          description: 'New York employers must file this form quarterly to report withholding, wage, and unemployment insurance information.',
          applies_to: ['all_employers'],
          regions: ['NY'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'quarterly',
            months: [4, 7, 10, 1],
            day: 31
          },
          reference_url: 'https://www.tax.ny.gov/bus/ads/efile_addfaqs_nys45.htm',
          penalties: 'Late filing penalties of up to $10,000.'
        },
        {
          id: 'ny_paid_family_leave',
          name: 'New York Paid Family Leave',
          description: 'Covered employers must provide paid family leave benefits to eligible employees.',
          applies_to: ['all_employers'],
          regions: ['NY'],
          deadline_type: 'relative',
          deadline_details: {
            event: 'request',
            days: 30
          },
          reference_url: 'https://paidfamilyleave.ny.gov/employers',
          penalties: 'Penalties for non-compliance include fines of up to 0.5% of weekly payroll.'
        }
      ],
      'TX': [
        {
          id: 'tx_c3',
          name: 'Form C-3 - Employer\'s Quarterly Report',
          description: 'Texas employers must file this form quarterly to report wages and pay unemployment tax.',
          applies_to: ['all_employers'],
          regions: ['TX'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'quarterly',
            months: [4, 7, 10, 1],
            day: 31
          },
          reference_url: 'https://www.twc.texas.gov/businesses/unemployment-tax-services',
          penalties: 'Late filing penalties of 10% of the amount due.'
        }
      ]
    };
  }

  // Initialize with default industry requirements
  private initializeDefaultIndustryRequirements(): void {
    this.industryRequirements = {
      'construction': [
        {
          id: 'osha_300',
          name: 'OSHA Form 300 - Log of Work-Related Injuries and Illnesses',
          description: 'Construction companies must maintain records of work-related injuries and illnesses.',
          applies_to: ['construction'],
          regions: ['US'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'annual',
            month: 2,
            day: 1
          },
          reference_url: 'https://www.osha.gov/recordkeeping/forms',
          penalties: 'Penalties for violations can range from $14,502 to $145,027 per violation.'
        }
      ],
      'healthcare': [
        {
          id: 'hipaa_compliance',
          name: 'HIPAA Compliance',
          description: 'Healthcare providers must comply with Health Insurance Portability and Accountability Act privacy and security rules.',
          applies_to: ['healthcare'],
          regions: ['US'],
          deadline_type: 'relative',
          deadline_details: {
            event: 'breach',
            days: 60
          },
          reference_url: 'https://www.hhs.gov/hipaa/index.html',
          penalties: 'Civil penalties range from $100 to $50,000 per violation with an annual maximum of $1.5 million.'
        }
      ],
      'restaurant': [
        {
          id: 'tip_credit_reporting',
          name: 'Tip Credit Reporting Requirements',
          description: 'Restaurant employers claiming tip credit must maintain specific records and provide information to tipped employees.',
          applies_to: ['restaurant'],
          regions: ['US'],
          deadline_type: 'recurring',
          deadline_details: {
            frequency: 'payroll',
            ongoing: true
          },
          reference_url: 'https://www.dol.gov/agencies/whd/fact-sheets/15-flsa-tipped-employees',
          penalties: 'Violations may result in payment of back wages and liquidated damages.'
        }
      ]
    };
  }

  // Handler for get_compliance_requirements tool
  private async getComplianceRequirements(params: any): Promise<any> {
    const {
      state,
      employee_count = this.companyProfile?.employees?.count || 1,
      industry = this.companyProfile?.industry || '',
      include_deadlines = true
    } = params;
    
    // Collect applicable federal requirements
    let applicableRequirements = this.federalRequirements.filter(req => {
      // Check employee threshold if specified
      if (req.employee_threshold && employee_count < req.employee_threshold) {
        return false;
      }
      
      return true;
    });
    
    // Add state requirements if applicable
    if (state && this.stateRequirements[state]) {
      applicableRequirements = [
        ...applicableRequirements,
        ...this.stateRequirements[state].filter(req => {
          // Check employee threshold if specified
          if (req.employee_threshold && employee_count < req.employee_threshold) {
            return false;
          }
          
          return true;
        })
      ];
    }
    
    // Add industry requirements if applicable
    if (industry && this.industryRequirements[industry.toLowerCase()]) {
      applicableRequirements = [
        ...applicableRequirements,
        ...this.industryRequirements[industry.toLowerCase()].filter(req => {
          // Check employee threshold if specified
          if (req.employee_threshold && employee_count < req.employee_threshold) {
            return false;
          }
          
          return true;
        })
      ];
    }
    
    // Add deadline information if requested
    if (include_deadlines) {
      applicableRequirements = applicableRequirements.map(req => {
        const nextDeadline = this.calculateNextDeadline(req);
        
        return {
          ...req,
          next_deadline: nextDeadline
        };
      });
      
      // Sort by upcoming deadlines
      applicableRequirements.sort((a, b) => {
        if (!a.next_deadline) return 1;
        if (!b.next_deadline) return -1;
        
        return new Date(a.next_deadline).getTime() - new Date(b.next_deadline).getTime();
      });
    }
    
    return {
      requirements: applicableRequirements,
      count: applicableRequirements.length,
      profile: {
        state,
        employee_count,
        industry
      }
    };
  }

  // Handler for check_compliance_status tool
  private async checkComplianceStatus(params: any): Promise<any> {
    const { requirement_id } = params;
    
    if (!this.companyProfile) {
      return {
        error: 'Company profile is required to check compliance status',
        status: 'unknown'
      };
    }
    
    // Find the requirement
    const allRequirements = [
      ...this.federalRequirements,
      ...Object.values(this.stateRequirements).flat(),
      ...Object.values(this.industryRequirements).flat()
    ];
    
    const requirement = allRequirements.find(req => req.id === requirement_id);
    
    if (!requirement) {
      return {
        error: 'Requirement not found',
        status: 'unknown'
      };
    }
    
    // In a real implementation, we would check the company's compliance records
    // Here, we're simulating based on the current date
    
    try {
      // Query compliance records from the database
      const { data, error } = await supabase
        .from('compliance_records')
        .select('*')
        .eq('company_id', this.companyProfile.id)
        .eq('requirement_id', requirement_id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      const nextDeadline = this.calculateNextDeadline(requirement);
      
      if (!data || data.length === 0) {
        return {
          requirement,
          status: 'not_compliant',
          next_deadline: nextDeadline,
          last_filing: null
        };
      }
      
      const lastRecord = data[0];
      const lastFilingDate = new Date(lastRecord.filing_date);
      const now = new Date();
      
      // Simple compliance check based on last filing date
      if (requirement.deadline_type === 'recurring') {
        const deadlineDetails = requirement.deadline_details;
        
        if (deadlineDetails.frequency === 'annual') {
          // Check if filed this year
          if (lastFilingDate.getFullYear() === now.getFullYear()) {
            return {
              requirement,
              status: 'compliant',
              next_deadline: nextDeadline,
              last_filing: lastFilingDate.toISOString()
            };
          }
        } else if (deadlineDetails.frequency === 'quarterly') {
          // Check if filed this quarter
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const lastFilingQuarter = Math.floor(lastFilingDate.getMonth() / 3);
          
          if (lastFilingDate.getFullYear() === now.getFullYear() && 
              lastFilingQuarter === currentQuarter) {
            return {
              requirement,
              status: 'compliant',
              next_deadline: nextDeadline,
              last_filing: lastFilingDate.toISOString()
            };
          }
        }
      }
      
      return {
        requirement,
        status: 'needs_attention',
        next_deadline: nextDeadline,
        last_filing: lastFilingDate.toISOString()
      };
    } catch (error) {
      console.error('Error checking compliance status:', error);
      
      return {
        requirement,
        status: 'unknown',
        error: 'Failed to check compliance status',
        next_deadline: this.calculateNextDeadline(requirement)
      };
    }
  }

  // Handler for get_upcoming_deadlines tool
  private async getUpcomingDeadlines(params: any): Promise<any> {
    const {
      days_ahead = 30,
      state = this.companyProfile?.state
    } = params;
    
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() + days_ahead);
    
    // Collect all requirements
    let allRequirements = [...this.federalRequirements];
    
    // Add state requirements if applicable
    if (state && this.stateRequirements[state]) {
      allRequirements = [...allRequirements, ...this.stateRequirements[state]];
    }
    
    // Add industry requirements if applicable
    if (this.companyProfile?.industry && this.industryRequirements[this.companyProfile.industry.toLowerCase()]) {
      allRequirements = [
        ...allRequirements,
        ...this.industryRequirements[this.companyProfile.industry.toLowerCase()]
      ];
    }
    
    // Calculate next deadline for each requirement
    const upcomingDeadlines = allRequirements
      .map(req => {
        const nextDeadline = this.calculateNextDeadline(req);
        
        if (!nextDeadline) return null;
        
        const deadlineDate = new Date(nextDeadline);
        
        // Only include deadlines within the cutoff period
        if (deadlineDate > cutoffDate) return null;
        
        return {
          requirement: req,
          deadline_date: nextDeadline,
          days_until_deadline: Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        };
      })
      .filter(deadline => deadline !== null);
    
    // Sort by closest deadline
    upcomingDeadlines.sort((a: any, b: any) => a.days_until_deadline - b.days_until_deadline);
    
    return {
      deadlines: upcomingDeadlines,
      count: upcomingDeadlines.length,
      cutoff_date: cutoffDate.toISOString()
    };
  }

  // Helper to calculate the next deadline for a requirement
  private calculateNextDeadline(requirement: ComplianceRequirement): string | null {
    const now = new Date();
    
    switch (requirement.deadline_type) {
      case 'fixed':
        // One-time fixed deadline
        const fixedDate = new Date(requirement.deadline_details.date);
        return fixedDate < now ? null : requirement.deadline_details.date;
      
      case 'recurring':
        const details = requirement.deadline_details;
        
        if (details.frequency === 'annual') {
          // Annual deadline (e.g., January 31 each year)
          const nextDeadline = new Date(now.getFullYear(), details.month - 1, details.day);
          
          // If the deadline has passed this year, calculate for next year
          if (nextDeadline < now) {
            nextDeadline.setFullYear(now.getFullYear() + 1);
          }
          
          return nextDeadline.toISOString();
        } else if (details.frequency === 'quarterly') {
          // Quarterly deadlines
          const currentMonth = now.getMonth() + 1;
          let nextDeadlineMonth = null;
          
          // Find the next deadline month
          for (const month of details.months) {
            if (month > currentMonth) {
              nextDeadlineMonth = month;
              break;
            }
          }
          
          // If no future month found this year, use the first month of next year
          if (nextDeadlineMonth === null) {
            nextDeadlineMonth = details.months[0];
            const nextDeadline = new Date(now.getFullYear() + 1, nextDeadlineMonth - 1, details.day);
            return nextDeadline.toISOString();
          } else {
            const nextDeadline = new Date(now.getFullYear(), nextDeadlineMonth - 1, details.day);
            return nextDeadline.toISOString();
          }
        }
        
        return null;
      
      case 'relative':
        // For relative deadlines, we can't calculate without context
        // about when the triggering event occurred
        return null;
      
      default:
        return null;
    }
  }
}
