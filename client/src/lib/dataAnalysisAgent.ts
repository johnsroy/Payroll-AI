import { BaseAgent, AgentConfig } from './baseAgent';
import OpenAI from 'openai';
import { parse } from 'papaparse';

interface DataAnalysisResult {
  summary: string;
  insights: string[];
  statistics: Record<string, any>;
  visualizationSuggestions?: string[];
}

interface FinancialForecastResult {
  forecast: Array<{
    period: string;
    predictedValue: number;
    lowerBound?: number;
    upperBound?: number;
  }>;
  confidenceLevel: number;
  assumptions: string[];
  riskFactors: string[];
}

interface VarianceAnalysisResult {
  totalVariance: number;
  percentageVariance: number;
  variances: Array<{
    category: string;
    actual: number;
    expected: number;
    variance: number;
    percentageVariance: number;
    impact: 'positive' | 'negative' | 'neutral';
    significance: 'high' | 'medium' | 'low';
  }>;
  summary: string;
  recommendations: string[];
}

export class DataAnalysisAgent extends BaseAgent {
  private openai: OpenAI;
  
  constructor(config: AgentConfig) {
    // Define specialized system prompt for data analysis agent
    const dataAnalysisSystemPrompt = `You are a payroll data analysis assistant specialized in financial insights. Your primary functions are:

1. Analyze payroll data to identify trends, anomalies, and insights
2. Generate forecasts based on historical payroll data
3. Perform variance analysis comparing actual vs. budgeted payroll
4. Calculate key payroll metrics and statistics

When analyzing data:
- Consider both the numerical patterns and their business implications
- Identify seasonality, trends, and outliers in payroll expenses
- Provide actionable insights that help with financial planning
- Consider factors like overtime, benefits, taxes, and other payroll components
- Explain your analysis in clear business terms while maintaining technical accuracy

Always provide both summary-level insights and detailed breakdowns when analyzing data sets.`;

    // Initialize the agent with data analysis-specific configuration
    super({
      ...config,
      systemPrompt: dataAnalysisSystemPrompt,
      temperature: 0.2, // Lower temperature for more precise analysis
    });
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    
    // Define data analysis tools
    this.tools = [
      {
        type: "function",
        function: {
          name: "analyze_data",
          description: "Analyze a dataset and provide insights",
          parameters: {
            type: "object",
            properties: {
              data: {
                type: "array",
                description: "The dataset to analyze (array of objects)"
              },
              analysis_type: {
                type: "string",
                description: "Type of analysis to perform",
                enum: ["payroll_trends", "expense_distribution", "headcount", "compensation", "benefits", "general"]
              },
              time_period: {
                type: "string",
                description: "Time period for the analysis (optional)"
              }
            },
            required: ["data"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_forecast",
          description: "Generate a time-series forecast based on historical data",
          parameters: {
            type: "object",
            properties: {
              historical_data: {
                type: "array",
                description: "Historical data points as array of objects with 'period' and 'value'"
              },
              forecast_periods: {
                type: "number",
                description: "Number of periods to forecast into the future"
              },
              forecast_type: {
                type: "string",
                description: "Type of forecast to generate",
                enum: ["payroll_expenses", "headcount", "overtime", "benefits", "taxes"]
              },
              confidence_interval: {
                type: "number",
                description: "Confidence interval for the forecast (0-1)"
              }
            },
            required: ["historical_data", "forecast_periods"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "perform_variance_analysis",
          description: "Perform variance analysis comparing actual vs. expected values",
          parameters: {
            type: "object",
            properties: {
              actual_data: {
                type: "array",
                description: "Actual data points as array of objects"
              },
              expected_data: {
                type: "array",
                description: "Expected/budgeted data points as array of objects"
              },
              variance_type: {
                type: "string",
                description: "Type of variance analysis to perform",
                enum: ["payroll_budget", "department_expenses", "benefit_costs", "tax_expenses", "general"]
              }
            },
            required: ["actual_data", "expected_data"]
          }
        }
      }
    ];
  }

  /**
   * Analyze a dataset and provide insights
   */
  async analyzeData(
    data: any[],
    analysisType: string = 'general',
    timePeriod: string = ''
  ): Promise<DataAnalysisResult> {
    // Validate data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data format. Expected non-empty array.');
    }
    
    // Compute basic statistics
    const statistics = this.computeBasicStatistics(data);
    
    // Prepare a prompt for OpenAI to analyze the data
    const dataAnalysisPrompt = `Perform a detailed ${analysisType} analysis on the following payroll data${timePeriod ? ` for ${timePeriod}` : ''}:

Data:
${JSON.stringify(data.slice(0, 50), null, 2)}

Basic Statistics:
${JSON.stringify(statistics, null, 2)}

Provide the following:
1. A concise summary of the key findings (2-3 paragraphs)
2. 5-7 specific insights derived from the data
3. 2-3 visualization suggestions that would best represent this data

Format your response as a JSON object with these keys:
- summary: string
- insights: string[]
- visualization_suggestions: string[]`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: dataAnalysisPrompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to analyze data');
    }
    
    try {
      const result = JSON.parse(content);
      return {
        summary: result.summary,
        insights: result.insights || [],
        statistics,
        visualizationSuggestions: result.visualization_suggestions || []
      };
    } catch (e) {
      console.error('Error parsing analysis results:', e);
      return {
        summary: "Error analyzing data. Please try again with a different dataset.",
        insights: [],
        statistics
      };
    }
  }

  /**
   * Generate a time-series forecast based on historical data
   */
  async generateForecast(
    historicalData: Array<{ period: string; value: number }>,
    forecastPeriods: number,
    forecastType: string = 'payroll_expenses',
    confidenceInterval: number = 0.95
  ): Promise<FinancialForecastResult> {
    // Validate data
    if (!Array.isArray(historicalData) || historicalData.length < 3) {
      throw new Error('Insufficient historical data for forecasting. Need at least 3 data points.');
    }
    
    // Prepare a prompt for OpenAI to generate a forecast
    const forecastPrompt = `Generate a ${forecastType} forecast for the next ${forecastPeriods} periods based on the following historical data:

Historical Data:
${JSON.stringify(historicalData, null, 2)}

Confidence Interval: ${confidenceInterval}

Consider any seasonality, trends, and patterns in the data. Provide the following:
1. A forecast for each of the next ${forecastPeriods} periods, including lower and upper bounds
2. Key assumptions made in the forecast
3. Potential risk factors that could impact the forecast
4. A confidence level for the overall forecast (0-1)

Format your response as a JSON object with these keys:
- forecast: Array of objects with period, predictedValue, lowerBound, upperBound
- assumptions: string[]
- risk_factors: string[]
- confidence_level: number`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: forecastPrompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate forecast');
    }
    
    try {
      const result = JSON.parse(content);
      
      // Process the periods to ensure they follow from the historical data
      let lastPeriod = historicalData[historicalData.length - 1].period;
      
      // Simple period incrementing logic (this would be more sophisticated in a real implementation)
      const processedForecast = result.forecast.map((item: any, index: number) => {
        // Handle different period formats (assuming they're dates or numbered periods)
        let nextPeriod;
        
        // Check if period is a date
        if (lastPeriod.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // It's a date in YYYY-MM-DD format
          const date = new Date(lastPeriod);
          date.setMonth(date.getMonth() + 1);
          nextPeriod = date.toISOString().split('T')[0];
        } else if (lastPeriod.match(/^Q\d \d{4}$/)) {
          // It's a quarter like "Q1 2023"
          const parts = lastPeriod.split(' ');
          let quarter = parseInt(parts[0].substring(1));
          let year = parseInt(parts[1]);
          
          quarter++;
          if (quarter > 4) {
            quarter = 1;
            year++;
          }
          
          nextPeriod = `Q${quarter} ${year}`;
        } else if (lastPeriod.match(/^\d+$/)) {
          // It's a numeric period
          nextPeriod = (parseInt(lastPeriod) + 1).toString();
        } else {
          // Use the provided period or generate a sequential one
          nextPeriod = item.period || `Period ${index + 1}`;
        }
        
        lastPeriod = nextPeriod;
        
        return {
          period: nextPeriod,
          predictedValue: item.predictedValue,
          lowerBound: item.lowerBound,
          upperBound: item.upperBound
        };
      });
      
      return {
        forecast: processedForecast,
        confidenceLevel: result.confidence_level,
        assumptions: result.assumptions || [],
        riskFactors: result.risk_factors || []
      };
    } catch (e) {
      console.error('Error parsing forecast results:', e);
      
      // Return a minimal forecast with just the predicted values
      return {
        forecast: Array(forecastPeriods).fill(0).map((_, i) => ({
          period: `Forecast ${i + 1}`,
          predictedValue: 0
        })),
        confidenceLevel: 0,
        assumptions: ["Error generating forecast"],
        riskFactors: ["Insufficient or invalid data"]
      };
    }
  }

  /**
   * Perform variance analysis comparing actual vs. budget/expected values
   */
  async performVarianceAnalysis(
    actualData: any[],
    expectedData: any[],
    varianceType: string = 'general'
  ): Promise<VarianceAnalysisResult> {
    // Validate data
    if (!Array.isArray(actualData) || !Array.isArray(expectedData)) {
      throw new Error('Invalid data format. Expected arrays for both actual and expected data.');
    }
    
    // Prepare a prompt for OpenAI to perform variance analysis
    const variancePrompt = `Perform a detailed ${varianceType} variance analysis comparing the following actual vs. expected payroll data:

Actual Data:
${JSON.stringify(actualData.slice(0, 30), null, 2)}

Expected Data:
${JSON.stringify(expectedData.slice(0, 30), null, 2)}

Calculate and analyze the variances between actual and expected values. Provide the following:
1. Total variance amount and percentage
2. Breakdown of variances by category with the following for each:
   - Actual value
   - Expected value
   - Variance amount
   - Variance percentage
   - Impact (positive/negative/neutral)
   - Significance (high/medium/low)
3. Summary of key findings
4. Recommendations based on the variance analysis

Format your response as a JSON object with these keys:
- total_variance: number
- percentage_variance: number
- variances: Array of objects with category, actual, expected, variance, percentageVariance, impact, significance
- summary: string
- recommendations: string[]`;

    const response = await this.sendMessage(variancePrompt);
    
    try {
      // Extract JSON from the response text
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                        response.match(/\{[\s\S]*\}/);
                        
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response');
      }
      
      const jsonText = jsonMatch[0].replace(/```json|```/g, '').trim();
      const result = JSON.parse(jsonText);
      
      return {
        totalVariance: result.total_variance,
        percentageVariance: result.percentage_variance,
        variances: result.variances.map((v: any) => ({
          category: v.category,
          actual: v.actual,
          expected: v.expected,
          variance: v.variance,
          percentageVariance: v.percentageVariance || v.percentage_variance,
          impact: v.impact.toLowerCase(),
          significance: v.significance.toLowerCase()
        })),
        summary: result.summary,
        recommendations: result.recommendations
      };
    } catch (e) {
      console.error('Error parsing variance analysis:', e, response);
      
      // Calculate a basic variance as fallback
      let totalActual = 0;
      let totalExpected = 0;
      
      if (actualData.length > 0 && typeof actualData[0] === 'object') {
        // If data is an array of objects, sum up all numeric values
        actualData.forEach(item => {
          Object.values(item).forEach(val => {
            if (typeof val === 'number') totalActual += val;
          });
        });
        
        expectedData.forEach(item => {
          Object.values(item).forEach(val => {
            if (typeof val === 'number') totalExpected += val;
          });
        });
      } else if (actualData.length > 0 && typeof actualData[0] === 'number') {
        // If data is an array of numbers
        totalActual = actualData.reduce((sum: number, val: number) => sum + val, 0);
        totalExpected = expectedData.reduce((sum: number, val: number) => sum + val, 0);
      }
      
      const totalVariance = totalActual - totalExpected;
      const percentageVariance = totalExpected !== 0 ? (totalVariance / totalExpected) * 100 : 0;
      
      return {
        totalVariance,
        percentageVariance,
        variances: [{
          category: 'Total',
          actual: totalActual,
          expected: totalExpected,
          variance: totalVariance,
          percentageVariance: percentageVariance,
          impact: totalVariance > 0 ? 'positive' : totalVariance < 0 ? 'negative' : 'neutral',
          significance: Math.abs(percentageVariance) > 10 ? 'high' : Math.abs(percentageVariance) > 5 ? 'medium' : 'low'
        }],
        summary: `The total variance is ${totalVariance.toFixed(2)} (${percentageVariance.toFixed(2)}%).`,
        recommendations: ["Review the data for accuracy", "Analyze the source of the variance"]
      };
    }
  }

