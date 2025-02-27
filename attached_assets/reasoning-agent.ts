import { BaseAgent, AgentConfig, Message } from './baseAgent';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ReasoningStep {
  step: string;
  reasoning: string;
  conclusion: string;
}

export class ReasoningAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    // Define comprehensive system prompt for reasoning agent
    const reasoningSystemPrompt = `You are an analytical reasoning assistant specializing in complex payroll, tax, and financial calculations and analysis.

When approaching complex problems, use the following structured reasoning process:
1. Break down the problem into smaller, manageable components
2. Identify key variables and constraints for each component
3. Apply relevant formulas, regulations, or principles to each component
4. Work through calculations step-by-step, showing your work
5. Cross-validate results when possible
6. Draw conclusions based on your analysis

For financial and tax calculations:
- Be precise with numbers and calculations
- Round monetary values to two decimal places
- Cite specific tax rates or regulations when applicable
- Note when assumptions are being made
- Consider multiple scenarios when information is ambiguous

For regulatory and compliance analysis:
- Identify applicable laws or regulations
- Consider jurisdiction-specific requirements
- Note important deadlines or thresholds
- Highlight potential compliance risks

For complex scenarios:
- Use explicit chain-of-thought reasoning
- Consider alternative approaches
- Note trade-offs and limitations in your analysis
- Provide confidence levels for conclusions when appropriate

Always be transparent about your reasoning process, making it easy for users to follow your analysis step-by-step.`;

    // Initialize the agent with reasoning-specific configuration
    super({
      ...config,
      systemPrompt: reasoningSystemPrompt,
      temperature: 0.2, // Lower temperature for more deterministic, logical reasoning
      model: config.model || 'gpt-4o'
    });
  }

  /**
   * Perform step-by-step reasoning on a complex query
   */
  async performReasoning(query: string): Promise<{
    reasoning: ReasoningStep[];
    finalAnswer: string;
  }> {
    try {
      // Format the query for reasoning
      const formattedQuery = `Please analyze this question step-by-step: ${query}`;
      
      // Use Chain of Thought prompting for structured reasoning
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: formattedQuery }
        ],
        temperature: this.temperature,
        max_tokens: 2500
      });

      const reasoningText = response.choices[0].message.content || '';
      
      // Add the reasoning to the conversation history
      this.messages.push(
        { role: 'user', content: formattedQuery },
        { role: 'assistant', content: reasoningText }
      );
      
      // Now extract a clear, concise final answer
      const finalAnswerResponse = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a summarization assistant. Based on the detailed reasoning provided, create a clear, concise summary of the key conclusions and answer to the original question. Focus only on the final results, not the reasoning process.' },
          { role: 'user', content: `Original question: ${query}\n\nDetailed reasoning: ${reasoningText}\n\nPlease provide a concise final answer:` }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const finalAnswer = finalAnswerResponse.choices[0].message.content || '';
      
      // Parse the reasoning steps
      const reasoningSteps = this.parseReasoningSteps(reasoningText);
      
      // Save the conversation if memory is enabled
      if (this.memory) {
        await this.saveConversation();
      }
      
      return {
        reasoning: reasoningSteps,
        finalAnswer
      };
    } catch (error) {
      console.error('Error in reasoning process:', error);
      return {
        reasoning: [{
          step: 'Error',
          reasoning: 'An error occurred during the reasoning process.',
          conclusion: 'Unable to complete the analysis.'
        }],
        finalAnswer: 'I encountered an error while processing your request. Please try again with a more specific question.'
      };
    }
  }

  /**
   * Parse the reasoning text into structured steps
   */
  private parseReasoningSteps(text: string): ReasoningStep[] {
    // Split by numbered steps or section headers
    const stepRegex = /(?:Step|STEP|^\d+)[:\.\)\-]|(?:^|\n)#+\s+[\w\s]+(?:\n|$)/gm;
    const sections = text.split(stepRegex).filter(Boolean).map(s => s.trim());
    const headers = text.match(stepRegex) || [];
    
    // Pair headers with their content
    return sections.map((content, index) => {
      const header = headers[index] || `Step ${index + 1}`;
      const headerClean = header.replace(/^#+\s+/, '').trim();
      
      // Try to identify a conclusion in the section
      const conclusionMatch = content.match(/(?:(?:Therefore|Thus|In conclusion|To summarize|Hence|So),?\s+.+)$/i);
      const conclusion = conclusionMatch 
        ? conclusionMatch[0].trim() 
        : content.split('\n').filter(Boolean).pop() || 'No specific conclusion';
      
      return {
        step: headerClean,
        reasoning: content,
        conclusion
      };
    });
  }

  /**
   * Perform numerical calculations with explanation
   */
  async calculateWithExplanation(
    calculation: string, 
    context?: string
  ): Promise<{
    result: number | null;
    explanation: string;
    steps: string[];
  }> {
    try {
      // Format the calculation request
      const prompt = context 
        ? `Context: ${context}\n\nCalculation: ${calculation}`
        : `Please calculate: ${calculation}`;
      
      // Request detailed calculation steps
      const response = await this.sendMessage(
        `Perform this calculation step-by-step, showing your work clearly: ${prompt}. At the end, provide only the final numerical result as a separate line starting with "RESULT:"` 
      );
      
      // Extract result
      const resultMatch = response.match(/RESULT:\s*([\d\.\,\-]+)/i);
      let result = null;
      
      if (resultMatch && resultMatch[1]) {
        // Clean up the result and convert to number
        const cleanResult = resultMatch[1].replace(/,/g, '');
        result = parseFloat(cleanResult);
      }
      
      // Extract calculation steps
      const steps = response
        .split('\n')
        .filter(line => line.trim().length > 0 && !line.includes('RESULT:'));
      
      return {
        result,
        explanation: response,
        steps
      };
    } catch (error) {
      console.error('Error in calculation:', error);
      return {
        result: null,
        explanation: 'An error occurred while performing the calculation.',
        steps: ['Error: calculation could not be completed']
      };
    }
  }

  /**
   * Analyze potential scenarios with probabilities
   */
  async analyzeScenarios(
    situation: string,
    options: string[]
  ): Promise<{
    scenarios: Array<{
      option: string;
      probability: number;
      reasoning: string;
      outcome: string;
    }>;
    recommendation: string;
  }> {
    try {
      // Format the scenario analysis request
      const optionsText = options.map((opt, i) => `Option ${i+1}: ${opt}`).join('\n');
      const prompt = `Situation: ${situation}\n\nOptions to consider:\n${optionsText}\n\nPlease analyze each option, assigning a probability of success (0-100%), providing reasoning, and describing likely outcomes. Then make a recommendation.`;
      
      // Send the request
      const response = await this.sendMessage(prompt);
      
      // Parse the response (this is simplified - in a real system, 
      // you would use more robust parsing or structured output from the LLM)
      const scenarios = options.map((option, i) => {
        const optionHeader = `Option ${i+1}:`;
        const optionStart = response.indexOf(optionHeader);
        const nextOptionStart = i < options.length - 1 
          ? response.indexOf(`Option ${i+2}:`)
          : response.indexOf('Recommendation:');
        
        const optionText = optionStart >= 0 && nextOptionStart >= 0
          ? response.substring(optionStart, nextOptionStart)
          : '';
        
        // Extract probability
        const probMatch = optionText.match(/(?:probability|likelihood|chance)(?:\s+of\s+success)?:\s*(\d+)%/i);
        const probability = probMatch ? parseInt(probMatch[1], 10) : 0;
        
        // Extract reasoning and outcome (simplified)
        const parts = optionText.split('\n').filter(p => p.trim().length > 0);
        const reasoning = parts.length > 1 ? parts.slice(1).join('\n') : 'No detailed reasoning provided';
        const outcomeMatch = optionText.match(/(?:outcome|result|consequence):\s*(.+)(?:\n|$)/i);
        const outcome = outcomeMatch ? outcomeMatch[1].trim() : 'No specific outcome described';
        
        return {
          option,
          probability,
          reasoning,
          outcome
        };
      });
      
      // Extract recommendation
      const recIndex = response.indexOf('Recommendation:');
      const recommendation = recIndex >= 0
        ? response.substring(recIndex).replace('Recommendation:', '').trim()
        : 'No specific recommendation provided';
      
      return {
        scenarios,
        recommendation
      };
    } catch (error) {
      console.error('Error in scenario analysis:', error);
      return {
        scenarios: options.map(opt => ({
          option: opt,
          probability: 0,
          reasoning: 'Analysis could not be completed',
          outcome: 'Unknown'
        })),
        recommendation: 'Unable to provide a recommendation due to an error in the analysis.'
      };
    }
  }
}
