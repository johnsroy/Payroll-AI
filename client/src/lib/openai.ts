import OpenAI from "openai";

// Note: the newest OpenAI model is "gpt-4o" which was released May 13, 2024
// Do not change this unless explicitly requested by the user

// Initialize OpenAI with API key from environment variables
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side use in development
});

/**
 * Generate a completion from the OpenAI API
 */
export async function generateCompletion(
  prompt: string,
  options: {
    model?: string,
    temperature?: number,
    maxTokens?: number,
    systemPrompt?: string
  } = {}
): Promise<string> {
  const {
    model = "gpt-4o",
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = "You are a helpful assistant."
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating completion:", error);
    throw new Error(`Failed to generate completion: ${error.message}`);
  }
}

/**
 * Analyze an image and generate a description
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string = "Describe this image in detail.",
  options: {
    model?: string,
    maxTokens?: number
  } = {}
): Promise<string> {
  const {
    model = "gpt-4o",
    maxTokens = 1000
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ],
        },
      ],
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Generate JSON output from OpenAI
 */
export async function generateJSON<T>(
  prompt: string,
  options: {
    model?: string,
    temperature?: number,
    systemPrompt?: string
  } = {}
): Promise<T> {
  const {
    model = "gpt-4o",
    temperature = 0.2,
    systemPrompt = "You are a helpful assistant that responds with JSON."
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("Error generating JSON:", error);
    throw new Error(`Failed to generate JSON: ${error.message}`);
  }
}

/**
 * Analyze sentiment of a text
 */
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral',
  score: number,
  confidence: number
}> {
  try {
    const result = await generateJSON<{
      sentiment: 'positive' | 'negative' | 'neutral',
      score: number,
      confidence: number
    }>(
      `Analyze the sentiment of the following text and return a JSON with sentiment (positive, negative, or neutral), a score from -1 to 1, and a confidence level from 0 to 1: "${text}"`,
      {
        temperature: 0.1,
        systemPrompt: "You are a sentiment analysis expert. Return only valid JSON with the requested fields."
      }
    );
    
    return result;
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw new Error(`Failed to analyze sentiment: ${error.message}`);
  }
}