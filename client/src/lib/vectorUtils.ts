import { OpenAI } from 'openai';
import { supabase } from './supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

/**
 * Splits text into chunks that can be embedded
 */
export function chunkText(text: string, maxChunkSize: number = 4000): string[] {
  // If text is short enough, return it as a single chunk
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split text by paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed maxChunkSize
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
      // If current chunk is not empty, add it to chunks
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // If the paragraph itself is too large, split it by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let sentenceChunk = '';
        
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length + 1 > maxChunkSize) {
            chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          } else {
            sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
          }
        }
        
        if (sentenceChunk) {
          currentChunk = sentenceChunk;
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the final chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Creates embeddings for a text or array of texts
 */
export async function createEmbeddings(texts: string | string[]): Promise<number[][]> {
  try {
    // Make sure we have an array of texts
    const textArray = typeof texts === 'string' ? [texts] : texts;
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textArray,
    });
    
    // Extract the embeddings from the response
    return embeddingResponse.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw error;
  }
}

/**
 * Adds a document to the knowledge base
 */
export async function addToKnowledgeBase(
  content: string,
  category: string,
  metadata: Record<string, any> = {},
  source: string = 'user-upload'
): Promise<boolean> {
  try {
    // Split content into chunks
    const chunks = chunkText(content);
    
    // Create embeddings for all chunks
    const embeddings = await createEmbeddings(chunks);
    
    // Prepare records for inserting into Supabase
    const records = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      metadata,
      category,
      source
    }));
    
    // Insert records into the knowledge_base table
    const { error } = await supabase
      .from('knowledge_base')
      .insert(records);
    
    if (error) {
      console.error('Error adding to knowledge base:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to knowledge base:', error);
    return false;
  }
}

/**
 * Searches the knowledge base for similar content
 */
export async function searchKnowledgeBase(
  query: string,
  category?: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<any[]> {
  try {
    // Create embedding for the query
    const [queryEmbedding] = await createEmbeddings(query);
    
    // Prepare the RPC call to the match_documents function
    const matchCall = supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });
    
    // Add category filter if provided
    const { data, error } = category
      ? await matchCall.eq('category', category)
      : await matchCall;
    
    if (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return [];
  }
}

/**
 * Deletes documents from the knowledge base
 */
export async function deleteFromKnowledgeBase(
  ids: string | string[]
): Promise<boolean> {
  try {
    const idArray = typeof ids === 'string' ? [ids] : ids;
    
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .in('id', idArray);
    
    if (error) {
      console.error('Error deleting from knowledge base:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting from knowledge base:', error);
    return false;
  }
}

/**
 * Creates the match_documents function in Supabase if it doesn't exist
 * This is a one-time setup function
 */
export async function setupMatchDocumentsFunction(): Promise<void> {
  const createFunctionSQL = `
  CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
  )
  RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    category TEXT,
    source TEXT,
    similarity float
  )
  LANGUAGE plpgsql
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      knowledge_base.id,
      knowledge_base.content,
      knowledge_base.metadata,
      knowledge_base.category,
      knowledge_base.source,
      1 - (knowledge_base.embedding <=> query_embedding) AS similarity
    FROM knowledge_base
    WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
  END;
  $$;
  `;
  
  try {
    // Execute SQL to create the function
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (error) {
      // If error is "function already exists", we can ignore it
      if (!error.message.includes('already exists')) {
        console.error('Error creating match_documents function:', error);
      }
    }
  } catch (error) {
    console.error('Error setting up match_documents function:', error);
  }
}