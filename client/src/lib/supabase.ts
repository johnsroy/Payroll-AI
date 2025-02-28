import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if a user is currently authenticated
 */
export async function isAuthenticated() {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Create user profile after successful signup
  if (data.user) {
    await createUserProfile(data.user.id, email);
  }
  
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Create a user profile in the profiles table
 */
async function createUserProfile(userId: string, email: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      created_at: new Date().toISOString(),
    });
  
  if (error) throw error;
}

/**
 * Create a company for a user
 */
export async function createCompany(userId: string, companyData: any) {
  const { data, error } = await supabase
    .from('companies')
    .insert({
      ...companyData,
      owner_id: userId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get all companies for a user
 */
export async function getUserCompanies(userId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', userId);
  
  if (error) throw error;
  return data;
}

/**
 * Get AI conversation history
 */
export async function getAIConversations(userId: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

/**
 * Save a new conversation message
 */
export async function saveConversationMessage(conversationId: string, message: any) {
  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      content: message.content,
      role: message.role,
      created_at: new Date().toISOString(),
      metadata: message.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Create a new conversation
 */
export async function createConversation(userId: string, companyId?: string) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      company_id: companyId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get a specific AI conversation
 */
export async function getAIConversation(conversationId: string) {
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  
  if (conversationError) throw conversationError;
  
  const { data: messages, error: messagesError } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (messagesError) throw messagesError;
  
  return {
    ...conversation,
    messages: messages || [],
  };
}

/**
 * Perform a similarity search in the vector database
 */
export async function performVectorSearch(query: string, collectionName: string, limit = 5) {
  // Convert query to embedding using OpenAI (this is just a placeholder,
  // real implementation would use actual embedding API)
  const { data: embeddings, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
    body: { text: query }
  });
  
  if (embeddingError) throw embeddingError;
  
  // Perform vector search using RPC call
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embeddings.embedding,
    match_threshold: 0.7,
    match_count: limit,
    collection_name: collectionName
  });
  
  if (error) throw error;
  return data;
}