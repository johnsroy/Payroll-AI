import { BaseAgent, AgentConfig } from './baseAgent';
import Papa from 'papaparse';

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
    const dataAnalysisSystemPrompt = `You are a specialized data analysis assistant for payroll, tax, and financial data.

Your primary responsibilities include:
1. Analyzing complex datasets to identify patterns, trends, and outliers
2. Providing statistical summaries and insights from numerical data
3. Generating forecasts based on historical trends
4. Identifying correlations and potential causal relationships
5. Suggesting appropriate visualizations for different data types
6. Performing variance analysis for budget vs. actual comparisons

When analyzing data:
- Start with descriptive statistics (mean, median, min, max, standard deviation)
- Identify key trends and patterns in time-series data
- Look for outliers and anomalies that require further investigation
- Segment data appropriately when dealing with categories
- Consider seasonality and cyclical patterns in financial data
- Note data quality issues that might affect analysis

For financial analysis:
- Calculate relevant financial ratios and metrics
- Identify areas of overspending or underperformance
- Analyze cost structures and expense distributions
- Look for cost-saving opportunities or revenue optimization
- Consider tax implications of financial decisions

When making forecasts:
- State all assumptions clearly
- Provide confidence intervals where appropriate
- Identify risk factors that could affect projections
- Consider multiple scenarios (base case, optimistic, pessimistic)
- Note limitations in the forecasting methodology

Always present insights in a clear, actionable format with specific recommendations when possible.`;

    // Initialize the agent with data analysis-specific configuration
    super({
      ...config,
      systemPrompt: dataAnalysisSystemPrompt,
      temperature: 0.3, // Moderate temperature for balanced analysis
    });
  }

  /**
   * Analyze a dataset and provide insights
   */
  async analyzeData(
    data: string | object[], 
    options?: {
      type?: 'csv' | 'json';
      context?: string;
      focus?: string;
    }
  ): Promise<DataAnalysisResult> {
    try {
      // Parse data if it's a string
      let parsedData: any[] = [];
      
      if (typeof data === 'string') {
        if (options?.type === 'csv' || data.includes(',')) {
          // Parse CSV
          const parseResult = Papa.parse(data, {
            header: true,
            skipEmptyLines: true
          });
          parsedData = parseResult.data as any[];
        } else {
          // Try parsing as JSON
          try {
            parsedData = JSON.parse(data);
            if (!Array.isArray(parsedData)) {
              parsedData = [parsedData];
            }
          } catch (e) {
            // If not valid JSON, treat as raw text
            const lines = data.split('\n').filter(line => line.trim().length > 0);
            parsedData = lines.map(line => ({ text: line }));
          }
        }
      } else {
        // Data is already an object array
        parsedData = data;
      }
      
      // Compute basic statistics
      const statistics = this.computeBasicStatistics(parsedData);
      
      // Prepare the prompt for analysis
      let prompt = 'Please analyze this dataset:\n\n';
      
      // Add context if provided
      if (options?.context) {
        prompt += `Context: ${options.context}\n\n`;
      }
      
      // Add focus area if provided
      if (options?.focus) {
        prompt += `Focus on: ${options.focus}\n\n`;
      }
      
      // Add statistics
      prompt += `Basic Statistics:\n${JSON.stringify(statistics, null, 2)}\n\n`;
      
      // Add data sample (limit to first 20 items to avoid token limits)
      const dataSample = parsedData.slice(0, 20);
      prompt += `Data Sample (first ${dataSample.length} of ${parsedData.length} records):\n${JSON.stringify(dataSample, null, 2)}\n\n`;
      
      // Request analysis with specific format
      prompt += `Please provide:
1. A summary of the dataset
2. Key insights and findings
3. Suggested visualizations that would be appropriate for this data
4. Any recommendations based on the analysis

Format your response with clear section headers.`;
      
      // Send for analysis
      const response = await this.sendMessage(prompt);
      
      // Parse the response for structured output
      const summaryMatch = response.match(/(?:Summary|SUMMARY):([^#]+)(?=#|$)/is);
      const insightsMatch = response.match(/(?:Insights|INSIGHTS|Key\s+Findings|FINDINGS):([^#]+)(?=#|$)/is);
      const visualizationMatch = response.match(/(?:Visualization|VISUALIZATION|Suggested\s+Charts|CHARTS):([^#]+)(?=#|$)/is);
      
      const summary = summaryMatch 
        ? summaryMatch[1].trim() 
        : 'No summary provided.';
      
      const insightsText = insightsMatch 
        ? insightsMatch[1].trim() 
        : '';
      
      const insights = insightsText
        .split(/\n+/)
        .map(line => line.replace(/^[\s-•*]+/, '').trim())
        .filter(line => line.length > 0);
      
      const visualizationText = visualizationMatch
        ? visualizationMatch[1].trim()
        : '';
      
      const visualizationSuggestions = visualizationText
        .split(/\n+/)
        .map(line => line.replace(/^[\s-•*]+/, '').trim())
        .filter(line => line.length > 0);
      
      return {
        summary,
        insights: insights.length > 0 ? insights : ['No specific insights provided.'],
        statistics,
        visualizationSuggestions: visualizationSuggestions.length > 0 ? visualizationSuggestions : undefined
      };
    } catch (error) {
      console.error('Error analyzing data:', error);
      return {
        summary: 'Error occurred during data analysis.',
        insights: ['Analysis could not be completed due to an error.'],
        statistics: {}
      };
    }
  }

  /**
   * Generate a time-series forecast based on historical data
   */
  async generateForecast(
    historicalData: Array<{ period: string; value: number }>,
    options: {
      periodsToForecast: number;
      forecastType?: 'simple' | 'seasonal' | 'regression';
      confidenceInterval?: number;
      additionalFactors?: Record<string, any>;
    }
  ): Promise<FinancialForecastResult> {
    try {
      // Validate input data
      if (!Array.isArray(historicalData) || historicalData.length < 3) {
        throw new Error('Insufficient historical data for forecasting');
      }
      
      // Set default options
      const periodsToForecast = options.periodsToForecast || 6;
      const forecastType = options.forecastType || 'simple';
      const confidenceInterval = options.confidenceInterval || 0.8; // 80% confidence interval by default
      
      // Format the historical data for the prompt
      const historicalDataString = JSON.stringify(historicalData, null, 2);
      
      // Calculate basic statistics for the historical data
      const values = historicalData.map(item => item.value);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
      
      // Prepare the forecast prompt
      let prompt = `Generate a time-series forecast based on this historical data:\n\n${historicalDataString}\n\n`;
      
      prompt += `Forecast parameters:
- Periods to forecast: ${periodsToForecast}
- Forecast type: ${forecastType}
- Confidence interval: ${confidenceInterval * 100}%
- Data mean: ${mean.toFixed(2)}
- Data standard deviation: ${stdDev.toFixed(2)}
`;
      
      // Add additional factors if provided
      if (options.additionalFactors) {
        prompt += `\nAdditional factors to consider:\n${JSON.stringify(options.additionalFactors, null, 2)}\n`;
      }
      
      prompt += `\nPlease provide:
1. A forecast for the next ${periodsToForecast} periods with predicted values and confidence intervals
2. The assumptions used in the forecast
3. Key risk factors that could affect the forecast accuracy

Format your response with clear section headers and provide the forecast in a JSON-compatible format.`;
      
      // Send for forecasting
      const response = await this.sendMessage(prompt);
      
      // Parse the response 
      const forecastMatch = response.match(/```json\s*(\{[\s\S]+?\})\s*```/);
      let forecast: any[] = [];
      
      if (forecastMatch && forecastMatch[1]) {
        try {
          // Try to parse the JSON forecast
          const forecastData = JSON.parse(forecastMatch[1]);
          if (forecastData.forecast && Array.isArray(forecastData.forecast)) {
            forecast = forecastData.forecast;
          }
        } catch (e) {
          console.error('Error parsing forecast JSON:', e);
        }
      }
      
      // If JSON parsing failed, try to extract forecast data with regex
      if (forecast.length === 0) {
        const forecastSection = response.match(/(?:Forecast|FORECAST):([^#]+)(?=#|$)/is);
        if (forecastSection && forecastSection[1]) {
          const forecastLines = forecastSection[1].trim().split('\n');
          
          // Extract periods and values from text
          forecast = forecastLines
            .map(line => {
              const periodMatch = line.match(/(\w+\s+\d{4}|\d{4}-\d{2}|\w+\s+\d+)/i);
              const valueMatch = line.match(/value:?\s*(\d+\.?\d*)/i) || line.match(/:\s*(\d+\.?\d*)/);
              const lowerMatch = line.match(/lower:?\s*(\d+\.?\d*)/i) || line.match(/\(\s*(\d+\.?\d*)\s*-/);
              const upperMatch = line.match(/upper:?\s*(\d+\.?\d*)/i) || line.match(/-\s*(\d+\.?\d*)\s*\)/);
              
              if (periodMatch && valueMatch) {
                return {
                  period: periodMatch[1],
                  predictedValue: parseFloat(valueMatch[1]),
                  lowerBound: lowerMatch ? parseFloat(lowerMatch[1]) : undefined,
                  upperBound: upperMatch ? parseFloat(upperMatch[1]) : undefined
                };
              }
              return null;
            })
            .filter(item => item !== null) as any[];
        }
      }
      
      // Extract assumptions
      const assumptionsMatch = response.match(/(?:Assumptions|ASSUMPTIONS):([^#]+)(?=#|$)/is);
      const assumptionsText = assumptionsMatch ? assumptionsMatch[1].trim() : '';
      const assumptions = assumptionsText
        .split(/\n+/)
        .map(line => line.replace(/^[\s-•*]+/, '').trim())
        .filter(line => line.length > 0);
      
      // Extract risk factors
      const riskMatch = response.match(/(?:Risk Factors|RISK|Risks):([^#]+)(?=#|$)/is);
      const riskText = riskMatch ? riskMatch[1].trim() : '';
      const riskFactors = riskText
        .split(/\n+/)
        .map(line => line.replace(/^[\s-•*]+/, '').trim())
        .filter(line => line.length > 0);
      
      return {
        forecast: forecast.length > 0 ? forecast : [],
        confidenceLevel: confidenceInterval,
        assumptions: assumptions.length > 0 ? assumptions : ['No specific assumptions provided.'],
        riskFactors: riskFactors.length > 0 ? riskFactors : ['No specific risk factors provided.']
      };
    } catch (error) {
      console.error('Error generating forecast:', error);
      return {
        forecast: [],
        confidenceLevel: 0,
        assumptions: ['Forecast could not be generated due to an error.'],
        riskFactors: ['Insufficient data for reliable forecasting.']
      };
    }
  }

  /**
   * Perform variance analysis comparing actual vs. budget/expected values
   */
  async performVarianceAnalysis(
    actualData: Array<{ category: string; actual: number }>,
    budgetData: Array<{ category: string; budget: number }>,
    options?: {
      context?: string;
      significanceThreshold?: number;
    }
  ): Promise<{
    summary: string;
    variances: Array<{
      category: string;
      actual: number;
      budget: number;
      variance: number;
      variancePercent: number;
      significant: boolean;
      explanation?: string;
    }>;
    keyFindings: string[];
  }> {
    try {
      // Set default significance threshold if not provided
      const significanceThreshold = options?.significanceThreshold || 5; // 5% by default
      
      // Merge actual and budget data
      const mergedData = actualData.map(actualItem => {
        const budgetItem = budgetData.find(b => b.category === actualItem.category) || { budget: 0 };
        const actual = actualItem.actual;
        const budget = budgetItem.budget;
        const variance = actual - budget;
        const variancePercent = budget !== 0 ? (variance / budget) * 100 : 0;
        
        return {
          category: actualItem.category,
          actual,
          budget,
          variance,
          variancePercent,
          significant: Math.abs(variancePercent) >= significanceThreshold
        };
      });
      
      // Find categories in budget but not in actual
      budgetData.forEach(budgetItem => {
        if (!actualData.find(a => a.category === budgetItem.category)) {
          mergedData.push({
            category: budgetItem.category,
            actual: 0,
            budget: budgetItem.budget,
            variance: -budgetItem.budget,
            variancePercent: -100,
            significant: true
          });
        }
      });
      
      // Prepare the prompt for analysis
      let prompt = 'Please analyze this budget variance data:\n\n';
      
      // Add context if provided
      if (options?.context) {
        prompt += `Context: ${options.context}\n\n`;
      }
      
      // Add merged data for analysis
      prompt += `Variance Data:\n${JSON.stringify(mergedData, null, 2)}\n\n`;
      
      prompt += `Significance threshold: ${significanceThreshold}%\n\n`;
      
      prompt += `Please provide:
1. A summary of the overall variance analysis
2. Explanations for significant variances (${significanceThreshold}% or more)
3. Key findings and recommendations based on the analysis

Format your response with clear section headers.`;
      
      // Send for analysis
      const response = await this.sendMessage(prompt);
      
      // Parse the response
      const summaryMatch = response.match(/(?:Summary|SUMMARY):([^#]+)(?=#|$)/is);
      const findingsMatch = response.match(/(?:Key Findings|FINDINGS|Recommendations|RECOMMENDATIONS):([^#]+)(?=#|$)/is);
      
      const summary = summaryMatch 
        ? summaryMatch[1].trim() 
        : 'No summary provided.';
      
      const findingsText = findingsMatch ? findingsMatch[1].trim() : '';
      const keyFindings = findingsText
        .split(/\n+/)
        .map(line => line.replace(/^[\s-•*]+/, '').trim())
        .filter(line => line.length > 0);
      
      // Extract explanations for variances
      const variancesWithExplanations = mergedData.map(item => {
        if (item.significant) {
          const categoryRegex = new RegExp(`(?:${item.category}|${item.category.replace(/[^\w\s]/g, '.*?')})[^:]*?:[^\\n]*(\\n[^#]+?)(?=\\n\\s*\\w|$)`, 'is');
          const explanationMatch = response.match(categoryRegex);
          const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;
          
          return {
            ...item,
            explanation
          };
        }
        return item;
      });
      
      return {
        summary,
        variances: variancesWithExplanations,
        keyFindings: keyFindings.length > 0 ? keyFindings : ['No specific findings provided.']
      };
      
    } catch (error) {
      console.error('Error performing variance analysis:', error);
      return {
        summary: 'Error occurred during variance analysis.',
        variances: [],
        keyFindings: ['Analysis could not be completed due to an error.']
      };
    }
  }

  /**
   * Compute basic statistics on a dataset to assist with analysis
   */
  private computeBasicStatistics(data: any[]): Record<string, any> {
    if (!data || data.length === 0) {
      return {};
    }
    
    const stats: Record<string, any> = {
      recordCount: data.length
    };
    
    // Get a list of all fields in the dataset
    const sampleObject = data[0];
    const fields = Object.keys(sampleObject);
    
    // Process each field
    fields.forEach(field => {
      const values = data.map(item => item[field]).filter(val => val !== undefined && val !== null);
      
      // Skip empty fields
      if (values.length === 0) {
        return;
      }
      
      // Check if field contains numeric data
      const numericValues = values
        .map(val => {
          const parsed = typeof val === 'string' ? parseFloat(val) : val;
          return isNaN(parsed) ? null : parsed;
        })
        .filter(val => val !== null) as number[];
      
      if (numericValues.length > 0 && numericValues.length >= values.length * 0.5) {
        // Field is primarily numeric, calculate numeric stats
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const mean = sum / numericValues.length;
        const sortedValues = [...numericValues].sort((a, b) => a - b);
        const min = sortedValues[0];
        const max = sortedValues[sortedValues.length - 1];
        const median = sortedValues.length % 2 === 0
          ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
          : sortedValues[Math.floor(sortedValues.length / 2)];
        
        // Calculate standard deviation
        const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
        const stdDev = Math.sqrt(variance);
        
        stats[field] = {
          type: 'numeric',
          count: numericValues.length,
          min,
          max,
          mean,
          median,
          stdDev
        };
      } else {
        // Field is categorical, count frequencies
        const frequencies: Record<string, number> = {};
        
        values.forEach(val => {
          const strVal = String(val);
          frequencies[strVal] = (frequencies[strVal] || 0) + 1;
        });
        
        const uniqueCount = Object.keys(frequencies).length;
        
        // Find most common value
        let mostCommon = '';
        let maxFreq = 0;
        
        Object.entries(frequencies).forEach(([val, freq]) => {
          if (freq > maxFreq) {
            mostCommon = val;
            maxFreq = freq;
          }
        });
        
        stats[field] = {
          type: 'categorical',
          uniqueCount,
          mostCommon,
          mostCommonCount: maxFreq,
          frequencies: uniqueCount <= 10 ? frequencies : undefined // Only include frequencies if not too many categories
        };
      }
    });
    
    return stats;
  }

  /**
   * Find the most common value in an array
   */
  private findMostCommon(arr: any[]): any {
    const frequencies: Record<string, { value: any; count: number }> = {};
    
    arr.forEach(val => {
      const key = String(val);
      if (!frequencies[key]) {
        frequencies[key] = { value: val, count: 0 };
      }
      frequencies[key].count++;
    });
    
    let mostCommonValue: any = null;
    let maxCount = 0;
    
    Object.values(frequencies).forEach(item => {
      if (item.count > maxCount) {
        mostCommonValue = item.value;
        maxCount = item.count;
      }
    });
    
    return mostCommonValue;
  }
}