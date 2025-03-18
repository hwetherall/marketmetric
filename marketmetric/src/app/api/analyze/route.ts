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

    // Retrieve the file from Supabase storage
    const fileData = await getFileFromStorage(filePath);
    
    if (!fileData) {
      return NextResponse.json({ error: 'Failed to retrieve file from storage' }, { status: 400 });
    }
    
    // Extract text from PDF
    const textContent = await extractTextFromPDF(fileData);
    
    if (!textContent || textContent.trim().length === 0) {
      return NextResponse.json({ error: 'No text content found in PDF' }, { status: 400 });
    }
    
    // Analyze the text content with the LLM
    const results = await analyzeMarketReport(textContent);
    
    // Return the analysis results
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('Error analyzing report:', error);
    return NextResponse.json({ error: 'Error analyzing report' }, { status: 500 });
  }
} 