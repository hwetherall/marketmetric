import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/app/lib/pdf';
import { analyzeMarketReport } from '@/app/lib/analyzer';
import { getFileFromStorage } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { filePath, fileName } = await request.json();

    if (!filePath || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let fileData: ArrayBuffer | null = null;

    // Check if this is a local file (fallback mode)
    if (filePath.startsWith('local/')) {
      console.log('Using fallback mode for file processing');
      // In fallback mode, we don't actually have the file data
      // So we'll use the mock data from the PDF extraction function
      fileData = new ArrayBuffer(0); // Empty buffer, the pdf function will handle it
    } else {
      // Normal mode: retrieve the file from Supabase storage
      fileData = await getFileFromStorage(filePath);
      
      if (!fileData) {
        return NextResponse.json({ error: 'Failed to retrieve file from storage' }, { status: 400 });
      }
    }
    
    // Extract text from PDF
    const textContent = await extractTextFromPDF(fileData, filePath.startsWith('local/'));
    
    if (!textContent || textContent.trim().length === 0) {
      return NextResponse.json({ error: 'No text content found in PDF' }, { status: 400 });
    }
    
    // Analyze the text content with the LLM
    const results = await analyzeMarketReport(textContent);
    
    // Return the analysis results
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('Error analyzing report:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Error analyzing report' }, { status: 500 });
  }
} 