  /**
   * Compute basic statistics on a dataset to assist with analysis
   */
  private computeBasicStatistics(data: any[]): Record<string, any> {
    const stats: Record<string, any> = {
      count: data.length,
      fields: Object.keys(data[0] || {})
    };
    
    // Calculate numeric stats for each field
    const numericStats: Record<string, any> = {};
    
    // Identify numeric fields
    Object.keys(data[0] || {}).forEach(field => {
      const values = data.map(item => item[field]).filter(val => typeof val === 'number');
      
      if (values.length > 0) {
        const sum = values.reduce((total, val) => total + val, 0);
        const mean = sum / values.length;
        
        // Sort values for median and percentiles
        const sortedValues = [...values].sort((a, b) => a - b);
        const median = this.percentile(sortedValues, 0.5);
        
        numericStats[field] = {
          min: Math.min(...values),
          max: Math.max(...values),
          mean,
          median,
          sum,
          p25: this.percentile(sortedValues, 0.25),
          p75: this.percentile(sortedValues, 0.75)
        };
      }
    });
    
    // Calculate categorical stats
    const categoricalStats: Record<string, any> = {};
    
    Object.keys(data[0] || {}).forEach(field => {
      const values = data.map(item => item[field]);
      
      // Check if the field appears to be categorical
      if (typeof values[0] === 'string' || 
          (values[0] !== null && 
           values[0] !== undefined && 
           !Array.isArray(values[0]) && 
           typeof values[0] !== 'object')) {
        
        // Count frequency of each value
        const valueCounts: Record<string, number> = {};
        values.forEach(val => {
          const key = String(val);
          valueCounts[key] = (valueCounts[key] || 0) + 1;
        });
        
        const uniqueValues = Object.keys(valueCounts);
        
        categoricalStats[field] = {
          unique_count: uniqueValues.length,
          most_common: this.findMostCommon(values),
          value_counts: valueCounts,
          is_binary: uniqueValues.length === 2
        };
      }
    });
    
    stats.numeric = numericStats;
    stats.categorical = categoricalStats;
    
    return stats;
  }

