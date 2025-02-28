import { supabase } from './supabase';
import { openai } from './openai'; // We'll create this file next

/**
 * Splits text into chunks that can be embedded
 */
export function chunkText(text: string, maxChunkSize: number = 4000): string[] {
  if (!text) return [];
  
  // Simple paragraph-based chunking
  const paragraphs = text.split('\n\n');
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If a single paragraph is too large, we need to split it further
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split('. ');
        currentChunk = '';
        
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length + 2 <= maxChunkSize) {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk + '.');
            }
            currentChunk = sentence;
          }
        }
      } else {
        currentChunk = paragraph;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Creates embeddings for a text or array of texts
 */
export async function createEmbeddings(texts: string | string[]): Promise<number[][]> {
  const textArray = Array.isArray(texts) ? texts : [texts];
  const embeddings: number[][] = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < textArray.length; i += batchSize) {
    const batch = textArray.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });
    
    // Extract embeddings from response
    for (const embedding of response.data) {
      embeddings.push(embedding.embedding);
    }
  }
  
  return embeddings;
}

/**
 * Adds a document to the knowledge base
 */
export async function addToKnowledgeBase(
  content: string,
  metadata: any = {},
  collectionName: string = 'default',
  userId?: string,
  companyId?: string
): Promise<void> {
  // Split content into chunks
  const chunks = chunkText(content);
  
  // Generate embeddings for chunks
  const embeddings = await createEmbeddings(chunks);
  
  // Insert chunks and embeddings
  for (let i = 0; i < chunks.length; i++) {
    const { error } = await supabase.from('knowledge_base').insert({
      content: chunks[i],
      embedding: embeddings[i],
      metadata: {
        ...metadata,
        chunk_index: i,
        total_chunks: chunks.length,
      },
      collection_name: collectionName,
      user_id: userId,
      company_id: companyId,
      created_at: new Date().toISOString(),
    });
    
    if (error) {
      throw new Error(`Error adding to knowledge base: ${error.message}`);
    }
  }
}

/**
 * Searches the knowledge base for similar content
 */
export async function searchKnowledgeBase(
  query: string,
  collectionName: string = 'default',
  limit: number = 5,
  userId?: string,
  companyId?: string
): Promise<any[]> {
  // Generate embedding for query
  const embeddings = await createEmbeddings(query);
  
  // Call match_documents RPC function
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embeddings[0],
    match_threshold: 0.7,
    match_count: limit,
    collection_name: collectionName,
    user_id: userId,
    company_id: companyId
  });
  
  if (error) {
    throw new Error(`Error searching knowledge base: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Deletes documents from the knowledge base
 */
export async function deleteFromKnowledgeBase(
  documentIds: string[] | string,
  userId?: string
): Promise<void> {
  const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
  
  // Only allow deletion if user is authorized
  const query = supabase.from('knowledge_base').delete().in('id', ids);
  
  if (userId) {
    query.eq('user_id', userId);
  }
  
  const { error } = await query;
  
  if (error) {
    throw new Error(`Error deleting from knowledge base: ${error.message}`);
  }
}

/**
 * Creates the match_documents function in Supabase if it doesn't exist
 * This is a one-time setup function
 */
export async function setupMatchDocumentsFunction(): Promise<void> {
  // This SQL would need to be executed by an admin
  const sql = `
    CREATE OR REPLACE FUNCTION match_documents(
      query_embedding vector(1536),
      match_threshold float,
      match_count int,
      collection_name text DEFAULT 'default',
      user_id uuid DEFAULT NULL,
      company_id uuid DEFAULT NULL
    )
    RETURNS TABLE (
      id uuid,
      content text,
      metadata jsonb,
      collection_name text,
      similarity float
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        kb.id,
        kb.content,
        kb.metadata,
        kb.collection_name,
        1 - (kb.embedding <=> query_embedding) as similarity
      FROM knowledge_base kb
      WHERE 
        kb.collection_name = match_documents.collection_name
        AND (kb.user_id = match_documents.user_id OR match_documents.user_id IS NULL)
        AND (kb.company_id = match_documents.company_id OR match_documents.company_id IS NULL)
        AND 1 - (kb.embedding <=> query_embedding) > match_threshold
      ORDER BY similarity DESC
      LIMIT match_count;
    END;
    $$;
  `;
  
  // This would need to be run through a Supabase function or admin API
  console.log('SQL for match_documents function:', sql);
}