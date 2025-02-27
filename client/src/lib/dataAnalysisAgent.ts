import { BaseAgent, AgentConfig } from './baseAgent';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';

interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: string[];
  sampleData?: any[];
}

interface AnalysisResult {
  id: string;
  dataSourceId: string;
  query: string;
  result: any;
  timestamp: Date;
  confidence: number;
}

export class DataAnalysisAgent extends BaseAgent {
  private anthropic: Anthropic;
  private systemPrompt: string;
  private model: string = 'claude-3-sonnet-20240229';
  private temperature: number = 0.1;
  private dataSources: Map<string, DataSource> = new Map();
  private analysisResults: Map<string, AnalysisResult[]> = new Map();
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Initialize Anthropic client with API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for DataAnalysisAgent');
    }
    
    this.anthropic = new Anthropic({
      apiKey
    });
    
    // Set up system prompt for data analysis agent
    this.systemPrompt = `You are an advanced data analysis agent in a multi-agent system for payroll management.
Your primary responsibilities are:

1. Analyze payroll data to identify patterns, trends, and anomalies
2. Generate statistical summaries and visualizations of financial data
3. Build predictive models for payroll forecasting
4. Validate data quality and identify inconsistencies
5. Transform raw data into actionable insights for decision-making

You specialize in analyzing:
- Employee compensation and benefit metrics
- Tax withholding and compliance data
- Expense categorization and allocation
- Labor cost distributions and trends
- Budget variance and forecasting

When responding, always:
- Provide clear explanations of your analytical approach
- Highlight key insights from the data
- Present conclusions with appropriate confidence levels
- Note any limitations in the data or analysis
- Suggest follow-up analyses when appropriate`;

    // Initialize with mock data sources
    this.initializeMockDataSources();
  }

  /**
   * Reset the agent state
   */
  public reset(): void {
    this.dataSources.clear();
    this.analysisResults.clear();
    this.initializeMockDataSources();
  }

  /**
   * Process a query using the data analysis agent
   */
  public async processQuery(query: string): Promise<{ response: string; confidence: number; metadata?: any }> {
    // Identify relevant data sources for the query
    const relevantSources = this.identifyRelevantDataSources(query);
    
    // Create an analysis prompt based on the query and data sources
    const analysisPrompt = this.createAnalysisPrompt(query, relevantSources);
    
    // Get completion from Anthropic
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: this.temperature,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });
    
    // Extract response
    const assistantMessage = response.content[0].text;
    
    // Store analysis result
    const analysisResult = this.createAnalysisResult(query, relevantSources, assistantMessage);
    this.storeAnalysisResult(analysisResult);
    
    return {
      response: assistantMessage,
      confidence: analysisResult.confidence,
      metadata: {
        dataSourceIds: relevantSources.map(source => source.id),
        analysisId: analysisResult.id
      }
    };
  }

  /**
   * Initialize mock data sources for demonstration purposes
   */
  private initializeMockDataSources(): void {
    // Employee data
    const employeeData: DataSource = {
      id: 'employees',
      name: 'Employee Directory',
      description: 'Core employee information including demographics, positions, and compensation',
      fields: ['id', 'name', 'department', 'position', 'salary', 'hourlyRate', 'hireDate', 'status'],
      sampleData: [
        { id: 'E001', name: 'John Doe', department: 'Engineering', position: 'Senior Developer', salary: 120000, hourlyRate: null, hireDate: '2019-03-15', status: 'Active' },
        { id: 'E002', name: 'Jane Smith', department: 'Marketing', position: 'Marketing Manager', salary: 95000, hourlyRate: null, hireDate: '2020-06-22', status: 'Active' },
        { id: 'E003', name: 'Robert Johnson', department: 'Operations', position: 'Warehouse Associate', salary: null, hourlyRate: 18.75, hireDate: '2021-01-10', status: 'Active' },
        { id: 'E004', name: 'Sarah Williams', department: 'Finance', position: 'Financial Analyst', salary: 85000, hourlyRate: null, hireDate: '2020-11-05', status: 'Active' },
        { id: 'E005', name: 'Michael Brown', department: 'Engineering', position: 'Developer', salary: 95000, hourlyRate: null, hireDate: '2021-08-30', status: 'Active' }
      ]
    };
    
    // Payroll transactions
    const payrollData: DataSource = {
      id: 'payroll_transactions',
      name: 'Payroll Transactions',
      description: 'Historical payroll transaction data including earnings, deductions, and taxes',
      fields: ['id', 'employeeId', 'payPeriod', 'grossPay', 'netPay', 'federalTax', 'stateTax', 'socialSecurity', 'medicare', 'retirement401k', 'healthInsurance', 'otherDeductions'],
      sampleData: [
        { id: 'P001', employeeId: 'E001', payPeriod: '2023-01-15', grossPay: 5000.00, netPay: 3412.50, federalTax: 800.00, stateTax: 300.00, socialSecurity: 310.00, medicare: 72.50, retirement401k: 250.00, healthInsurance: 105.00, otherDeductions: 0 },
        { id: 'P002', employeeId: 'E002', payPeriod: '2023-01-15', grossPay: 3958.33, netPay: 2753.33, federalTax: 650.00, stateTax: 225.00, socialSecurity: 245.42, medicare: 57.40, retirement401k: 197.92, healthInsurance: 105.00, otherDeductions: 0 },
        { id: 'P003', employeeId: 'E003', payPeriod: '2023-01-15', grossPay: 1500.00, netPay: 1111.25, federalTax: 180.00, stateTax: 75.00, socialSecurity: 93.00, medicare: 21.75, retirement401k: 0, healthInsurance: 95.00, otherDeductions: 0 },
        { id: 'P004', employeeId: 'E004', payPeriod: '2023-01-15', grossPay: 3541.67, netPay: 2473.75, federalTax: 550.00, stateTax: 200.00, socialSecurity: 219.58, medicare: 51.34, retirement401k: 177.08, healthInsurance: 105.00, otherDeductions: 0 },
        { id: 'P005', employeeId: 'E005', payPeriod: '2023-01-15', grossPay: 3958.33, netPay: 2753.33, federalTax: 650.00, stateTax: 225.00, socialSecurity: 245.42, medicare: 57.40, retirement401k: 197.92, healthInsurance: 105.00, otherDeductions: 0 }
      ]
    };
    
    // Time tracking data
    const timeData: DataSource = {
      id: 'time_tracking',
      name: 'Time Tracking',
      description: 'Employee work hours, overtime, and time-off records',
      fields: ['id', 'employeeId', 'date', 'regularHours', 'overtimeHours', 'doubleTimeHours', 'ptoHours', 'sickHours', 'holidayHours', 'unpaidHours'],
      sampleData: [
        { id: 'T001', employeeId: 'E001', date: '2023-01-01', regularHours: 8, overtimeHours: 0, doubleTimeHours: 0, ptoHours: 0, sickHours: 0, holidayHours: 0, unpaidHours: 0 },
        { id: 'T002', employeeId: 'E001', date: '2023-01-02', regularHours: 9, overtimeHours: 1, doubleTimeHours: 0, ptoHours: 0, sickHours: 0, holidayHours: 0, unpaidHours: 0 },
        { id: 'T003', employeeId: 'E002', date: '2023-01-02', regularHours: 8, overtimeHours: 0, doubleTimeHours: 0, ptoHours: 0, sickHours: 0, holidayHours: 0, unpaidHours: 0 },
        { id: 'T004', employeeId: 'E003', date: '2023-01-02', regularHours: 8, overtimeHours: 2, doubleTimeHours: 0, ptoHours: 0, sickHours: 0, holidayHours: 0, unpaidHours: 0 },
        { id: 'T005', employeeId: 'E004', date: '2023-01-02', regularHours: 8, overtimeHours: 0, doubleTimeHours: 0, ptoHours: 0, sickHours: 0, holidayHours: 0, unpaidHours: 0 }
      ]
    };
    
    // Expense data
    const expenseData: DataSource = {
      id: 'expenses',
      name: 'Expense Records',
      description: 'Business expenses and reimbursements',
      fields: ['id', 'employeeId', 'date', 'amount', 'category', 'description', 'status', 'approvedBy', 'approvalDate', 'receiptUrl'],
      sampleData: [
        { id: 'EX001', employeeId: 'E001', date: '2023-01-05', amount: 125.75, category: 'Travel', description: 'Uber rides for client meeting', status: 'Approved', approvedBy: 'E004', approvalDate: '2023-01-07', receiptUrl: 'receipts/ex001.pdf' },
        { id: 'EX002', employeeId: 'E002', date: '2023-01-10', amount: 45.80, category: 'Meals', description: 'Lunch with potential client', status: 'Approved', approvedBy: 'E004', approvalDate: '2023-01-12', receiptUrl: 'receipts/ex002.pdf' },
        { id: 'EX003', employeeId: 'E001', date: '2023-01-15', amount: 350.00, category: 'Software', description: 'Annual subscription for design tools', status: 'Pending', approvedBy: null, approvalDate: null, receiptUrl: 'receipts/ex003.pdf' },
        { id: 'EX004', employeeId: 'E005', date: '2023-01-18', amount: 75.25, category: 'Office Supplies', description: 'Printer ink and paper', status: 'Approved', approvedBy: 'E004', approvalDate: '2023-01-19', receiptUrl: 'receipts/ex004.pdf' },
        { id: 'EX005', employeeId: 'E003', date: '2023-01-20', amount: 22.15, category: 'Meals', description: 'Overtime dinner', status: 'Approved', approvedBy: 'E004', approvalDate: '2023-01-22', receiptUrl: 'receipts/ex005.pdf' }
      ]
    };
    
    // Store data sources
    this.dataSources.set(employeeData.id, employeeData);
    this.dataSources.set(payrollData.id, payrollData);
    this.dataSources.set(timeData.id, timeData);
    this.dataSources.set(expenseData.id, expenseData);
  }

  /**
   * Identify relevant data sources for a given query
   */
  private identifyRelevantDataSources(query: string): DataSource[] {
    const queryLower = query.toLowerCase();
    const relevantSources: DataSource[] = [];
    
    // Employee data relevance
    if (
      queryLower.includes('employee') ||
      queryLower.includes('salary') ||
      queryLower.includes('compensation') ||
      queryLower.includes('department') ||
      queryLower.includes('position') ||
      queryLower.includes('hire') ||
      queryLower.includes('workforce')
    ) {
      const employeeData = this.dataSources.get('employees');
      if (employeeData) relevantSources.push(employeeData);
    }
    
    // Payroll data relevance
    if (
      queryLower.includes('payroll') ||
      queryLower.includes('pay') ||
      queryLower.includes('earnings') ||
      queryLower.includes('tax') ||
      queryLower.includes('deduction') ||
      queryLower.includes('gross') ||
      queryLower.includes('net') ||
      queryLower.includes('withholding') ||
      queryLower.includes('401k')
    ) {
      const payrollData = this.dataSources.get('payroll_transactions');
      if (payrollData) relevantSources.push(payrollData);
    }
    
    // Time data relevance
    if (
      queryLower.includes('time') ||
      queryLower.includes('hours') ||
      queryLower.includes('overtime') ||
      queryLower.includes('pto') ||
      queryLower.includes('sick') ||
      queryLower.includes('holiday') ||
      queryLower.includes('attendance') ||
      queryLower.includes('schedule') ||
      queryLower.includes('shift')
    ) {
      const timeData = this.dataSources.get('time_tracking');
      if (timeData) relevantSources.push(timeData);
    }
    
    // Expense data relevance
    if (
      queryLower.includes('expense') ||
      queryLower.includes('reimbursement') ||
      queryLower.includes('spending') ||
      queryLower.includes('cost') ||
      queryLower.includes('budget') ||
      queryLower.includes('receipt') ||
      queryLower.includes('approval')
    ) {
      const expenseData = this.dataSources.get('expenses');
      if (expenseData) relevantSources.push(expenseData);
    }
    
    // If no specific relevance is found, include all data sources for a general analysis
    if (relevantSources.length === 0) {
      this.dataSources.forEach(source => relevantSources.push(source));
    }
    
    return relevantSources;
  }

  /**
   * Create an analysis prompt based on the query and data sources
   */
  private createAnalysisPrompt(query: string, dataSources: DataSource[]): string {
    let prompt = `I need you to analyze the following payroll data to answer this query:\n\n"${query}"\n\n`;
    
    prompt += "Here are the relevant data sources available for this analysis:\n\n";
    
    dataSources.forEach(source => {
      prompt += `== ${source.name} ==\n`;
      prompt += `Description: ${source.description}\n`;
      prompt += `Fields: ${source.fields.join(', ')}\n`;
      
      if (source.sampleData && source.sampleData.length > 0) {
        prompt += `\nSample data (${Math.min(5, source.sampleData.length)} records):\n`;
        
        // Format sample data records
        source.sampleData.slice(0, 5).forEach((record, index) => {
          prompt += `Record ${index + 1}: ${JSON.stringify(record)}\n`;
        });
      }
      
      prompt += '\n';
    });
    
    prompt += `Please analyze this data to answer the query. Your response should:

1. Include a step-by-step analysis of the relevant data
2. Provide specific calculations, statistics, or trends that address the query
3. Highlight key insights and their business implications
4. Note any limitations in the data that might affect your analysis
5. When appropriate, suggest follow-up analyses or additional data that would be valuable

If you need to make assumptions due to limited data, please state them clearly. If the query requires projections or forecasting, explain your methodology.`;
    
    return prompt;
  }

  /**
   * Create an analysis result object
   */
  private createAnalysisResult(query: string, dataSources: DataSource[], response: string): AnalysisResult {
    // Calculate confidence based on data sources and response
    const confidence = this.calculateConfidence(dataSources, response);
    
    // Create and return analysis result
    return {
      id: uuidv4(),
      dataSourceId: dataSources.map(source => source.id).join(','),
      query,
      result: response,
      timestamp: new Date(),
      confidence
    };
  }

  /**
   * Store an analysis result
   */
  private storeAnalysisResult(result: AnalysisResult): void {
    // Extract data source IDs
    const dataSourceIds = result.dataSourceId.split(',');
    
    // Store the result for each data source ID
    dataSourceIds.forEach(dataSourceId => {
      if (!this.analysisResults.has(dataSourceId)) {
        this.analysisResults.set(dataSourceId, []);
      }
      
      const results = this.analysisResults.get(dataSourceId);
      if (results) {
        results.push(result);
        
        // Limit the number of stored results per data source
        if (results.length > 50) {
          results.shift();  // Remove oldest result
        }
      }
    });
  }

  /**
   * Calculate confidence based on data sources and response
   */
  private calculateConfidence(dataSources: DataSource[], response: string): number {
    // Start with a baseline confidence
    let confidence = 0.6;
    
    // More data sources increases confidence
    confidence += Math.min(0.2, dataSources.length * 0.05);
    
    // Sample data availability increases confidence
    const dataSourcesWithSampleData = dataSources.filter(source => 
      source.sampleData && source.sampleData.length > 0
    ).length;
    
    confidence += Math.min(0.2, dataSourcesWithSampleData * 0.05);
    
    // Uncertainty language decreases confidence
    const uncertaintyPatterns = ["uncertain", "unclear", "insufficient data", "limited information", "assumption", "estimated"];
    const uncertaintyCount = uncertaintyPatterns.reduce((count, pattern) => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      return count + (response.match(regex) || []).length;
    }, 0);
    
    confidence -= Math.min(0.3, uncertaintyCount * 0.05);
    
    // Ensure confidence stays within [0, 1] range
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get all available data sources
   */
  public getDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  /**
   * Get a specific data source by ID
   */
  public getDataSource(id: string): DataSource | undefined {
    return this.dataSources.get(id);
  }

  /**
   * Get analysis results for a specific data source
   */
  public getAnalysisResults(dataSourceId: string): AnalysisResult[] {
    return this.analysisResults.get(dataSourceId) || [];
  }
}