import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/app/lib/pdf';
import { analyzeMarketReport } from '@/app/lib/analyzer';
import { getFileFromStorage } from '@/app/lib/supabase';

// Helper function to create consistent JSON responses
function createJsonResponse(data: any, status: number = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Disable caching to prevent stale responses
      'Cache-Control': 'no-store, max-age=0',
      // Prevent Next.js from returning HTML error pages
      'x-middleware-skip': '1'
    }
  });
}

export async function POST(request: NextRequest) {
  console.log('API: /api/analyze endpoint called');
  
  try {
    // Parse request JSON
    let requestData;
    try {
      requestData = await request.json();
      console.log('API: Request data parsed successfully');
    } catch (parseError) {
      console.error('API: Error parsing request JSON:', parseError);
      return createJsonResponse({ 
        error: 'Invalid request format, expected JSON', 
        details: parseError instanceof Error ? parseError.message : 'JSON parse error' 
      }, 400);
    }
    
    const { filePath, fileName } = requestData;

    if (!filePath || !fileName) {
      console.error('API: Missing required fields in request');
      return createJsonResponse({ 
        error: 'Missing required fields: filePath and fileName are required' 
      }, 400);
    }

    console.log(`API: Processing file: ${fileName}, path: ${filePath}`);
    let fileData: ArrayBuffer | null = null;

    // Check if this is a local file (fallback mode)
    if (filePath.startsWith('local/')) {
      console.log('API: Using fallback mode for file processing');
      // In fallback mode, we don't actually have the file data
      // So we'll use the mock data from the PDF extraction function
      fileData = new ArrayBuffer(0); // Empty buffer, the pdf function will handle it
    } else {
      try {
        // Normal mode: retrieve the file from Supabase storage
        console.log('API: Retrieving file from Supabase storage');
        fileData = await getFileFromStorage(filePath);
        
        if (!fileData) {
          console.error('API: Failed to retrieve file from storage');
          return createJsonResponse({ 
            error: 'Failed to retrieve file from storage' 
          }, 400);
        }
        
        console.log(`API: Retrieved file from storage, size: ${fileData.byteLength} bytes`);
      } catch (storageError) {
        console.error('API: Storage error:', storageError);
        return createJsonResponse({ 
          error: 'Failed to retrieve file from storage', 
          details: storageError instanceof Error ? storageError.message : 'Unknown storage error' 
        }, 400);
      }
    }
    
    // Extract text from PDF - wrapped in its own try/catch
    let textContent;
    try {
      console.log('API: Extracting text from PDF');
      textContent = await extractTextFromPDF(fileData, filePath.startsWith('local/'));
      
      if (!textContent || textContent.trim().length === 0) {
        console.error('API: No text content found in PDF');
        return createJsonResponse({ 
          error: 'No text content found in PDF' 
        }, 400);
      }
      
      console.log(`API: Successfully extracted ${textContent.length} characters of text`);
    } catch (pdfError) {
      console.error('API: PDF extraction error:', pdfError);
      if (pdfError instanceof Error) {
        console.error('API: Error name:', pdfError.name);
        console.error('API: Error message:', pdfError.message);
        console.error('API: Error stack:', pdfError.stack);
      }
      return createJsonResponse({ 
        error: 'Error extracting text from PDF', 
        details: pdfError instanceof Error ? pdfError.message : 'Unknown PDF processing error' 
      }, 500);
    }
    
    // Analyze text content - wrapped in its own try/catch
    let results;
    try {
      // Analyze the text content with the LLM
      console.log('API: Starting analysis with Groq LLM');
      results = await analyzeMarketReport(textContent);
      console.log('API: Analysis completed successfully');
    } catch (analysisError) {
      console.error('API: LLM analysis error:', analysisError);
      if (analysisError instanceof Error) {
        console.error('API: Error name:', analysisError.name);
        console.error('API: Error message:', analysisError.message);
        console.error('API: Error stack:', analysisError.stack);
      }
      
      return createJsonResponse({ 
        error: 'Error analyzing content with LLM', 
        details: analysisError instanceof Error ? analysisError.message : 'Unknown LLM analysis error' 
      }, 500);
    }
    
    // Return response
    try {
      console.log('API: Preparing successful response');
      const response = { results };
      // Debug what's being returned
      console.log('API: Response object:', JSON.stringify(response));
      return createJsonResponse(response);
    } catch (responseError) {
      console.error('API: Error creating JSON response:', responseError);
      return createJsonResponse({ 
        error: 'Error creating JSON response', 
        details: responseError instanceof Error ? responseError.message : 'Unknown response error' 
      }, 500);
    }
  } catch (error) {
    console.error('API: Unhandled error in analyze route:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('API: Error name:', error.name);
      console.error('API: Error message:', error.message);
      console.error('API: Error stack:', error.stack);
    }
    
    return createJsonResponse({ 
      error: 'Error analyzing report', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}