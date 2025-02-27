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
    this.model = config.model || 'gpt-3.5-turbo';
    this.temperature = config.temperature === undefined ? 0.7 : config.temperature;
    this.maxTokens = config.maxTokens || 1024;
    this.systemPrompt = config.systemPrompt || 'You are a helpful assistant.';
    this.tools = config.tools || [];
    this.memory = config.memory !== false;
    this.conversationId = config.conversationId;
    this.userId = config.userId;
    this.companyId = config.companyId;
    
    // Add the system message to start the conversation
    this.messages.push({ role: 'system', content: this.systemPrompt });
    
    // Load conversation history if memory is enabled and we have a conversation ID
    if (this.memory && this.conversationId) {
      this.loadConversation(this.conversationId).catch(error => {
        console.error('Error loading conversation:', error);
      });
    }
  }

  protected async loadConversation(conversationId: string): Promise<void> {
    try {
      // Fetch conversation messages from database
      const { data, error } = await supabase
        .from('ai_messages')
        .select('role, content, function_call, name')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Keep the system message and add the conversation history
        const systemMessage = this.messages[0];
        
        this.messages = [systemMessage];
        
        // Add the conversation messages
        data.forEach(message => {
          this.messages.push({
            role: message.role as 'system' | 'user' | 'assistant' | 'function',
            content: message.content,
            name: message.name,
            function_call: message.function_call
          });
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }

  protected async saveConversation(): Promise<void> {
    if (!this.userId || !this.conversationId) {
      return; // Skip saving if we don't have a user or conversation ID
    }
    
    try {
      // Skip the system message when saving
      const messagesToSave = this.messages.slice(1);
      
      // We could save to the database here, but for simplicity in this demo,
      // we'll just log to the console
      console.log(`Saving ${messagesToSave.length} messages for conversation ${this.conversationId}`);
      
      // In a real implementation, we would save the messages to the database
      // For example:
      // await supabase.from('ai_messages').insert(
      //   messagesToSave.map(msg => ({
      //     conversation_id: this.conversationId,
      //     role: msg.role,
      //     content: msg.content,
      //     function_call: msg.function_call,
      //     name: msg.name,
      //   }))
      // );
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Add the user message to the conversation
    this.messages.push({ role: 'user', content: userMessage });
    
    try {
      // Get context if available
      const context = await this.getRelevantContext(userMessage);
      
      // Add context as a system message if available
      if (context) {
        this.messages.push({
          role: 'system',
          content: `Relevant context for the user's question: ${context}`
        });
      }
      
      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          tools: this.tools.length > 0 ? this.tools : undefined,
          tool_choice: this.tools.length > 0 ? "auto" : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const assistantResponse = data.choices[0].message;
      
      // Handle tool calls if present
      if (assistantResponse.tool_calls && assistantResponse.tool_calls.length > 0) {
        // Add assistant response with tool calls to messages
        this.messages.push({
          role: 'assistant',
          content: assistantResponse.content || '',
          function_call: assistantResponse.tool_calls[0]
        });
        
        // Execute tool calls
        const toolResults = await this.handleToolCalls(assistantResponse.tool_calls);
        
        // Add function results to messages
        toolResults.forEach(result => {
          this.messages.push(result);
        });
        
        // Call API again with tool results
        const followUpResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: this.messages,
            max_tokens: this.maxTokens,
            temperature: this.temperature
          })
        });
        
        if (!followUpResponse.ok) {
          throw new Error(`API request failed with status ${followUpResponse.status}`);
        }
        
        const followUpData = await followUpResponse.json();
        const finalResponse = followUpData.choices[0].message;
        
        // Add final assistant response to messages
        this.messages.push({
          role: 'assistant',
          content: finalResponse.content
        });
        
        if (this.memory) {
          await this.saveConversation();
        }
        
        return finalResponse.content;
      } else {
        // Add assistant response to messages
        this.messages.push({
          role: 'assistant',
          content: assistantResponse.content
        });
        
        if (this.memory) {
          await this.saveConversation();
        }
        
        return assistantResponse.content;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // If there's an error, add an error message to the conversation
      const errorMessage = 'I apologize, but I encountered an error processing your request. Please try again.';
      
      this.messages.push({
        role: 'assistant',
        content: errorMessage
      });
      
      return errorMessage;
    }
  }

  protected async getRelevantContext(query: string): Promise<string | null> {
    // This method could be implemented to fetch relevant context from a knowledge base
    // For now, we'll return null
    return null;
  }

  protected async handleToolCalls(toolCalls: any[]): Promise<Message[]> {
    // This method should be implemented by derived classes that use tools
    // For now, we'll return empty results
    return toolCalls.map(call => ({
      role: 'function',
      name: call.function.name,
      content: JSON.stringify({ result: 'Function call not implemented' })
    }));
  }

  clearConversation(): void {
    // Keep only the system message
    if (this.messages.length > 0 && this.messages[0].role === 'system') {
      this.messages = [this.messages[0]];
    } else {
      this.messages = [{ role: 'system', content: this.systemPrompt }];
    }
  }
}