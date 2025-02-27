import { BaseAgent, AgentConfig } from './baseAgent';

interface ReasoningStep {
  step: string;
  reasoning: string;
  conclusion: string;
}

export class ReasoningAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    // Define specialized system prompt for reasoning agent
    const reasoningSystemPrompt = `You are a payroll reasoning assistant specialized in complex analytical thinking. Your primary functions are:

1. Perform step-by-step reasoning on complex payroll queries
2. Break down complicated tax scenarios into logical components
3. Explain multi-step calculations and regulatory decisions
4. Analyze potential scenarios with probabilities and outcomes

When performing reasoning:
- Use clear, structured steps that show your thought process
- Consider multiple perspectives and approaches
- Identify assumptions and limitations in your reasoning
- Explain implications of different decisions
- Present conclusions with appropriate confidence levels

Always provide explanations that are both technically accurate for payroll professionals and understandable to business owners with less technical knowledge.`;

    // Initialize the agent with reasoning-specific configuration
    super({
      ...config,
      systemPrompt: reasoningSystemPrompt,
      temperature: 0.3, // Balanced temperature for reasoning
    });
    
    // Define reasoning tools
    this.tools = [
      {
        type: "function",
        function: {
          name: "perform_step_by_step_reasoning",
          description: "Perform detailed step-by-step reasoning on a complex query",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The complex question or scenario to analyze"
              },
              context: {
                type: "string",
                description: "Additional context for the reasoning (optional)"
              },
              max_steps: {
                type: "number",
                description: "Maximum number of reasoning steps to perform (optional)"
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "calculate_with_explanation",
          description: "Perform a calculation with detailed explanation of each step",
          parameters: {
            type: "object",
            properties: {
              calculation_type: {
                type: "string",
                description: "Type of calculation to perform",
                enum: ["payroll_tax", "benefit_cost", "retirement", "overtime", "bonus", "other"]
              },
              values: {
                type: "object",
                description: "Values to use in the calculation"
              },
              show_formulas: {
                type: "boolean",
                description: "Whether to show the formulas used"
              }
            },
            required: ["calculation_type", "values"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_scenarios",
          description: "Analyze different scenarios with probabilities and outcomes",
          parameters: {
            type: "object",
            properties: {
              scenario_description: {
                type: "string",
                description: "Description of the main scenario to analyze"
              },
              factors: {
                type: "array",
                description: "Factors that affect the scenario outcomes",
                items: {
                  type: "object"
                }
              },
              number_of_scenarios: {
                type: "number",
                description: "Number of scenarios to generate and analyze"
              }
            },
            required: ["scenario_description"]
          }
        }
      }
    ];
  }

  /**
   * Perform step-by-step reasoning on a complex query
   */
  async performReasoning(query: string, context: string = '', maxSteps: number = 5): Promise<{
    steps: ReasoningStep[],
    final_conclusion: string
  }> {
    // Construct the reasoning prompt
    const reasoningPrompt = `
I need to reason through the following question or scenario:
${query}

${context ? `Additional context: ${context}\n` : ''}

Perform a step-by-step analysis with up to ${maxSteps} steps. For each step:
1. Clearly state what you're analyzing
2. Show your reasoning process
3. Provide a conclusion for that step

After all steps, provide a final conclusion that synthesizes your analysis.
Format each step as:
STEP [number]: [step description]
REASONING: [detailed reasoning process]
CONCLUSION: [step conclusion]

End with:
FINAL CONCLUSION: [overall conclusion based on all steps]
`;

    // Send the reasoning prompt to the model
    const response = await this.sendMessage(reasoningPrompt);
    
    // Parse the reasoning steps from the response
    const steps = this.parseReasoningSteps(response);
    
    // Extract the final conclusion
    const finalConclusion = response.match(/FINAL CONCLUSION:\s*(.*?)(?:\n|$)/s)?.[1] || 
      "No clear final conclusion could be extracted.";
    
    return {
      steps,
      final_conclusion: finalConclusion
    };
  }

  /**
   * Parse the reasoning text into structured steps
   */
  private parseReasoningSteps(text: string): ReasoningStep[] {
    const stepRegex = /STEP\s+\d+:\s*(.*?)\s*REASONING:\s*(.*?)\s*CONCLUSION:\s*(.*?)(?=STEP\s+\d+:|FINAL CONCLUSION:|$)/gs;
    const steps: ReasoningStep[] = [];
    
    let match;
    while ((match = stepRegex.exec(text)) !== null) {
      steps.push({
        step: match[1].trim(),
        reasoning: match[2].trim(),
        conclusion: match[3].trim()
      });
    }
    
    return steps;
  }

  /**
   * Perform numerical calculations with explanation
   */
  async calculateWithExplanation(
    calculationType: string,
    values: Record<string, any>,
    showFormulas: boolean = true
  ): Promise<{
    result: number,
    explanation: string,
    steps: string[],
    formulas?: Record<string, string>
  }> {
    // Construct the calculation prompt
    const calculationPrompt = `
I need to perform a ${calculationType} calculation with the following values:
${JSON.stringify(values, null, 2)}

Please provide:
1. A step-by-step explanation of the calculation process
2. The intermediate values at each step
3. The final result with appropriate precision
${showFormulas ? '4. The formulas used for each calculation step' : ''}

Format your response as:
STEPS:
- Step 1: [explanation]
- Step 2: [explanation]
...

RESULT: [final numerical result]

${showFormulas ? 'FORMULAS:\n- [formula name]: [formula]\n...' : ''}

EXPLANATION: [overall explanation of the calculation]
`;

    // Send the calculation prompt to the model
    const response = await this.sendMessage(calculationPrompt);
    
    // Parse the result
    const resultMatch = response.match(/RESULT:\s*([\d.,]+)/);
    const result = resultMatch ? parseFloat(resultMatch[1].replace(/,/g, '')) : 0;
    
    // Parse the steps
    const stepsMatch = response.match(/STEPS:\s*([\s\S]*?)(?=RESULT:|$)/);
    const stepsText = stepsMatch ? stepsMatch[1] : '';
    const steps = stepsText
      .split(/\n\s*-\s*/)
      .filter(step => step.trim().length > 0)
      .map(step => step.trim());
    
    // Parse the formulas if requested
    let formulas: Record<string, string> | undefined = undefined;
    if (showFormulas) {
      const formulasMatch = response.match(/FORMULAS:\s*([\s\S]*?)(?=EXPLANATION:|$)/);
      const formulasText = formulasMatch ? formulasMatch[1] : '';
      formulas = {};
      
      const formulaLines = formulasText.split('\n').filter(line => line.trim().startsWith('-'));
      for (const line of formulaLines) {
        const parts = line.replace(/^\s*-\s*/, '').split(':');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const formula = parts.slice(1).join(':').trim();
          formulas[name] = formula;
        }
      }
    }
    
    // Parse the explanation
    const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)$/);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';
    
    return {
      result,
      explanation,
      steps,
      formulas
    };
  }

  /**
   * Analyze potential scenarios with probabilities
   */
  async analyzeScenarios(
    scenarioDescription: string,
    factors: Record<string, any>[] = [],
    numberOfScenarios: number = 3
  ): Promise<{
    scenarios: Array<{
      description: string,
      probability: number,
      impact: string,
      outcomes: Record<string, any>
    }>,
    recommendations: string[]
  }> {
    // Construct the scenario analysis prompt
    const factorsText = factors.length > 0 
      ? `with the following factors affecting outcomes:\n${JSON.stringify(factors, null, 2)}\n`
      : '';
    
    const scenarioPrompt = `
I need to analyze the following scenario: ${scenarioDescription}
${factorsText}
Please generate and analyze ${numberOfScenarios} possible scenarios with different outcomes.

For each scenario:
1. Provide a brief description
2. Estimate a probability of occurrence (as a percentage)
3. Assess the potential impact (low, medium, high)
4. Describe specific outcomes and implications
5. Suggest possible responses or preparations

After analyzing all scenarios, provide recommendations based on the overall analysis.

Format your response as:
SCENARIO 1:
- Description: [scenario description]
- Probability: [percentage]
- Impact: [low/medium/high]
- Outcomes: [specific outcomes and implications]
- Response: [suggested response or preparation]

... [repeat for each scenario]

RECOMMENDATIONS:
- [recommendation 1]
- [recommendation 2]
...
`;

    // Send the scenario analysis prompt to the model
    const response = await this.sendMessage(scenarioPrompt);
    
    // Parse the scenarios
    const scenarios: Array<{
      description: string,
      probability: number,
      impact: string,
      outcomes: Record<string, any>
    }> = [];
    
    // Regular expression to extract scenarios
    const scenarioRegex = /SCENARIO\s+\d+:\s*[\s\S]*?Description:\s*(.*?)[\s\S]*?Probability:\s*(\d+(?:\.\d+)?)%?[\s\S]*?Impact:\s*(low|medium|high)[\s\S]*?Outcomes:\s*([\s\S]*?)(?:Response:|(?=SCENARIO|RECOMMENDATIONS|$))/gi;
    
    let match;
    while ((match = scenarioRegex.exec(response)) !== null) {
      const description = match[1].trim();
      const probability = parseFloat(match[2]) / 100; // Convert percentage to decimal
      const impact = match[3].trim().toLowerCase();
      const outcomesText = match[4].trim();
      
      // Parse outcomes into a structured format
      const outcomes: Record<string, any> = {};
      const outcomeLines = outcomesText.split('\n');
      let currentKey = 'general';
      
      for (const line of outcomeLines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Check if line is a key-value pair
        const keyValueMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/);
        if (keyValueMatch) {
          currentKey = keyValueMatch[1].trim().toLowerCase();
          outcomes[currentKey] = keyValueMatch[2].trim();
        } else if (trimmedLine.startsWith('-')) {
          // If it's a list item, add to current key as array
          if (!outcomes[currentKey]) {
            outcomes[currentKey] = [];
          }
          if (!Array.isArray(outcomes[currentKey])) {
            outcomes[currentKey] = [outcomes[currentKey]];
          }
          outcomes[currentKey].push(trimmedLine.substring(1).trim());
        } else {
          // Otherwise, add as string or append
          if (!outcomes[currentKey]) {
            outcomes[currentKey] = trimmedLine;
          } else if (typeof outcomes[currentKey] === 'string') {
            outcomes[currentKey] += ' ' + trimmedLine;
          }
        }
      }
      
      scenarios.push({
        description,
        probability,
        impact,
        outcomes
      });
    }
    
    // Parse recommendations
    const recommendationsMatch = response.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/);
    const recommendationsText = recommendationsMatch ? recommendationsMatch[1] : '';
    const recommendations = recommendationsText
      .split(/\n\s*-\s*/)
      .filter(rec => rec.trim().length > 0)
      .map(rec => rec.trim());
    
    return {
      scenarios,
      recommendations
    };
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
        case 'perform_step_by_step_reasoning':
          functionResult = await this.performReasoning(
            args.query, 
            args.context || '', 
            args.max_steps || 5
          );
          break;
        case 'calculate_with_explanation':
          functionResult = await this.calculateWithExplanation(
            args.calculation_type,
            args.values,
            args.show_formulas !== undefined ? args.show_formulas : true
          );
          break;
        case 'analyze_scenarios':
          functionResult = await this.analyzeScenarios(
            args.scenario_description,
            args.factors || [],
            args.number_of_scenarios || 3
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