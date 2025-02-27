import { OpenAI } from 'openai';
import { supabase } from './supabase';

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: any[];
  memory?: boolean;
  conversationId?: string;
  userId?: string;
  companyId?: string;
}

export class BaseAgent {
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;
  protected systemPrompt: string;
  protected tools: any[];
  protected memory: boolean;
  protected messages: Message[] = [];
  protected conversationId?: string;
  protected userId?: string;
  protected companyId?: string;
  private apiKey: string = import.meta.env.VITE_OPENAI_API_KEY || '';

  constructor(config: AgentConfig) {
    this.model = config.model || 'gpt-4o';
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens || 2048;
    this.systemPrompt = config.systemPrompt || 'You are a helpful assistant.';
    this.tools = config.tools || [];
    this.memory = config.memory !== undefined ? config.memory : true;
    this.conversationId = config.conversationId;
    this.userId = config.userId;
    this.companyId = config.companyId;

    // Initialize conversation history with system message
    this.messages = [
      { role: 'system', content: this.systemPrompt }
    ];

    // If we have a conversation ID and memory is enabled, load the conversation
    if (this.conversationId && this.memory) {
      this.loadConversation(this.conversationId);
    }
  }

  protected async loadConversation(conversationId: string): Promise<void> {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error loading conversation:', error);
        return;
      }

      if (data?.messages && Array.isArray(data.messages)) {
        // Keep the system message and add the loaded conversation
        const systemMessage = this.messages[0];
        this.messages = [systemMessage, ...data.messages];
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }

  protected async saveConversation(): Promise<void> {
    if (!this.conversationId || !this.userId || !this.memory) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ 
          messages: this.messages.filter(msg => msg.role !== 'system'),
          updated_at: new Date().toISOString()
        })
        .eq('id', this.conversationId);

      if (error) {
        console.error('Error saving conversation:', error);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.apiKey) {
      return "API key not configured. Please add your OpenAI API key to use this feature.";
    }

    try {
      const openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // For client-side use
      });

      // Add user message to conversation
      this.messages.push({ role: 'user', content: userMessage });

      // Check if we need to add context from vector store
      const relevantContext = await this.getRelevantContext(userMessage);
      if (relevantContext) {
        // Insert the context right after the system message
        this.messages.splice(1, 0, { 
          role: 'system', 
          content: `Relevant information: ${relevantContext}`
        });
      }

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: this.messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        tools: this.tools.length > 0 ? this.tools.map(tool => tool.function) : undefined,
        tool_choice: this.tools.length > 0 ? 'auto' : undefined
      });

      const responseMessage = response.choices[0].message;
      
      // Process tool calls if any
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Add assistant message with tool calls to the conversation
        this.messages.push({
          role: responseMessage.role,
          content: responseMessage.content || '',
          tool_calls: responseMessage.tool_calls
        } as any);

        // Process each tool call
        const toolResults = await this.handleToolCalls(responseMessage.tool_calls);
        
        // Add tool results to the conversation
        for (const result of toolResults) {
          this.messages.push({
            role: 'tool',
            tool_call_id: result.tool_call_id,
            content: JSON.stringify(result.content)
          } as any);
        }

        // Call the API again to get the final answer
        const secondResponse = await openai.chat.completions.create({
          model: this.model,
          messages: this.messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens
        });

        const secondResponseMessage = secondResponse.choices[0].message;
        
        // Add the final assistant message to the conversation
        this.messages.push({
          role: secondResponseMessage.role,
          content: secondResponseMessage.content || ''
        });

        // Save the conversation if memory is enabled
        if (this.memory) {
          this.saveConversation();
        }

        return secondResponseMessage.content || '';
      } else {
        // No tool calls, just add the response to conversation
        this.messages.push({
          role: responseMessage.role,
          content: responseMessage.content || ''
        });

        // Save the conversation if memory is enabled
        if (this.memory) {
          this.saveConversation();
        }

        return responseMessage.content || '';
      }
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      
      // Check for specific error types and provide appropriate messages
      if (error.name === 'AuthenticationError') {
        return "Authentication error: Please check your API key.";
      } else if (error.message?.includes('rate limit')) {
        return "You've hit the rate limit. Please wait a moment and try again.";
      }
      
      return "I encountered an error while processing your request. Please try again later.";
    }
  }

  protected async getRelevantContext(query: string): Promise<string | null> {
    // In a real implementation, this would query a vector database
    // For now, we'll return null
    return null;
  }

  protected async handleToolCalls(toolCalls: any[]): Promise<any> {
    const results = [];

    for (const toolCall of toolCalls) {
      const toolFunction = this.tools.find(
        tool => tool.function.name === toolCall.function.name
      );

      if (toolFunction && toolFunction.handler) {
        try {
          // Parse arguments
          const args = JSON.parse(toolCall.function.arguments);
          
          // Call the handler
          const result = await toolFunction.handler(args);
          
          results.push({
            tool_call_id: toolCall.id,
            content: result
          });
        } catch (error) {
          console.error(`Error calling tool ${toolCall.function.name}:`, error);
          
          results.push({
            tool_call_id: toolCall.id,
            content: { error: `Failed to process tool call: ${error}` }
          });
        }
      } else {
        results.push({
          tool_call_id: toolCall.id,
          content: { error: `Tool ${toolCall.function.name} not found` }
        });
      }
    }

    return results;
  }

  clearConversation(): void {
    // Keep only the system message
    this.messages = [this.messages[0]];
  }
}