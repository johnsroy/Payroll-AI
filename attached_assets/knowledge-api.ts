import { NextRequest, NextResponse } from 'next/server';
import { addToKnowledgeBase, searchKnowledgeBase, deleteFromKnowledgeBase } from '@/lib/utils/vectorUtils';

/**
 * API endpoint for adding to the knowledge base
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Extract content, category, metadata, and source from the request
    const { content, category, metadata, source } = body;
    
    // Validate that content and category were provided
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Valid content is required' },
        { status: 400 }
      );
    }
    
    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Valid category is required' },
        { status: 400 }
      );
    }
    
    // Add to knowledge base
    const success = await addToKnowledgeBase(
      content,
      category,
      metadata || {},
      source || 'api'
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add to knowledge base' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to knowledge base:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint for searching the knowledge base
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const threshold = parseFloat(searchParams.get('threshold') || '0.7');
    
    // Validate that a query was provided
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }
    
    // Search knowledge base
    const results = await searchKnowledgeBase(query, category, limit, threshold);
    
    // Return results
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint for deleting from the knowledge base
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Extract IDs from the request
    const { ids } = body;
    
    // Validate that IDs were provided
    if (!ids || (!Array.isArray(ids) && typeof ids !== 'string')) {
      return NextResponse.json(
        { error: 'Valid ID(s) required' },
        { status: 400 }
      );
    }
    
    // Delete from knowledge base
    const success = await deleteFromKnowledgeBase(ids);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete from knowledge base' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from knowledge base:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
