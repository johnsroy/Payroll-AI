import { BaseAgent, AgentResponse, Message } from './baseAgent';
import { anthropic } from './anthropic';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Data source definition
 */
interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: string[];
  sampleData?: any[];
  dataType: 'payroll' | 'employee' | 'financial' | 'timesheet' | 'expense' | 'other';
  company_id?: string;
}

/**
 * Analysis result
 */
interface AnalysisResult {
  id: string;
  query: string;
  dataSourceIds: string[];
  result: any;
  timestamp: Date;
  confidence: number;
  user_id?: string;
  company_id?: string;
}

/**
 * Data Analysis Agent specializes in analyzing payroll and financial data
 */
export class DataAnalysisAgent extends BaseAgent {
  private dataSources: Map<string, DataSource> = new Map();
  private analysisResults: Map<string, AnalysisResult[]> = new Map();
  
  // Tool definitions
  private dataTools = [
    {
      name: "analyze_data",
      description: "Analyze data from specified data sources",
      parameters: {
        type: "object",
        properties: {
          data_source_ids: {
            type: "array",
            items: {
              type: "string"
            },
            description: "IDs of data sources to analyze"
          },
          analysis_type: {
            type: "string",
            enum: ["summary", "trends", "comparison", "anomaly", "projection"],
            description: "Type of analysis to perform"
          },
          time_period: {
            type: "string",
            description: "Time period for the analysis (e.g., 'last month', 'Q2 2023', 'year-to-date')"
          },
          filters: {
            type: "object",
            description: "Filters to apply to the data"
          }
        },
        required: ["data_source_ids", "analysis_type"]
      }
    },
    {
      name: "get_data_sources",
      description: "Get available data sources",
      parameters: {
        type: "object",
        properties: {
          data_types: {
            type: "array",
            items: {
              type: "string",
              enum: ["payroll", "employee", "financial", "timesheet", "expense", "other"]
            },
            description: "Types of data sources to retrieve"
          },
          include_sample_data: {
            type: "boolean",
            description: "Whether to include sample data in the response"
          }
        }
      }
    },
    {
      name: "generate_forecast",
      description: "Generate a financial or payroll forecast",
      parameters: {
        type: "object",
        properties: {
          data_source_ids: {
            type: "array",
            items: {
              type: "string"
            },
            description: "IDs of data sources to use for forecasting"
          },
          forecast_type: {
            type: "string",
            enum: ["payroll", "revenue", "expenses", "headcount"],
            description: "Type of forecast to generate"
          },
          periods: {
            type: "number",
            description: "Number of periods to forecast"
          },
          period_type: {
            type: "string",
            enum: ["day", "week", "month", "quarter", "year"],
            description: "Type of period for the forecast"
          }
        },
        required: ["data_source_ids", "forecast_type", "periods", "period_type"]
      }
    }
  ];
  
  constructor(config: any = {}) {
    // Define data tools before the super call
    const dataTools = [
      {
        name: "analyze_data",
        description: "Analyze data from specified data sources",
        parameters: {
          type: "object",
          properties: {
            data_source_ids: {
              type: "array",
              items: {
                type: "string"
              },
              description: "IDs of data sources to analyze"
            },
            analysis_type: {
              type: "string",
              enum: ["summary", "trends", "comparison", "anomaly", "projection"],
              description: "Type of analysis to perform"
            },
            time_period: {
              type: "string",
              description: "Time period for the analysis (e.g., 'last month', 'Q2 2023', 'year-to-date')"
            },
            filters: {
              type: "object",
              description: "Filters to apply to the data"
            }
          },
          required: ["data_source_ids", "analysis_type"]
        }
      },
      {
        name: "get_data_sources",
        description: "Get available data sources",
        parameters: {
          type: "object",
          properties: {
            data_types: {
              type: "array",
              items: {
                type: "string",
                enum: ["payroll", "employee", "financial", "timesheet", "expense", "other"]
              },
              description: "Types of data sources to retrieve"
            },
            include_sample_data: {
              type: "boolean",
              description: "Whether to include sample data in the response"
            }
          }
        }
      },
      {
        name: "generate_forecast",
        description: "Generate a financial or payroll forecast",
        parameters: {
          type: "object",
          properties: {
            data_source_ids: {
              type: "array",
              items: {
                type: "string"
              },
              description: "IDs of data sources to use for forecasting"
            },
            forecast_type: {
              type: "string",
              enum: ["payroll", "revenue", "expenses", "headcount"],
              description: "Type of forecast to generate"
            },
            periods: {
              type: "number",
              description: "Number of periods to forecast"
            },
            period_type: {
              type: "string",
              enum: ["day", "week", "month", "quarter", "year"],
              description: "Type of period for the forecast"
            }
          },
          required: ["data_source_ids", "forecast_type", "periods", "period_type"]
        }
      }
    ];
    
    super({
      name: config.name || "Data Analysis Agent",
      systemPrompt: config.systemPrompt || 
        `You are the Data Analysis Agent, specialized in analyzing payroll and financial data.
        
Your capabilities include:
1. Analyzing patterns and trends in payroll data
2. Identifying cost-saving opportunities
3. Generating financial forecasts and projections
4. Comparing data across different time periods
5. Detecting anomalies or irregularities in financial data

Always provide clear, data-driven insights. When presenting analysis results, include key metrics, notable patterns, and actionable recommendations when possible. Explain your analytical approach and any limitations of the analysis.

For financial forecasts, be clear about the assumptions made and the confidence level of the projections.`,
      model: config.model || 'claude-3-7-sonnet-20250219',
      temperature: config.temperature !== undefined ? config.temperature : 0.1,
      maxTokens: config.maxTokens || 2000,
      tools: config.tools || dataTools,
      memory: config.memory !== undefined ? config.memory : true,
      conversationId: config.conversationId,
      userId: config.userId,
      companyId: config.companyId
    });
    
    // Assign the tools to the class property after super call
    this.dataTools = dataTools;
    
    // Initialize mock data sources for demonstration
    this.initializeMockDataSources();
    
    // Load data sources and analysis results if available
    this.loadDataSources();
  }
  
