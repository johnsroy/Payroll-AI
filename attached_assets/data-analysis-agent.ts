import { BaseAgent, AgentConfig } from './baseAgent';
import { OpenAI } from 'openai';
import { supabase } from '../supabase';
import Papa from 'papaparse';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export class DataAnalysisAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    // Define comprehensive system prompt for data analysis agent
    const dataAnalysisSystemPrompt = `You are a specialized data analysis assistant for payroll and financial data.

Your primary responsibilities include:
1. Analyzing financial and payroll datasets to extract meaningful insights
2. Calculating key statistics and metrics from numerical data
3. Identifying trends, patterns, and anomalies in time-series data
4. Generating forecasts and projections based on historical data
5. Explaining complex financial patterns in clear, accessible language

When analyzing data:
- Identify the key variables and relationships in the dataset
- Calculate appropriate descriptive statistics (mean, median, standard deviation, etc.)
- Look for outliers and anomalies that may require further investigation
- Consider seasonal patterns and cyclical trends in time-series data
- Account for the impact of external factors when interpreting results
- Note limitations in the data or analysis when appropriate

For financial and payroll analysis:
- Calculate growth rates, variances, and other relevant financial metrics
- Consider tax implications and compliance requirements
- Compare results to industry benchmarks when available
- Focus on actionable insights that can drive business decisions

Present your analysis in a clear, organized manner with:
- A concise summary of key findings
- Specific data points and calculations to support conclusions
- Suggestions for potential visualizations when helpful
- Recommendations for further analysis where appropriate`;

    // Initialize the agent with data analysis-specific configuration
    super({
      ...config,
      systemPrompt: dataAnalysisSystemPrompt,
      temperature: 0.2, // Lower temperature for more precise data analysis
    });
  }

  /**
   * Analyze a dataset and provide insights
   */
  async analyzeData(
    data: string | object[] | Record<string, any>,
    analysisGoal: string
  ): Promise<DataAnalysisResult> {
    try {
      // Parse data if it's a string (like CSV)
      let parsedData: any;
      
      if (typeof data === 'string') {
        try {
          // Try parsing as JSON first
          parsedData = JSON.parse(data);
        } catch (e) {
          // If not JSON, try parsing as CSV
          const csvResult = Papa.parse(data, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
          });
          
          if (csvResult.errors && csvResult.errors.length > 0) {
            console.warn('CSV parsing had errors:', csvResult.errors);
          }
          
          parsedData = csvResult.data;
        }
      } else {
        // Already an object or array
        parsedData = data;
      }
      
      // Convert to string for LLM consumption (limiting to prevent token issues)
      let dataString: string;
      
      if (Array.isArray(parsedData)) {
        // If it's an array of objects, stringify a limited number of rows
        const maxRows = 50;
        dataString = JSON.stringify(
          parsedData.slice(0, maxRows), 
          null, 
          2
        );
        
        if (parsedData.length > maxRows) {
          dataString += `\n\n[Note: Dataset truncated to ${maxRows} rows out of ${parsedData.length} total rows.]`;
        }
      } else {
        // Regular object
        dataString = JSON.stringify(parsedData, null, 2);
      }
      
      // Pre-compute some basic statistics to help the LLM
      const statistics = this.computeBasicStatistics(parsedData);
      
      // Format the analysis request
      const statisticsString = JSON.stringify(statistics, null, 2);
      
      const prompt = `ANALYSIS GOAL: ${analysisGoal}\n\nDATASET:\n${dataString}\n\nBASIC STATISTICS:\n${statisticsString}\n\nBased on this dataset and the analysis goal, please provide:
1. A summary of key findings (3-5 sentences)
2. Detailed insights and observations (bullet points)
3. Any additional statistics or metrics relevant to the analysis goal
4. Suggestions for visualizations that would effectively communicate these findings

Format your response as JSON with the following keys:
- summary (string)
- insights (array of strings)
- statistics (object with relevant metrics)
- visualizationSuggestions (array of strings)`;

      // Get analysis from LLM as structured output
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: this.temperature,
        max_tokens: 2000
      });

      const analysisText = response.choices[0].message.content || '{}';
      const analysis = JSON.parse(analysisText);
      
      // Add the analysis to conversation history
      this.messages.push(
        { role: 'user', content: `Analyze this data with goal: ${analysisGoal}` },
        { role: 'assistant', content: analysisText }
      );
      
      // Save conversation if memory is enabled
      if (this.memory) {
        await this.saveConversation();
      }
      
      return {
        summary: analysis.summary || 'No summary provided.',
        insights: analysis.insights || [],
        statistics: analysis.statistics || {},
        visualizationSuggestions: analysis.visualizationSuggestions || []
      };
    } catch (error) {
      console.error('Error analyzing data:', error);
      return {
        summary: 'An error occurred during data analysis.',
        insights: ['Unable to complete analysis due to an error.'],
        statistics: {}
      };
    }
  }

  /**
   * Generate a time-series forecast based on historical data
   */
  async generateForecast(
    historicalData: Array<{ period: string; value: number }>,
    periodsToForecast: number,
    forecastName: string,
    additionalFactors?: string
  ): Promise<FinancialForecastResult> {
    try {
      // Format the data for the LLM
      const dataString = JSON.stringify(historicalData, null, 2);
      
      // Calculate basic statistics for the time series
      const values = historicalData.map(item => item.value);
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );
      
      // Check for trend
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      
      const firstHalfMean = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondHalfMean = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      const trend = secondHalfMean > firstHalfMean ? 'increasing' :
                    secondHalfMean < firstHalfMean ? 'decreasing' : 'stable';
      
      // Format the statistics
      const statistics = {
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        min: Math.min(...values).toFixed(2),
        max: Math.max(...values).toFixed(2),
        observedTrend: trend
      };
      
      const prompt = `FORECAST REQUEST: Generate a ${periodsToForecast}-period forecast for ${forecastName}\n\nHISTORICAL DATA:\n${dataString}\n\nSTATISTICS:\n${JSON.stringify(statistics, null, 2)}\n\n${additionalFactors ? `ADDITIONAL FACTORS TO CONSIDER:\n${additionalFactors}\n\n` : ''}Based on this historical data, please generate a forecast for the next ${periodsToForecast} periods.

Format your response as JSON with the following structure:
- forecast: an array of objects, each with:
  - period: string (period label)
  - predictedValue: number
  - lowerBound: number (lower confidence interval)
  - upperBound: number (upper confidence interval)
- confidenceLevel: number (0-100 indicating confidence in the forecast)
- assumptions: array of strings (key assumptions used in the forecast)
- riskFactors: array of strings (potential risks that could impact the forecast)`;

      // Get forecast from LLM as structured output
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Slightly higher temperature for forecasting
        max_tokens: 2000
      });

      const forecastText = response.choices[0].message.content || '{}';
      const forecast = JSON.parse(forecastText);
      
      // Add the forecast to conversation history
      this.messages.push(
        { role: 'user', content: `Generate a ${periodsToForecast}-period forecast for ${forecastName}` },
        { role: 'assistant', content: forecastText }
      );
      
      // Save conversation if memory is enabled
      if (this.memory) {
        await this.saveConversation();
      }
      
      return {
        forecast: forecast.forecast || [],
        confidenceLevel: forecast.confidenceLevel || 0,
        assumptions: forecast.assumptions || [],
        riskFactors: forecast.riskFactors || []
      };
    } catch (error) {
      console.error('Error generating forecast:', error);
      return {
        forecast: [],
        confidenceLevel: 0,
        assumptions: ['Error in forecast generation'],
        riskFactors: ['Unable to complete the forecast due to an error.']
      };
    }
  }

  /**
   * Perform variance analysis comparing actual vs. budget/expected values
   */
  async performVarianceAnalysis(
    actualData: Record<string, number>,
    budgetData: Record<string, number>,
    context?: string
  ): Promise<{
    variances: Record<string, { 
      actual: number;
      budget: number;
      variance: number;
      percentVariance: number;
      isFavorable: boolean;
    }>;
    summary: string;
    significantVariances: string[];
    recommendations: string[];
  }> {
    try {
      // Calculate variances
      const variances: Record<string, any> = {};
      
      for (const key in actualData) {
        if (key in budgetData) {
          const actual = actualData[key];
          const budget = budgetData[key];
          const variance = actual - budget;
          const percentVariance = budget !== 0 ? (variance / Math.abs(budget)) * 100 : 0;
          
          // Determine if the variance is favorable (simplified logic)
          // In real scenarios, this would depend on the account type (revenue, expense, etc.)
          const isFavorable = key.toLowerCase().includes('revenue') || key.toLowerCase().includes('income')
            ? variance > 0  // For revenue, higher than budget is favorable
            : variance < 0; // For expenses, lower than budget is favorable
          
          variances[key] = {
            actual,
            budget,
            variance,
            percentVariance,
            isFavorable
          };
        }
      }
      
      // Format the data for the LLM
      const varianceData = JSON.stringify(variances, null, 2);
      
      const prompt = `VARIANCE ANALYSIS REQUEST: Compare actual vs. budget values\n\nVARIANCE DATA:\n${varianceData}\n\n${context ? `CONTEXT:\n${context}\n\n` : ''}Based on this variance data, please provide:
1. A summary of the overall variance situation
2. Analysis of the most significant variances (both favorable and unfavorable)
3. Recommendations based on the variance analysis

Format your response as JSON with the following structure:
- summary: string (overall assessment)
- significantVariances: array of strings (descriptions of notable variances)
- recommendations: array of strings (actionable recommendations)`;

      // Get analysis from LLM
      const response = await this.sendMessage(prompt);
      
      // Parse the response
      try {
        const analysis = JSON.parse(response);
        
        return {
          variances,
          summary: analysis.summary || 'No summary provided.',
          significantVariances: analysis.significantVariances || [],
          recommendations: analysis.recommendations || []
        };
      } catch (e) {
        // If can't parse as JSON, use regex to extract structured information
        const summaryMatch = response.match(/summary[:\s]+(.*?)(?=significant|$)/si);
        const significantMatch = response.match(/significant variances[:\s]+(.*?)(?=recommendations|$)/si);
        const recommendationsMatch = response.match(/recommendations[:\s]+(.*?)(?=$)/si);
        
        return {
          variances,
          summary: summaryMatch ? summaryMatch[1].trim() : 'No summary provided.',
          significantVariances: significantMatch 
            ? significantMatch[1].split(/\n-|\n\d+\./).map(s => s.trim()).filter(s => s.length > 0)
            : [],
          recommendations: recommendationsMatch
            ? recommendationsMatch[1].split(/\n-|\n\d+\./).map(s => s.trim()).filter(s => s.length > 0)
            : []
        };
      }
    } catch (error) {
      console.error('Error performing variance analysis:', error);
      return {
        variances: {},
        summary: 'An error occurred during variance analysis.',
        significantVariances: [],
        recommendations: ['Unable to complete the analysis due to an error.']
      };
    }
  }

  /**
   * Compute basic statistics on a dataset to assist with analysis
   */
  private computeBasicStatistics(data: any): Record<string, any> {
    if (!data) return {};
    
    // Handle array of objects (most common case)
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const stats: Record<string, any> = {
        rowCount: data.length,
        columns: {}
      };
      
      // Identify columns and their types
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      
      columns.forEach(col => {
        // Determine column type
        const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
        const isNumeric = values.every(val => typeof val === 'number' || !isNaN(Number(val)));
        
        if (isNumeric && values.length > 0) {
          // Compute statistics for numeric columns
          const numericValues = values.map(val => Number(val));
          
          const sum = numericValues.reduce((acc, val) => acc + val, 0);
          const mean = sum / numericValues.length;
          
          const sortedValues = [...numericValues].sort((a, b) => a - b);
          const midIndex = Math.floor(sortedValues.length / 2);
          const median = sortedValues.length % 2 === 0
            ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
            : sortedValues[midIndex];
          
          const min = Math.min(...numericValues);
          const max = Math.max(...numericValues);
          
          stats.columns[col] = {
            type: 'numeric',
            count: numericValues.length,
            missing: data.length - numericValues.length,
            mean,
            median,
            min,
            max,
            sum
          };
        } else {
          // For non-numeric columns, show basic info
          const uniqueValues = [...new Set(values)];
          
          stats.columns[col] = {
            type: 'categorical',
            count: values.length,
            missing: data.length - values.length,
            uniqueCount: uniqueValues.length,
            mostCommon: this.findMostCommon(values)
          };
        }
      });
      
      return stats;
    }
    
    // Handle simple array of values
    if (Array.isArray(data)) {
      const isNumeric = data.every(val => typeof val === 'number' || !isNaN(Number(val)));
      
      if (isNumeric) {
        const numericValues = data.map(val => Number(val));
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const mean = sum / numericValues.length;
        
        const sortedValues = [...numericValues].sort((a, b) => a - b);
        const midIndex = Math.floor(sortedValues.length / 2);
        const median = sortedValues.length % 2 === 0
          ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
          : sortedValues[midIndex];
        
        return {
          type: 'numeric_array',
          count: numericValues.length,
          mean,
          median,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          sum
        };
      } else {
        const values = data.filter(val => val !== null && val !== undefined);
        const uniqueValues = [...new Set(values)];
        
        return {
          type: 'categorical_array',
          count: values.length,
          uniqueCount: uniqueValues.length,
          mostCommon: this.findMostCommon(values)
        };
      }
    }
    
    // Handle simple object with key-value pairs
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      return {
        type: 'key_value_object',
        keyCount: keys.length,
        keys
      };
    }
    
    return {
      type: 'unknown',
      description: 'Unable to compute statistics for this data type.'
    };
  }

  /**
   * Find the most common value in an array
   */
  private findMostCommon(arr: any[]): any {
    if (arr.length === 0) return null;
    
    const counts = new Map<any, number>();
    let maxCount = 0;
    let maxValue = arr[0];
    
    for (const value of arr) {
      const stringValue = String(value);
      const count = (counts.get(stringValue) || 0) + 1;
      counts.set(stringValue, count);
      
      if (count > maxCount) {
        maxCount = count;
        maxValue = value;
      }
    }
    
    return {
      value: maxValue,
      count: maxCount,
      percentage: (maxCount / arr.length) * 100
    };
  }
}
