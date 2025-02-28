import Anthropic from '@anthropic-ai/sdk';

// Note: the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
// Do not change this unless explicitly requested by the user

// Initialize Anthropic with API key from environment variables
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a message response from Claude
 */
export async function generateMessage(
  prompt: string,
  options: {
    model?: string,
    temperature?: number,
    maxTokens?: number,
    systemPrompt?: string
  } = {}
): Promise<string> {
  const {
    model = 'claude-3-7-sonnet-20250219',
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = 'You are Claude, a helpful AI assistant.'
  } = options;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error generating message:', error);
    throw new Error(`Failed to generate message: ${error.message}`);
  }
}

/**
 * Generate structured output from Claude
 */
export async function generateStructured<T>(
  prompt: string,
  options: {
    model?: string,
    temperature?: number,
    systemPrompt?: string,
    format?: string
  } = {}
): Promise<T> {
  const {
    model = 'claude-3-7-sonnet-20250219',
    temperature = 0.2,
    systemPrompt = 'You are Claude, a helpful AI assistant that responds with structured data.',
    format = 'json'
  } = options;

  const formatInstructions = format === 'json' 
    ? 'Respond with a valid JSON object only, no other text.' 
    : `Respond with data in ${format} format only, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4000,
      temperature,
      system: `${systemPrompt} ${formatInstructions}`,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const content = response.content[0].text;
    
    if (format === 'json') {
      return JSON.parse(content) as T;
    } else {
      return content as unknown as T;
    }
  } catch (error) {
    console.error('Error generating structured output:', error);
    throw new Error(`Failed to generate structured output: ${error.message}`);
  }
}

/**
 * Analyze an image with Claude
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string = 'Describe this image in detail.',
  options: {
    model?: string,
    maxTokens?: number
  } = {}
): Promise<string> {
  const {
    model = 'claude-3-7-sonnet-20250219',
    maxTokens = 1000
  } = options;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Generate a conversational response from Claude
 */
export async function generateConversationalResponse(
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  options: {
    model?: string,
    temperature?: number,
    maxTokens?: number,
    systemPrompt?: string
  } = {}
): Promise<string> {
  const {
    model = 'claude-3-7-sonnet-20250219',
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = 'You are Claude, a helpful AI assistant.'
  } = options;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error generating conversational response:', error);
    throw new Error(`Failed to generate conversational response: ${error.message}`);
  }
}