  /**
   * Process a query using the data analysis agent
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
        context += `\nRelevant financial analysis information from our knowledge base:\n${knowledgeContext}\n`;
      }
      
      // Add context about available data sources
      context += `\nAvailable data sources:\n`;
      for (const source of this.dataSources.values()) {
        context += `- ${source.name}: ${source.description}\n`;
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
      // but we parse for data analysis requests
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
      console.error('Error processing query in Data Analysis Agent:', error);
      
      // Return a graceful error response
      return {
        response: "I'm sorry, I encountered an error while processing your data analysis question. Please try rephrasing your question or try again later.",
        confidence: 0.1,
        metadata: {
          error: error.message
        }
      };
    }
  }
  
  /**
   * Parse the response for data analysis requests and execute them
   */
  private async parseAndExecuteToolCalls(responseText: string, query: string): Promise<any[]> {
    const toolCallResults = [];
    
    // Check for data analysis patterns in the response or query
    const hasDataAnalysisRequest = 
      (responseText.includes('analyze') || query.includes('analyze')) &&
      (responseText.includes('data') || query.includes('data'));
    
    const hasDataSourceRequest =
      (responseText.includes('data sources') || query.includes('data sources')) ||
      (responseText.includes('available data') || query.includes('available data'));
    
    const hasForecastRequest =
      (responseText.includes('forecast') || query.includes('forecast')) ||
      (responseText.includes('projection') || query.includes('projection')) ||
      (responseText.includes('predict') || query.includes('predict'));
    
    // Execute appropriate tool calls
    if (hasDataAnalysisRequest) {
      // Extract data analysis parameters
      const dataSourceIds = this.extractDataSourceIds(responseText, query);
      
      const analysisType = 
        (responseText.includes('summarize') || query.includes('summarize')) ? 'summary' :
        (responseText.includes('trend') || query.includes('trend')) ? 'trends' :
        (responseText.includes('compare') || query.includes('compare')) ? 'comparison' :
        (responseText.includes('anomaly') || query.includes('anomaly')) ? 'anomaly' :
        (responseText.includes('project') || query.includes('project')) ? 'projection' :
        'summary'; // Default
      
      const timePeriod = this.extractTimePeriod(responseText, query) || 'current year';
      
      // Only attempt analysis if we have data source IDs
      if (dataSourceIds && dataSourceIds.length > 0) {
        const params = {
          data_source_ids: dataSourceIds,
          analysis_type: analysisType,
          time_period: timePeriod,
          filters: {}
        };
        
        const result = await this.analyzeData(params);
        toolCallResults.push({
          name: 'analyze_data',
          arguments: params,
          result
        });
      }
    }
    
    if (hasDataSourceRequest) {
      const dataTypes = this.extractDataTypes(responseText, query) || ['payroll', 'financial'];
      
      const includeSampleData = 
        (responseText.includes('sample data') || query.includes('sample data')) ||
        (responseText.includes('examples') || query.includes('examples'));
      
      const params = {
        data_types: dataTypes,
        include_sample_data: includeSampleData
      };
      
      const result = await this.getDataSources(params);
      toolCallResults.push({
        name: 'get_data_sources',
        arguments: params,
        result
      });
    }
    
    if (hasForecastRequest) {
      // Extract forecast parameters
      const dataSourceIds = this.extractDataSourceIds(responseText, query);
      
      const forecastType =
        (responseText.includes('payroll forecast') || query.includes('payroll forecast')) ? 'payroll' :
        (responseText.includes('revenue forecast') || query.includes('revenue forecast')) ? 'revenue' :
        (responseText.includes('expense forecast') || query.includes('expense forecast')) ? 'expenses' :
        (responseText.includes('headcount forecast') || query.includes('headcount forecast')) ? 'headcount' :
        'payroll'; // Default
      
      const periodTypeMatch = responseText.match(/forecast\s+(\d+)\s+(day|week|month|quarter|year)s/i) || 
                             query.match(/forecast\s+(\d+)\s+(day|week|month|quarter|year)s/i);
      
      const periods = periodTypeMatch ? parseInt(periodTypeMatch[1], 10) : 3;
      const periodType = periodTypeMatch ? periodTypeMatch[2].toLowerCase() : 'month';
      
      // Only attempt forecast if we have data source IDs
      if (dataSourceIds && dataSourceIds.length > 0) {
        const params = {
          data_source_ids: dataSourceIds,
          forecast_type: forecastType,
          periods,
          period_type: periodType
        };
        
        const result = await this.generateForecast(params);
        toolCallResults.push({
          name: 'generate_forecast',
          arguments: params,
          result
        });
      }
    }
    
    return toolCallResults;
  }
  
  /**
   * Extract data source IDs from text
   */
  private extractDataSourceIds(text1: string, text2: string): string[] {
    // Look for explicit mentions of data source IDs
    const explicitMentions = /data[_\s-]sources?[_\s-]ids?:?\s*\[([^\]]+)\]/i;
    const match1 = text1.match(explicitMentions);
    const match2 = text2.match(explicitMentions);
    
