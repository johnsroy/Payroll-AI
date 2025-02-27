import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if a user is currently authenticated
 */
export async function isAuthenticated() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!session;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    // If sign up successful, create a profile record
    if (data.user) {
      await createUserProfile(data.user.id, email);
    }
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Create a user profile in the profiles table
 */
async function createUserProfile(userId: string, email: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Don't throw here, as the auth signup was already successful
  }
}

/**
 * Create a company for a user
 */
export async function createCompany(userId: string, companyData: any) {
  try {
    // Insert company record
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        owner_id: userId,
        name: companyData.name,
        industry: companyData.industry,
        size: companyData.size,
        state: companyData.state,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (companyError) throw companyError;
    
    // Link user to company with admin role
    if (company) {
      const { error: linkError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: userId,
          role: 'admin',
          created_at: new Date().toISOString(),
        });
      
      if (linkError) throw linkError;
    }
    
    return company;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}

/**
 * Get all companies for a user
 */
export async function getUserCompanies(userId: string) {
  try {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        company_id,
        role,
        companies:company_id (
          id,
          name,
          industry,
          size,
          state
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data.map((item) => ({
      id: item.company_id,
      role: item.role,
      ...item.companies,
    }));
  } catch (error) {
    console.error('Error getting user companies:', error);
    throw error;
  }
}

/**
 * Get AI conversation history
 */
export async function getAIConversations(userId: string, limit = 10, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting AI conversations:', error);
    throw error;
  }
}

/**
 * Get a specific AI conversation
 */
export async function getAIConversation(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting AI conversation:', error);
    throw error;
  }
}

/**
 * Perform a similarity search in the vector database
 */
export async function performVectorSearch(query: string, collectionName: string, limit = 5) {
  try {
    // In a real implementation, you would use pgvector's cosine_distance function
    // For now, we'll return mock data
    return [
      {
        id: '1',
        content: 'Sample content that matches your query',
        metadata: { source: 'document1.pdf', page: 5 }
      },
      {
        id: '2',
        content: 'Another piece of content related to your search',
        metadata: { source: 'document2.pdf', page: 12 }
      }
    ];
  } catch (error) {
    console.error('Error performing vector search:', error);
    return [];
  }
}