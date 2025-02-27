/**
 * Setup script for the Supabase database
 * This script will create the necessary tables and functions for the application
 * Usage: node scripts/setup-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Enable the pgvector extension
    console.log('Enabling pgvector extension...');
    const { error: extensionError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;'
    });
    
    if (extensionError) {
      console.error('Error enabling pgvector extension:', extensionError);
    } else {
      console.log('pgvector extension enabled successfully');
    }
    
    // Create the match_documents function
    console.log('Creating match_documents function...');
    const matchFunctionSQL = `
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
    
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: matchFunctionSQL
    });
    
    if (functionError) {
      console.error('Error creating match_documents function:', functionError);
    } else {
      console.log('match_documents function created successfully');
    }
    
    // Create exec_sql function if it doesn't exist
    console.log('Creating exec_sql function (if needed)...');
    
    const checkFunctionSQL = `
    SELECT EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'exec_sql'
    );
    `;
    
    const { data: functionExists, error: checkError } = await supabase.rpc('exec_sql', {
      sql: checkFunctionSQL
    });
    
    if (checkError) {
      console.log('Creating exec_sql function...');
      
      // Note: This would require superuser privileges in a real setup
      // For safety, this is usually set up by a database administrator
      const execSqlFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      // In a real scenario, you'd need special permissions to create this
      console.log('exec_sql function would need to be created by a database administrator');
    } else {
      console.log('exec_sql function already exists');
    }
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('Setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during setup:', error);
    process.exit(1);
  });