    if (match1 && match1[1]) {
      return match1[1].split(',').map(id => id.trim().replace(/['"]/g, ''));
    }
    
    if (match2 && match2[1]) {
      return match2[1].split(',').map(id => id.trim().replace(/['"]/g, ''));
    }
    
    // Look for mentions of data source names
    const dataSourceIds: string[] = [];
    for (const [id, source] of this.dataSources.entries()) {
      const sourceName = source.name.toLowerCase();
      if (text1.toLowerCase().includes(sourceName) || text2.toLowerCase().includes(sourceName)) {
        dataSourceIds.push(id);
      }
    }
    
    // If no specific sources mentioned, infer from context
    if (dataSourceIds.length === 0) {
      // If query mentions employees, add employee data
      if (text1.toLowerCase().includes('employee') || text2.toLowerCase().includes('employee')) {
        const employeeSource = Array.from(this.dataSources.entries())
          .find(([_, source]) => source.dataType === 'employee');
        if (employeeSource) {
          dataSourceIds.push(employeeSource[0]);
        }
      }
      
      // If query mentions payroll, add payroll data
      if (text1.toLowerCase().includes('payroll') || text2.toLowerCase().includes('payroll')) {
        const payrollSource = Array.from(this.dataSources.entries())
          .find(([_, source]) => source.dataType === 'payroll');
        if (payrollSource) {
          dataSourceIds.push(payrollSource[0]);
        }
      }
      
      // If query mentions finance or financial, add financial data
      if (text1.toLowerCase().includes('financ') || text2.toLowerCase().includes('financ')) {
        const financialSource = Array.from(this.dataSources.entries())
          .find(([_, source]) => source.dataType === 'financial');
        if (financialSource) {
          dataSourceIds.push(financialSource[0]);
        }
      }
    }
    
    return dataSourceIds;
  }
  
  /**
   * Extract data types from text
   */
  private extractDataTypes(text1: string, text2: string): string[] {
    const dataTypes: string[] = [];
    
    // Check for mentions of each data type
    if (text1.toLowerCase().includes('payroll') || text2.toLowerCase().includes('payroll')) {
      dataTypes.push('payroll');
    }
    
    if (text1.toLowerCase().includes('employee') || text2.toLowerCase().includes('employee')) {
      dataTypes.push('employee');
    }
    
    if (text1.toLowerCase().includes('financ') || text2.toLowerCase().includes('financ')) {
      dataTypes.push('financial');
    }
    
    if (text1.toLowerCase().includes('timesheet') || text2.toLowerCase().includes('timesheet') ||
        text1.toLowerCase().includes('time sheet') || text2.toLowerCase().includes('time sheet')) {
      dataTypes.push('timesheet');
    }
    
    if (text1.toLowerCase().includes('expense') || text2.toLowerCase().includes('expense')) {
      dataTypes.push('expense');
    }
    
    // If no specific types mentioned, return all types
    if (dataTypes.length === 0) {
      return ['payroll', 'employee', 'financial', 'timesheet', 'expense', 'other'];
    }
    
    return dataTypes;
  }
  
  /**
   * Extract time period from text
   */
  private extractTimePeriod(text1: string, text2: string): string | null {
    // Look for common time period patterns
    const periodPatterns = [
      /last\s+(month|quarter|year)/i,
      /this\s+(month|quarter|year)/i,
      /past\s+(\d+)\s+(day|week|month|year)s/i,
      /(Q[1-4])\s+(\d{4})/i,
      /year[\s-]to[\s-]date/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)(\s+\d{4})?/i,
      /(\d{4})/
    ];
    
    for (const pattern of periodPatterns) {
      const match1 = text1.match(pattern);
      if (match1) {
        return match1[0];
      }
      
      const match2 = text2.match(pattern);
      if (match2) {
        return match2[0];
      }
    }
    
    return null;
  }
  
  /**
   * Load data sources from database
   */
  private async loadDataSources(): Promise<void> {
    try {
      // Load data sources
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('data_sources')
        .select('*');
      
      if (sourcesError) {
        throw sourcesError;
      }
      
      if (sourcesData) {
        // Clear existing data sources
        this.dataSources.clear();
        
        // Add data sources from database
        for (const source of sourcesData as DataSource[]) {
          this.dataSources.set(source.id, source);
        }
      }
      
      // Load previous analysis results for this user
      if (this.userId) {
        const { data: resultsData, error: resultsError } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('user_id', this.userId);
        
        if (resultsError) {
          throw resultsError;
        }
        
        if (resultsData) {
          // Group results by data source ID
          for (const result of resultsData as AnalysisResult[]) {
            for (const sourceId of result.dataSourceIds) {
              if (!this.analysisResults.has(sourceId)) {
                this.analysisResults.set(sourceId, []);
              }
              this.analysisResults.get(sourceId)!.push(result);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading data sources:', error);
      // Fallback to mock data already initialized
    }
  }
  
  /**
   * Initialize mock data sources for demonstration
   */
  private initializeMockDataSources(): void {
    // Employee data source
    const employeeData: DataSource = {
      id: 'employee_data',
      name: 'Employee Data',
      description: 'Basic employee information including departments, positions, and compensation',
      dataType: 'employee',
      fields: [
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'hire_date',
        'manager_id',
        'status',
        'salary',
        'hourly_rate'
      ],
      sampleData: [
        {
          employee_id: 'E001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          department: 'Engineering',
          position: 'Senior Developer',
          hire_date: '2020-03-15',
          manager_id: 'E005',
          status: 'Active',
          salary: 95000,
          hourly_rate: null
        },
        {
          employee_id: 'E002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          department: 'Marketing',
          position: 'Marketing Manager',
          hire_date: '2019-07-10',
          manager_id: 'E007',
          status: 'Active',
          salary: 85000,
          hourly_rate: null
        }
      ]
    };
    
    // Payroll data source
    const payrollData: DataSource = {
      id: 'payroll_data',
      name: 'Payroll Data',
      description: 'Payroll transactions and records for all employees',
      dataType: 'payroll',
      fields: [
        'payroll_id',
        'employee_id',
        'pay_period_start',
        'pay_period_end',
        'pay_date',
        'gross_pay',
        'net_pay',
        'federal_tax',
        'state_tax',
        'fica_medicare',
        'fica_social_security',
        'retirement_contribution',
        'health_insurance',
        'other_deductions',
        'reimbursements',
        'hours_worked',
        'overtime_hours'
      ],
      sampleData: [
        {
          payroll_id: 'P00123',
          employee_id: 'E001',
          pay_period_start: '2023-05-01',
          pay_period_end: '2023-05-15',
          pay_date: '2023-05-20',
          gross_pay: 3958.33,
          net_pay: 2850.12,
          federal_tax: 692.71,
          state_tax: 197.92,
          fica_medicare: 57.40,
          fica_social_security: 245.42,
          retirement_contribution: 118.75,
          health_insurance: 150.00,
          other_deductions: 0.00,
          reimbursements: 0.00,
          hours_worked: 80,
          overtime_hours: 0
        }
      ]
    };
    
    // Timesheet data source
    const timeData: DataSource = {
      id: 'timesheet_data',
      name: 'Timesheet Data',
      description: 'Employee time tracking and attendance records',
      dataType: 'timesheet',
      fields: [
        'timesheet_id',
        'employee_id',
        'date',
        'time_in',
        'time_out',
        'break_duration',
        'total_hours',
        'overtime_hours',
        'approval_status',
        'approved_by',
        'approved_date',
        'notes'
      ],
      sampleData: [
        {
          timesheet_id: 'T00456',
          employee_id: 'E002',
          date: '2023-05-15',
          time_in: '09:00:00',
          time_out: '17:30:00',
          break_duration: 30,
          total_hours: 8,
          overtime_hours: 0,
          approval_status: 'Approved',
          approved_by: 'E007',
          approved_date: '2023-05-16',
          notes: ''
        }
      ]
    };
    
    // Financial data source
    const financialData: DataSource = {
      id: 'financial_data',
      name: 'Financial Data',
      description: 'Company financial metrics and reports',
      dataType: 'financial',
      fields: [
        'report_id',
        'report_date',
        'report_type',
        'period_start',
        'period_end',
        'total_revenue',
        'total_expenses',
        'payroll_expenses',
        'operating_expenses',
        'net_profit',
        'cash_balance',
        'accounts_receivable',
        'accounts_payable'
      ],
      sampleData: [
        {
          report_id: 'F00789',
          report_date: '2023-05-31',
          report_type: 'Monthly',
          period_start: '2023-05-01',
          period_end: '2023-05-31',
          total_revenue: 425000.00,
          total_expenses: 375000.00,
          payroll_expenses: 225000.00,
          operating_expenses: 150000.00,
          net_profit: 50000.00,
          cash_balance: 780000.00,
          accounts_receivable: 120000.00,
          accounts_payable: 85000.00
        }
      ]
    };
    
    // Expense data source
    const expenseData: DataSource = {
      id: 'expense_data',
      name: 'Expense Data',
      description: 'Business expense records and categorization',
      dataType: 'expense',
      fields: [
        'expense_id',
        'employee_id',
        'date',
        'amount',
        'category',
        'vendor',
        'description',
        'payment_method',
        'reimbursable',
        'reimbursed',
        'receipt_url',
        'approval_status',
        'approved_by',
        'approved_date'
      ],
      sampleData: [
        {
          expense_id: 'E00345',
          employee_id: 'E001',
          date: '2023-05-22',
          amount: 125.75,
          category: 'Travel',
          vendor: 'Delta Airlines',
          description: 'Flight to client meeting',
          payment_method: 'Corporate Card',
          reimbursable: true,
          reimbursed: true,
          receipt_url: 'https://example.com/receipts/E00345',
          approval_status: 'Approved',
          approved_by: 'E005',
          approved_date: '2023-05-23'
        }
      ]
    };
    
    // Add data sources to the map
    this.dataSources.set(employeeData.id, employeeData);
    this.dataSources.set(payrollData.id, payrollData);
    this.dataSources.set(timeData.id, timeData);
    this.dataSources.set(financialData.id, financialData);
    this.dataSources.set(expenseData.id, expenseData);
  }
  
  /**
   * Analyze data based on the specified parameters
   */
  private async analyzeData(params: any): Promise<any> {
    const { data_source_ids, analysis_type, time_period, filters } = params;
    
    // Ensure all requested data sources exist
    const availableSources = data_source_ids.filter(id => this.dataSources.has(id));
    
    if (availableSources.length === 0) {
      return {
        error: 'No valid data sources provided',
        available_sources: Array.from(this.dataSources.keys())
      };
    }
    
    // Get the data sources
    const sources = availableSources.map(id => this.dataSources.get(id));
    
    // In a real implementation, this would query the actual data
    // For this demo, we'll generate mock analysis results
    
    // Prepare the analysis result
    const result: any = {
      timestamp: new Date().toISOString(),
      analysis_type: analysis_type,
      time_period: time_period,
      data_sources: sources.map(s => ({ id: s!.id, name: s!.name })),
      results: {}
    };
    
    // Generate different results based on analysis type
    switch (analysis_type) {
      case 'summary':
        result.results = this.generateSummaryAnalysis(sources, time_period, filters);
        break;
      case 'trends':
        result.results = this.generateTrendsAnalysis(sources, time_period, filters);
        break;
      case 'comparison':
        result.results = this.generateComparisonAnalysis(sources, time_period, filters);
        break;
      case 'anomaly':
        result.results = this.generateAnomalyAnalysis(sources, time_period, filters);
        break;
      case 'projection':
        result.results = this.generateProjectionAnalysis(sources, time_period, filters);
        break;
      default:
        result.results = this.generateSummaryAnalysis(sources, time_period, filters);
    }
    
    // Save the analysis result if user ID is available
    if (this.userId) {
      const analysisResult: AnalysisResult = {
        id: uuidv4(),
        query: `Analyze ${analysis_type} for ${time_period}`,
        dataSourceIds: availableSources,
        result,
        timestamp: new Date(),
        confidence: 0.85,
        user_id: this.userId,
        company_id: this.companyId
      };
      
      try {
        await supabase
          .from('analysis_results')
          .insert(analysisResult);
        
        // Update local cache
        for (const sourceId of availableSources) {
          if (!this.analysisResults.has(sourceId)) {
            this.analysisResults.set(sourceId, []);
          }
          this.analysisResults.get(sourceId)!.push(analysisResult);
        }
      } catch (error) {
        console.error('Error saving analysis result:', error);
      }
    }
    
    return result;
  }
  
  /**
   * Generate a summary analysis of the data
   */
  private generateSummaryAnalysis(sources: (DataSource | undefined)[], timePeriod: string, filters: any): any {
    // For demonstration purposes, generate mock summary data
    const summary: any = {
      key_metrics: {},
      insights: [],
      data_quality: {
        completeness: Math.random() * 0.2 + 0.8, // 80-100%
        consistency: Math.random() * 0.3 + 0.7,  // 70-100%
        issues: []
      }
    };
    
    // Add metrics based on the data sources
    for (const source of sources) {
      if (!source) continue;
      
      switch (source.dataType) {
        case 'payroll':
          summary.key_metrics.total_payroll = this.randomMoney(200000, 500000);
          summary.key_metrics.average_salary = this.randomMoney(65000, 95000);
          summary.key_metrics.total_employees = Math.floor(Math.random() * 50) + 50;
          summary.key_metrics.payroll_tax_percentage = (Math.random() * 5 + 12).toFixed(2) + '%';
          summary.insights.push('Payroll expenses represent approximately 60% of total operating costs.');
          summary.insights.push('Engineering department has the highest average salary at $98,500.');
          
          if (Math.random() > 0.5) {
            summary.insights.push('Overtime expenses increased by 15% compared to the previous period.');
          }
          break;
          
        case 'employee':
          summary.key_metrics.total_employees = Math.floor(Math.random() * 50) + 50;
          summary.key_metrics.average_tenure = (Math.random() * 3 + 2).toFixed(1) + ' years';
          summary.key_metrics.turnover_rate = (Math.random() * 10 + 5).toFixed(1) + '%';
          summary.key_metrics.departments = ['Engineering', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR'];
          summary.insights.push('Engineering has the highest headcount at 35% of total employees.');
          summary.insights.push('Recent hiring is focused on the Sales department, growing 20% this year.');
          break;
          
        case 'financial':
          summary.key_metrics.total_revenue = this.randomMoney(800000, 1500000);
          summary.key_metrics.total_expenses = this.randomMoney(600000, 1200000);
          summary.key_metrics.net_profit = summary.key_metrics.total_revenue - summary.key_metrics.total_expenses;
          summary.key_metrics.profit_margin = ((summary.key_metrics.net_profit / summary.key_metrics.total_revenue) * 100).toFixed(1) + '%';
          summary.insights.push('Net profit margin is trending upward compared to the previous quarter.');
          summary.insights.push('Cash reserves are sufficient to cover approximately 6 months of operations.');
          break;
      }
    }
    
    // Add data quality issues if any
    if (summary.data_quality.completeness < 0.95) {
      summary.data_quality.issues.push('Some employee records are missing department information.');
    }
    
    if (summary.data_quality.consistency < 0.9) {
      summary.data_quality.issues.push('Inconsistencies detected in job title naming conventions.');
    }
    
    return summary;
  }
  
  /**
   * Generate a trends analysis of the data
   */
  private generateTrendsAnalysis(sources: (DataSource | undefined)[], timePeriod: string, filters: any): any {
    // For demonstration purposes, generate mock trends data
    const trends: any = {
      time_series: [],
      trend_patterns: [],
      seasonality: {},
      year_over_year: {}
    };
    
    // Generate time series data for the past 12 months
    const today = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(month.toISOString().slice(0, 7)); // YYYY-MM format
    }
    
    // Add trends based on the data sources
    for (const source of sources) {
      if (!source) continue;
      
      switch (source.dataType) {
        case 'payroll':
          // Generate monthly payroll expenses with slight upward trend and some seasonality
          trends.time_series.push({
            name: 'Monthly Payroll Expenses',
            data: months.map((month, index) => {
              // Base value with slight upward trend
              const base = 200000 + (index * 5000);
              // Add seasonality - Q4 bonus effect
              const seasonality = (month.endsWith('-11') || month.endsWith('-12')) ? 50000 : 0;
              // Add some randomness
              const random = (Math.random() * 20000) - 10000;
              return {
                month,
                value: Math.round(base + seasonality + random)
              };
            })
          });
          
          trends.trend_patterns.push({
            name: 'Payroll Growth',
            description: 'Steady increase in payroll expenses at approximately 2.5% per month',
            confidence: 0.85
          });
          
          trends.seasonality.payroll = {
            pattern: 'Yearly',
            peak_months: ['November', 'December'],
            description: 'Year-end bonuses and seasonal staff increases'
          };
          break;
          
        case 'financial':
          // Generate monthly revenue with upward trend and Q4 peak
          trends.time_series.push({
            name: 'Monthly Revenue',
            data: months.map((month, index) => {
              // Base value with upward trend
              const base = 300000 + (index * 10000);
              // Add seasonality - Q4 sales peak
              const seasonality = (month.endsWith('-11') || month.endsWith('-12')) ? 100000 : 0;
              // Add some randomness
              const random = (Math.random() * 30000) - 15000;
              return {
                month,
                value: Math.round(base + seasonality + random)
              };
            })
          });
          
          // Calculate year-over-year growth if available
          const currentYearData = 3650000;
          const previousYearData = 3100000;
          trends.year_over_year.revenue = {
            current_year: currentYearData,
            previous_year: previousYearData,
            growth_rate: ((currentYearData / previousYearData - 1) * 100).toFixed(1) + '%',
            analysis: 'Revenue growth is primarily driven by expansion in the enterprise segment.'
          };
          break;
          
        case 'employee':
          // Generate headcount trend
          trends.time_series.push({
            name: 'Employee Headcount',
            data: months.map((month, index) => {
              // Steady growth with some randomness
              const base = 50 + Math.floor(index * 1.5);
              const random = Math.floor(Math.random() * 3) - 1;
              return {
                month,
                value: base + random
              };
            })
          });
          
          trends.trend_patterns.push({
            name: 'Hiring Pattern',
            description: 'Consistent hiring with acceleration in recent months',
            confidence: 0.75
          });
          break;
      }
    }
    
    return trends;
  }
  
  /**
   * Generate a comparison analysis of the data
   */
  private generateComparisonAnalysis(sources: (DataSource | undefined)[], timePeriod: string, filters: any): any {
    // For demonstration purposes, generate mock comparison data
    const comparison: any = {
      period_comparison: {},
      department_comparison: [],
      benchmark_comparison: {}
    };
    
    // Add comparisons based on the data sources
    for (const source of sources) {
      if (!source) continue;
      
      switch (source.dataType) {
        case 'payroll':
          comparison.period_comparison.payroll = {
            current_period: this.randomMoney(250000, 350000),
            previous_period: this.randomMoney(230000, 330000),
            change_percentage: (Math.random() * 15 - 5).toFixed(1) + '%',
            change_description: 'Increase primarily due to annual salary adjustments and three new hires.'
          };
          
          comparison.department_comparison = [
            {
              department: 'Engineering',
              headcount: Math.floor(Math.random() * 10) + 20,
              total_payroll: this.randomMoney(150000, 200000),
              average_salary: this.randomMoney(90000, 110000),
              percent_of_total: (Math.random() * 10 + 35).toFixed(1) + '%'
            },
            {
              department: 'Marketing',
              headcount: Math.floor(Math.random() * 5) + 10,
              total_payroll: this.randomMoney(70000, 100000),
              average_salary: this.randomMoney(75000, 90000),
              percent_of_total: (Math.random() * 10 + 15).toFixed(1) + '%'
            },
            {
              department: 'Sales',
              headcount: Math.floor(Math.random() * 5) + 15,
              total_payroll: this.randomMoney(90000, 130000),
              average_salary: this.randomMoney(70000, 85000),
              percent_of_total: (Math.random() * 10 + 20).toFixed(1) + '%'
            }
          ];
          break;
          
        case 'financial':
          comparison.benchmark_comparison.financial = {
            metric: 'Operating Margin',
            company_value: (Math.random() * 10 + 15).toFixed(1) + '%',
            industry_average: (Math.random() * 5 + 12).toFixed(1) + '%',
            percentile: Math.floor(Math.random() * 30 + 70),
            analysis: 'Company performance exceeds industry average, positioning in the top quartile.'
          };
          break;
      }
    }
    
    return comparison;
  }
  
  /**
   * Generate an anomaly analysis of the data
   */
  private generateAnomalyAnalysis(sources: (DataSource | undefined)[], timePeriod: string, filters: any): any {
    // For demonstration purposes, generate mock anomaly data
    const anomalies: any = {
      detected_anomalies: [],
      statistical_outliers: [],
      potential_errors: [],
      recommendations: []
    };
    
    // Add anomalies based on the data sources
    for (const source of sources) {
      if (!source) continue;
      
      switch (source.dataType) {
        case 'payroll':
          if (Math.random() > 0.5) {
            anomalies.detected_anomalies.push({
              type: 'Unusual Overtime',
              description: 'Overtime hours in the Engineering department are 87% higher than historical average.',
              severity: 'Medium',
              timeframe: 'Last month',
              confidence: 0.83
            });
            
            anomalies.recommendations.push('Investigate Engineering department overtime patterns and workload distribution.');
          }
          
          if (Math.random() > 0.7) {
            anomalies.statistical_outliers.push({
              type: 'Salary Outlier',
              description: 'Three employees in the Marketing department have salaries significantly below market range.',
              severity: 'Low',
              confidence: 0.76
            });
            
            anomalies.recommendations.push('Review Marketing department compensation structure against market benchmarks.');
          }
          break;
          
        case 'expense':
          if (Math.random() > 0.4) {
            anomalies.detected_anomalies.push({
              type: 'Unusual Expense Pattern',
              description: 'Travel expenses increased by 215% in the last month with no corresponding increase in business travel.',
              severity: 'High',
              timeframe: 'Last month',
              confidence: 0.91
            });
            
            anomalies.recommendations.push('Audit recent travel expense submissions and verify business justification.');
          }
          
          if (Math.random() > 0.6) {
            anomalies.potential_errors.push({
              type: 'Duplicate Reimbursement',
              description: 'Potential duplicate reimbursement detected for employee E007 for conference registration.',
              severity: 'Medium',
              confidence: 0.85
            });
            
            anomalies.recommendations.push('Review expense submission process to prevent duplicate reimbursements.');
          }
          break;
          
        case 'timesheet':
          if (Math.random() > 0.5) {
            anomalies.detected_anomalies.push({
              type: 'Unusual Work Hours',
              description: 'Multiple employees consistently logging more than 10 hours daily without overtime approval.',
              severity: 'Medium',
              timeframe: 'Past two weeks',
              confidence: 0.79
            });
            
            anomalies.recommendations.push('Update timesheet approval process to require justification for extended hours.');
          }
          break;
      }
    }
    
    // If no anomalies were detected, add a general message
    if (anomalies.detected_anomalies.length === 0 && 
        anomalies.statistical_outliers.length === 0 && 
        anomalies.potential_errors.length === 0) {
      anomalies.summary = 'No significant anomalies detected in the analyzed data for the specified time period.';
      anomalies.recommendations.push('Continue regular monitoring of key metrics.');
    }
    
    return anomalies;
  }
  
  /**
   * Generate a projection analysis of the data
   */
  private generateProjectionAnalysis(sources: (DataSource | undefined)[], timePeriod: string, filters: any): any {
    // For demonstration purposes, generate mock projection data
    const projection: any = {
      forecast_period: timePeriod,
      projections: {},
      assumptions: [],
      confidence_levels: {},
      risk_factors: []
    };
    
    // Add projections based on the data sources
    for (const source of sources) {
      if (!source) continue;
      
      switch (source.dataType) {
        case 'payroll':
          projection.projections.payroll = {
            current: this.randomMoney(250000, 350000),
            projected: [
              { period: '+1 month', value: this.randomMoney(255000, 360000) },
              { period: '+2 months', value: this.randomMoney(260000, 370000) },
              { period: '+3 months', value: this.randomMoney(265000, 380000) }
            ],
            growth_rate: (Math.random() * 3 + 1.5).toFixed(1) + '%',
            contributing_factors: [
              'Planned salary adjustments in Engineering department',
              'Three new hires scheduled for next month',
              'Seasonal contractor support ending in two months'
            ]
          };
          
          projection.assumptions.push('Current headcount levels will be maintained with planned new hires.');
          projection.assumptions.push('No significant changes to benefit costs in the forecast period.');
          
          projection.confidence_levels.payroll = {
            best_case: { value: this.randomMoney(240000, 320000), probability: 0.20 },
            expected: { value: this.randomMoney(260000, 350000), probability: 0.60 },
            worst_case: { value: this.randomMoney(280000, 380000), probability: 0.20 }
          };
          
          projection.risk_factors.push('Potential increase in healthcare premium costs mid-year.');
          break;
          
        case 'financial':
          projection.projections.revenue = {
            current: this.randomMoney(450000, 550000),
            projected: [
              { period: 'Q3 2023', value: this.randomMoney(470000, 570000) },
              { period: 'Q4 2023', value: this.randomMoney(520000, 620000) },
              { period: 'Q1 2024', value: this.randomMoney(480000, 580000) }
            ],
            growth_rate: (Math.random() * 5 + 3).toFixed(1) + '%',
            contributing_factors: [
              'New product launch in Q3 2023',
              'Seasonal peak in Q4 2023',
              'Slight expected contraction in Q1 2024'
            ]
          };
          
          projection.assumptions.push('Market conditions remain stable throughout the forecast period.');
          projection.assumptions.push('New product launch proceeds according to schedule.');
          
          projection.confidence_levels.revenue = {
            best_case: { value: this.randomMoney(550000, 650000), probability: 0.25 },
            expected: { value: this.randomMoney(500000, 600000), probability: 0.50 },
            worst_case: { value: this.randomMoney(450000, 550000), probability: 0.25 }
          };
          
          projection.risk_factors.push('Increased competitive pressure in core markets.');
          projection.risk_factors.push('Potential supply chain disruptions affecting product availability.');
          break;
          
        case 'employee':
          projection.projections.headcount = {
            current: Math.floor(Math.random() * 20) + 60,
            projected: [
              { period: '+1 month', value: Math.floor(Math.random() * 23) + 62 },
              { period: '+2 months', value: Math.floor(Math.random() * 25) + 64 },
              { period: '+3 months', value: Math.floor(Math.random() * 28) + 66 }
            ],
            growth_rate: (Math.random() * 4 + 2).toFixed(1) + '%',
            contributing_factors: [
              'Planned expansion of Sales team',
              'Addition of two new Engineering roles',
              'One expected departure in Customer Support'
            ]
          };
          
          projection.assumptions.push('Current hiring pipeline will convert at historical rates.');
          projection.assumptions.push('Employee attrition remains at current levels.');
          
          projection.risk_factors.push('Competitive hiring environment for technical roles.');
          break;
      }
    }
    
    return projection;
  }
  
  /**
   * Get available data sources
   */
  private async getDataSources(params: any): Promise<any> {
    const { data_types = [], include_sample_data = false } = params;
    
    // Filter data sources by type if specified
    let filteredSources = Array.from(this.dataSources.values());
    
    if (data_types.length > 0) {
      filteredSources = filteredSources.filter(source => 
        data_types.includes(source.dataType)
      );
    }
    
    // Prepare response data
    const result = {
      data_sources: filteredSources.map(source => ({
        id: source.id,
        name: source.name,
        description: source.description,
        data_type: source.dataType,
        fields: source.fields,
        sample_data: include_sample_data ? source.sampleData : undefined
      }))
    };
    
    return result;
  }
  
  /**
   * Generate a financial or payroll forecast
   */
  private async generateForecast(params: any): Promise<any> {
    const { data_source_ids, forecast_type, periods, period_type } = params;
    
    // Ensure all requested data sources exist
    const availableSources = data_source_ids.filter(id => this.dataSources.has(id));
    
    if (availableSources.length === 0) {
      return {
        error: 'No valid data sources provided',
        available_sources: Array.from(this.dataSources.keys())
      };
    }
    
    // Get the data sources
    const sources = availableSources.map(id => this.dataSources.get(id));
    
    // In a real implementation, this would query the actual data and use
    // statistical methods for forecasting. For this demo, we'll generate mock data.
    
    // Generate the time periods for the forecast
    const forecastPeriods = [];
    const today = new Date();
    
    for (let i = 1; i <= periods; i++) {
      let periodDate = new Date(today);
      
      switch (period_type) {
        case 'day':
          periodDate.setDate(today.getDate() + i);
          break;
        case 'week':
          periodDate.setDate(today.getDate() + (i * 7));
          break;
        case 'month':
          periodDate.setMonth(today.getMonth() + i);
          break;
        case 'quarter':
          periodDate.setMonth(today.getMonth() + (i * 3));
          break;
        case 'year':
          periodDate.setFullYear(today.getFullYear() + i);
          break;
      }
      
      forecastPeriods.push(periodDate.toISOString().slice(0, 10)); // YYYY-MM-DD format
    }
    
    // Prepare the forecast result
    const forecast: any = {
      timestamp: new Date().toISOString(),
      forecast_type,
      periods,
      period_type,
      data_sources: sources.map(s => ({ id: s!.id, name: s!.name })),
      forecast: [],
      confidence_interval: {},
      assumptions: [],
      risk_factors: []
    };
    
    // Generate different forecast based on type
    switch (forecast_type) {
      case 'payroll':
        // Base value with slight growth
        const basePayroll = 250000;
        const payrollGrowthRate = 0.02; // 2% per period
        
        forecast.forecast = forecastPeriods.map((period, index) => {
          const forecastValue = basePayroll * Math.pow(1 + payrollGrowthRate, index + 1);
          // Add some randomness
          const randomFactor = 1 + ((Math.random() * 0.04) - 0.02); // ±2%
          return {
            period,
            value: Math.round(forecastValue * randomFactor)
          };
        });
        
        forecast.confidence_interval = {
          type: '95% confidence',
          lower_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.round(f.value * 0.9) // 10% below forecast
          })),
          upper_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.round(f.value * 1.1) // 10% above forecast
          }))
        };
        
        forecast.assumptions = [
          'Current headcount and compensation structure maintained',
          'Planned merit increases implemented according to schedule',
          'No significant changes in benefit costs',
          'Normal seasonal fluctuations in contractor usage'
        ];
        
        forecast.risk_factors = [
          'Potential additional headcount needs in Engineering',
          'Possible benefits cost increases in healthcare',
          'Market pressure on compensation for specialized roles'
        ];
        break;
        
      case 'revenue':
        // Base value with growth and seasonality
        const baseRevenue = 400000;
        const revenueGrowthRate = 0.03; // 3% per period
        
        forecast.forecast = forecastPeriods.map((period, index) => {
          const forecastValue = baseRevenue * Math.pow(1 + revenueGrowthRate, index + 1);
          // Add seasonality factor (Q4 boost if applicable)
          const periodDate = new Date(period);
          const seasonalFactor = (periodDate.getMonth() === 10 || periodDate.getMonth() === 11) ? 1.2 : 1.0;
          // Add some randomness
          const randomFactor = 1 + ((Math.random() * 0.06) - 0.03); // ±3%
          return {
            period,
            value: Math.round(forecastValue * seasonalFactor * randomFactor)
          };
        });
        
        forecast.confidence_interval = {
          type: '90% confidence',
          lower_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.round(f.value * 0.85) // 15% below forecast
          })),
          upper_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.round(f.value * 1.15) // 15% above forecast
          }))
        };
        
        forecast.assumptions = [
          'Current sales pipeline conversion rates maintained',
          'No significant changes in product pricing',
          'New product launch proceeds as scheduled',
          'Market conditions remain stable'
        ];
        
        forecast.risk_factors = [
          'Increasing competitive pressure in primary markets',
          'Potential delays in new product release',
          'Economic uncertainty affecting consumer spending'
        ];
        break;
        
      case 'expenses':
        // Base value with modest growth
        const baseExpenses = 300000;
        const expenseGrowthRate = 0.015; // 1.5% per period
        
        forecast.forecast = forecastPeriods.map((period, index) => {
          const forecastValue = baseExpenses * Math.pow(1 + expenseGrowthRate, index + 1);
          // Add some randomness
          const randomFactor = 1 + ((Math.random() * 0.05) - 0.025); // ±2.5%
          return {
            period,
            value: Math.round(forecastValue * randomFactor)
          };
        });
        
        forecast.confidence_interval = {
          type: '95% confidence',
          lower_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.round(f.value * 0.925) // 7.5% below forecast
          })),
          upper_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.round(f.value * 1.075) // 7.5% above forecast
          }))
        };
        
        forecast.assumptions = [
          'Current vendor contracts maintained at existing rates',
          'Office lease costs remain stable',
          'Normal seasonal fluctuations in operational expenses',
          'No major unexpected equipment replacements'
        ];
        
        forecast.risk_factors = [
          'Potential increases in vendor pricing',
          'Office expansion costs if headcount growth exceeds current capacity',
          'Technology infrastructure upgrades may be needed'
        ];
        break;
        
      case 'headcount':
        // Base value with planned growth
        const baseHeadcount = 65;
        const headcountGrowthRate = 0.025; // 2.5% per period
        
        forecast.forecast = forecastPeriods.map((period, index) => {
          const forecastValue = baseHeadcount * Math.pow(1 + headcountGrowthRate, index + 1);
          // For headcount, round to whole numbers
          return {
            period,
            value: Math.round(forecastValue)
          };
        });
        
        forecast.confidence_interval = {
          type: '90% confidence',
          lower_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.max(Math.floor(f.value * 0.95), baseHeadcount) // 5% below forecast but never below current
          })),
          upper_bound: forecast.forecast.map((f: any) => ({
            period: f.period,
            value: Math.ceil(f.value * 1.05) // 5% above forecast
          }))
        };
        
        forecast.assumptions = [
          'Current hiring plans proceed as scheduled',
          'Employee attrition remains at historical levels',
          'Planned organizational structure changes implemented',
          'Budget approved for planned growth'
        ];
        
        forecast.risk_factors = [
          'Competitive hiring market for key technical roles',
          'Potential higher attrition due to market conditions',
          'Possible hiring freezes if revenue targets not met'
        ];
        break;
    }
    
    // Save the forecast result if user ID is available
    if (this.userId) {
      const analysisResult: AnalysisResult = {
        id: uuidv4(),
        query: `Generate ${forecast_type} forecast for ${periods} ${period_type}(s)`,
        dataSourceIds: availableSources,
        result: forecast,
        timestamp: new Date(),
        confidence: 0.8,
        user_id: this.userId,
        company_id: this.companyId
      };
      
      try {
        await supabase
          .from('analysis_results')
          .insert(analysisResult);
        
        // Update local cache
        for (const sourceId of availableSources) {
          if (!this.analysisResults.has(sourceId)) {
            this.analysisResults.set(sourceId, []);
          }
          this.analysisResults.get(sourceId)!.push(analysisResult);
        }
      } catch (error) {
        console.error('Error saving forecast result:', error);
      }
    }
    
    return forecast;
  }
  
  /**
   * Helper method to generate a random money amount
   */
  private randomMoney(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }
  
  /**
   * Get relevant context for a data analysis query from the knowledge base
   */
  protected async getRelevantContext(query: string): Promise<string | null> {
    try {
      // Get relevant knowledge base entries
      const financeInfoEntries = await supabase.rpc('match_documents', {
        query_embedding: [0.1], // Placeholder, will be replaced by embedding model
        match_threshold: 0.7,
        match_count: 3,
        collection_name: 'finance_information'
      });
      
      if (financeInfoEntries && financeInfoEntries.data && Array.isArray(financeInfoEntries.data) && financeInfoEntries.data.length > 0) {
        return financeInfoEntries.data
          .map((entry: any) => `${entry.title || 'Financial Information'}: ${entry.content}`)
          .join('\n\n');
      }
      
      return null;
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return null;
    }
  }
}