import { NextRequest, NextResponse } from 'next/server';
import groq from '@/app/lib/groq';
import supabase from '@/app/lib/supabase';
import { parse } from 'pdf-parse';

// Questions to analyze the market report
const ANALYSIS_QUESTIONS = [
  'Does the report include the publication date?',
  'Does the report identify the author or research organization?',
  'Does the report provide numerical values for the Total Addressable Market (TAM)?',
  'Does the report present a Compound Annual Growth Rate (CAGR) or similar metric for market growth?',
  'Does the report identify distinct customer segments within the market?',
  'Does the report describe the competitive landscape?',
  'Does the report include a section on emerging technologies or innovations disrupting the market?',
  'Does the report discuss industry trends?',
  'Does the report offer a regional or geographic breakdown of the market?',
  'Does the report identify regulatory requirements affecting the market?'
];

export async function POST(request: NextRequest) {
  try {
    const { filePath, fileName, userId } = await request.json();

    if (!filePath || !fileName || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Download the file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('market-reports')
      .download(filePath);

    if (fileError) {
      console.error('Error downloading file:', fileError);
      return NextResponse.json({ error: 'Error downloading file' }, { status: 500 });
    }

    // Parse the PDF content
    const pdfData = await parse(fileData);
    const pdfText = pdfData.text;

    // Analyze the PDF with Groq LLM
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_API_MODEL || 'deepseek-r1-distill-llama-70b',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing market research reports. Answer the following questions about the provided report with Yes or No ONLY. Be conservative in your assessment - only answer Yes if the information is clearly stated in the report.'
        },
        {
          role: 'user',
          content: `Please analyze the following market report and answer each of these questions with only "Yes" or "No":\n\n${ANALYSIS_QUESTIONS.join('\n')}\n\nReport content:\n${pdfText.slice(0, 50000)}` // Limit text if needed
        }
      ],
      temperature: 0.1, // Lower temperature for more factual responses
    });

    const llmResponse = completion.choices[0].message.content || '';
    
    // Parse the responses and calculate score
    const responseLines = llmResponse.split('\n').filter(line => line.trim() !== '');
    
    // We need exactly 10 responses
    if (responseLines.length !== 10) {
      return NextResponse.json({ 
        error: 'Invalid LLM response format - expected 10 yes/no answers' 
      }, { status: 500 });
    }

    // Process the results
    const results = {
      has_publication_date: responseLines[0].toLowerCase().includes('yes'),
      has_author: responseLines[1].toLowerCase().includes('yes'),
      has_tam: responseLines[2].toLowerCase().includes('yes'),
      has_cagr: responseLines[3].toLowerCase().includes('yes'),
      has_customer_segments: responseLines[4].toLowerCase().includes('yes'),
      has_competitive_landscape: responseLines[5].toLowerCase().includes('yes'),
      has_emerging_tech: responseLines[6].toLowerCase().includes('yes'),
      has_industry_trends: responseLines[7].toLowerCase().includes('yes'),
      has_geographic_breakdown: responseLines[8].toLowerCase().includes('yes'),
      has_regulatory_requirements: responseLines[9].toLowerCase().includes('yes'),
    };
    
    // Calculate the total score
    const total_score = Object.values(results).filter(Boolean).length;
    
    // Store results in the database
    const { error: dbError } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        title: fileName,
        file_path: filePath,
        total_score,
        ...results
      });

    if (dbError) {
      console.error('Error storing results:', dbError);
      return NextResponse.json({ error: 'Error storing results' }, { status: 500 });
    }

    // Return the analysis results
    return NextResponse.json({
      results: {
        ...results,
        total_score
      }
    });
    
  } catch (error) {
    console.error('Error analyzing report:', error);
    return NextResponse.json({ error: 'Error analyzing report' }, { status: 500 });
  }
} 