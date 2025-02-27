import { NextRequest, NextResponse } from 'next/server';
import { addToKnowledgeBase } from '@/lib/utils/vectorUtils';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import { unified } from 'unified';
import markdown from 'remark-parse';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';

/**
 * API endpoint for uploading documents to the knowledge base
 */
export async function POST(request: NextRequest) {
  try {
    // This needs to be a FormData request
    const formData = await request.formData();
    
    // Get file, category, and metadata from the form data
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const metadataStr = formData.get('metadata') as string;
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};
    
    // Validate that a file and category were provided
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }
    
    // Extract text from the file based on its type
    const fileBuffer = await file.arrayBuffer();
    const text = await extractTextFromFile(file.name, fileBuffer);
    
    if (!text) {
      return NextResponse.json(
        { error: 'Failed to extract text from file' },
        { status: 400 }
      );
    }
    
    // Add extracted text to knowledge base
    const success = await addToKnowledgeBase(
      text,
      category,
      {
        ...metadata,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size
      },
      'file-upload'
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add to knowledge base' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      filename: file.name,
      textLength: text.length
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

/**
 * Extracts text from a file based on its extension
 */
async function extractTextFromFile(filename: string, fileBuffer: ArrayBuffer): Promise<string | null> {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'txt':
      return new TextDecoder().decode(fileBuffer);
    
    case 'csv':
      return extractTextFromCSV(fileBuffer);
    
    case 'xlsx':
    case 'xls':
      return extractTextFromExcel(fileBuffer);
    
    case 'pdf':
      return extractTextFromPDF(fileBuffer);
    
    case 'md':
    case 'markdown':
      return extractTextFromMarkdown(fileBuffer);
    
    case 'json':
      return extractTextFromJSON(fileBuffer);
    
    default:
      // For unsupported file types
      return `Could not process file ${filename} with extension ${extension}. Supported formats are: txt, csv, xlsx, xls, pdf, md, markdown, and json.`;
  }
}

/**
 * Extracts text from CSV files
 */
function extractTextFromCSV(fileBuffer: ArrayBuffer): string {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(sheet);
    
    // Convert JSON to a formatted string
    return data.map(row => {
      return Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }).join('\n');
  } catch (error) {
    console.error('Error extracting text from CSV:', error);
    return null;
  }
}

/**
 * Extracts text from Excel files
 */
function extractTextFromExcel(fileBuffer: ArrayBuffer): string {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    
    // Extract text from all sheets
    return workbook.SheetNames.map(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      return `Sheet: ${sheetName}\n` + 
        data.map(row => {
          return Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        }).join('\n');
    }).join('\n\n');
  } catch (error) {
    console.error('Error extracting text from Excel:', error);
    return null;
  }
}

/**
 * Extracts text from PDF files
 */
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    // This is a simplified approach - for production use, you might
    // want to use a more robust PDF text extraction library
    const numPages = pdfDoc.getPageCount();
    let text = `PDF Document with ${numPages} pages.\n\n`;
    
    // In a real implementation, we would extract text from each page
    // For now, we're returning a placeholder
    text += 'PDF text extraction would be implemented with a more robust library in production.';
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null;
  }
}

/**
 * Extracts text from Markdown files
 */
function extractTextFromMarkdown(fileBuffer: ArrayBuffer): string {
  try {
    const markdownText = new TextDecoder().decode(fileBuffer);
    
    // Parse markdown to AST
    const ast = fromMarkdown(markdownText);
    
    // Convert AST to plain text
    return toString(ast);
  } catch (error) {
    console.error('Error extracting text from Markdown:', error);
    return null;
  }
}

/**
 * Extracts text from JSON files
 */
function extractTextFromJSON(fileBuffer: ArrayBuffer): string {
  try {
    const jsonText = new TextDecoder().decode(fileBuffer);
    const jsonData = JSON.parse(jsonText);
    
    // Convert JSON to a formatted string
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    console.error('Error extracting text from JSON:', error);
    return null;
  }
}