  /**
   * Calculate percentile value from a sorted array
   */
  private percentile(sortedArr: number[], p: number): number {
    if (sortedArr.length === 0) return 0;
    if (sortedArr.length === 1) return sortedArr[0];
    
    const index = Math.max(0, Math.min(sortedArr.length - 1, Math.floor(sortedArr.length * p)));
    return sortedArr[index];
  }

  /**
   * Find the most common value in an array
   */
  private findMostCommon(arr: any[]): any {
    const counts: Record<string, number> = {};
    let maxCount = 0;
    let maxValue: any = null;
    
    arr.forEach(val => {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
      
      if (counts[key] > maxCount) {
        maxCount = counts[key];
        maxValue = val;
      }
    });
    
    return maxValue;
  }
  
  /**
   * Parse CSV data to JSON
   */
  parseCSV(csvData: string): any[] {
    const result = parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    return result.data as any[];
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
        case 'analyze_data':
          functionResult = await this.analyzeData(
            args.data,
            args.analysis_type || 'general',
            args.time_period || ''
          );
          break;
        case 'generate_forecast':
          functionResult = await this.generateForecast(
            args.historical_data,
            args.forecast_periods,
            args.forecast_type || 'payroll_expenses',
            args.confidence_interval || 0.95
          );
          break;
        case 'perform_variance_analysis':
          functionResult = await this.performVarianceAnalysis(
            args.actual_data,
            args.expected_data,
            args.variance_type || 'general'
          );
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