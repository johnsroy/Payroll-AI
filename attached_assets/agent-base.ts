import { OpenAI } from 'openai';
import { supabase } from '../supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  constructor(config: AgentConfig) {
    this.model = config.model || 'gpt-4o';
    this.temperature = config.temperature ?? 0.2;
    this.maxTokens = config.maxTokens || 2000;
    this.systemPrompt = config.systemPrompt || 'You are a helpful assistant.';
    this.tools = config.tools || [];
    this.memory = config.memory ?? true;
    this.conversationId = config.conversationId;
    this.userId = config.userId;
    this.companyId = config.companyId;

    // Initialize messages with system prompt
    this.messages = [
      { role: 'system', content: this.systemPrompt }
    ];

    // If we have a conversation ID, we should load the conversation history
    if (this.memory && this.conversationId) {
      this.loadConversation(this.conversationId);
    }
  }

  // Load conversation history from the database
  protected async loadConversation(conversationId: string): Promise<void> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error loading conversation:', error);
      return;
    }

    if (data?.messages) {
      // Skip the system message we already added
      this.messages = [
        this.messages[0],
        ...data.messages
      ];
    }
  }

  // Save conversation to the database
  protected async saveConversation(): Promise<void> {
    if (!this.memory || !this.userId) return;

    // Create a new conversation if we don't have an ID
    if (!this.conversationId) {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: this.userId,
          company_id: this.companyId,
          agent_type: this.constructor.name,
          messages: this.messages.slice(1), // Don't store system prompt
          metadata: {
            model: this.model,
            temperature: this.temperature
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }

      this.conversationId = data.id;
    } else {
      // Update existing conversation
      const { error } = await supabase
        .from('ai_conversations')
        .update({
          messages: this.messages.slice(1), // Don't store system prompt
          updated_at: new Date().toISOString()
        })
        .eq('id', this.conversationId);

      if (error) {
        console.error('Error updating conversation:', error);
      }
    }
  }

  // Main method to interact with the agent
  async sendMessage(userMessage: string): Promise<string> {
    // Add user message to history
    this.messages.push({ role: 'user', content: userMessage });

    try {
      // Query vector store for relevant context if available
      const context = await this.getRelevantContext(userMessage);
      if (context) {
        this.messages.push({
          role: 'system',
          content: `Additional context that may be helpful for answering the query: ${context}`
        });
      }

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: this.messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        tools: this.tools.length > 0 ? this.tools : undefined,
      });

      const reply = response.choices[0].message;

      // Handle function calls if needed
      if (reply.tool_calls?.length) {
        const results = await this.handleToolCalls(reply.tool_calls);
        this.messages.push({
          role: 'function',
          name: 'function_results',
          content: JSON.stringify(results)
        });

        // Make a follow-up call to process the function results
        const followUpResponse = await openai.chat.completions.create({
          model: this.model,
          messages: this.messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        });

        const followUpReply = followUpResponse.choices[0].message;
        this.messages.push({
          role: 'assistant',
          content: followUpReply.content || ''
        });

        // Save conversation if memory is enabled
        if (this.memory) {
          await this.saveConversation();
        }

        return followUpReply.content || '';
      }

      // Add assistant response to messages
      this.messages.push({
        role: 'assistant',
        content: reply.content || ''
      });

      // Save conversation if memory is enabled
      if (this.memory) {
        await this.saveConversation();
      }

      return reply.content || '';
    } catch (error) {
      console.error('Error in agent:', error);
      return 'I encountered an error while processing your request. Please try again later.';
    }
  }

  // Get relevant context from vector store
  protected async getRelevantContext(query: string): Promise<string | null> {
    try {
      // Get embedding for the query
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Query Supabase for similar documents
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5
      });

      if (error) {
        console.error('Error querying vector store:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Concatenate relevant documents
      return data.map((doc: any) => doc.content).join('\n\n');
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return null;
    }
  }

  // Handle tool calls (function calling)
  protected async handleToolCalls(toolCalls: any[]): Promise<any> {
    const results: any = {};

    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function;
      
      // Find the tool with the matching name
      const tool = this.tools.find(t => t.function.name === name);
      
      if (tool && tool.handler) {
        try {
          const result = await tool.handler(JSON.parse(args));
          results[name] = result;
        } catch (error) {
          console.error(`Error executing tool ${name}:`, error);
          results[name] = { error: 'Tool execution failed' };
        }
      } else {
        results[name] = { error: 'Tool not found' };
      }
    }

    return results;
  }

  // Clear conversation history
  clearConversation(): void {
    this.messages = [{ role: 'system', content: this.systemPrompt }];
    this.conversationId = undefined;
  }
}
