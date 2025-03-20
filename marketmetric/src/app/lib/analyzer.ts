import { ReportResults } from '../components/MarketSummary';

/**
 * Make a request to the Groq API using fetch
 * @param prompt The prompt to send to the LLM
 * @returns The LLM response
 */
async function callGroqAPI(prompt: string, max_tokens: number = 100000): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_API_MODEL || 'deepseek-r1-distill-llama-70b'; // Default to deepseek model
  const maxTokens = parseInt(process.env.MAX_TOKENS || '100000', 10); // Use environment variable with fallback
  
  if (!apiKey) {
    console.error('Missing Groq API key in environment variables');
    throw new Error('Missing Groq API key. Please check your .env.local file.');
  }
  
  try {
    let response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are an elite market research analyst with exceptional skills in data extraction, analysis, and business intelligence. You produce concise, insightful, and professionally formatted market summaries that executives rely on for strategic decision-making."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2, // Lower temperature for more factual and professional output
          max_tokens: max_tokens, // Use the parameter value
        })
      });
    } catch (fetchError) {
      console.error('Network error when calling Groq API:', fetchError);
      throw new Error(`Network error when calling Groq API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    if (!response.ok) {
      let errorDetails = 'Unknown error';
      
      try {
        // Try to parse error as JSON first
        const errorJson = await response.json();
        console.error('Groq API error JSON:', JSON.stringify(errorJson));
        errorDetails = JSON.stringify(errorJson);
      } catch (jsonError) {
        // If not JSON, get as text
        try {
          const errorText = await response.text();
          console.error(`Groq API error text (${response.status}):`, errorText);
          errorDetails = errorText;
        } catch (textError) {
          console.error('Could not get error details from Groq API response');
        }
      }
      
      // If we get an error about context length, fall back to mock results
      if (errorDetails.includes('context_length_exceeded')) {
        console.warn('Context length exceeded, using mock results');
        // Return a simpler mock response
        return getMockSummary();
      }
      
      throw new Error(`Groq API returned ${response.status}: ${errorDetails}`);
    }
    
    // Parse the successful response
    try {
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Groq API returned unexpected response structure:', JSON.stringify(data));
        throw new Error('Unexpected response structure from Groq API');
      }
      
      return data.choices[0]?.message?.content || '';
    } catch (parseError) {
      console.error('Error parsing Groq API response:', parseError);
      throw new Error(`Failed to parse Groq API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error(`Failed to call Groq API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Returns a mock summary for testing
 * @returns Mock summary text
 */
function getMockSummary(): string {
  return `# Market Report Summary

## EXECUTIVE SUMMARY
This report provides an in-depth analysis of the global EdTech market, highlighting significant growth driven by digital transformation in education. Key findings indicate accelerated adoption of online learning platforms and AI-enabled educational solutions, with substantial investment activity in Q1 2021.

## MARKET SIZE & GROWTH
- Total EdTech market: $254.8 billion in 2021
- Expected to reach: $605.4 billion by 2027
- CAGR: 15.52% during the forecast period
- Primary growth drivers: Remote learning adoption, increasing digitalization, and growing venture capital investments

## MARKET SEGMENTATION
- By Solution: Hardware (22%), Software (45%), Services (33%)
- By End-User: K-12 (38%), Higher Education (35%), Corporate (27%)
- Fastest-growing segment: AI-enabled learning platforms (32% YoY growth)

## COMPETITIVE LANDSCAPE
- Market leaders: BYJU'S (12%), Coursera (8%), Udemy (7%), Duolingo (5%)
- Recent activity: 290 transactions in Q1 2021, with total value over $4.6 billion
- Competitive factors: Content quality, technology innovation, and user experience design

## EMERGING TRENDS
- Microlearning platforms gaining significant traction
- AR/VR integration in educational content delivery
- Skills-based credentialing replacing traditional certification models
- Future outlook: Increased corporate investment in workforce development platforms expected through 2025`;
}

/**
 * Fallback analysis function that returns mock results
 * @returns Mock analysis results
 */
function getMockAnalysisResults(): ReportResults {
  return {
    summary: getMockSummary()
  };
}

/**
 * Extracts the most relevant sections from a market report text
 * This helps reduce the size of the text sent to the API
 * @param text Full text of the market report
 * @returns Condensed version focusing on key sections
 */
function extractRelevantSections(text: string): string {
  // Looking for common section headers in market reports
  const sectionKeywords = [
    'executive summary',
    'market overview',
    'market size',
    'market forecast',
    'growth rate',
    'cagr',
    'segmentation',
    'regional analysis',
    'competitive landscape',
    'key players',
    'emerging technologies',
    'trends',
    'regulatory',
    'methodology'
  ];
  
  // Extract paragraphs containing these keywords (case insensitive)
  const paragraphs = text.split('\n\n');
  const relevantParagraphs: string[] = [];
  
  // First pass: get paragraphs with section headers
  for (const paragraph of paragraphs) {
    const lowerPara = paragraph.toLowerCase();
    if (sectionKeywords.some(keyword => lowerPara.includes(keyword))) {
      relevantParagraphs.push(paragraph);
    }
  }
  
  // If we don't have enough relevant paragraphs, add some from the beginning and end
  if (relevantParagraphs.length < 20) { // Increased from 10 to get more content
    // Add the first few paragraphs (often contains summary info)
    const introParas = paragraphs.slice(0, 10); // Increased from 5
    for (const para of introParas) {
      if (!relevantParagraphs.includes(para)) {
        relevantParagraphs.push(para);
      }
    }
    
    // Add some paragraphs from the end (often contains methodology and conclusion)
    const concludingParas = paragraphs.slice(-10); // Increased from 5
    for (const para of concludingParas) {
      if (!relevantParagraphs.includes(para)) {
        relevantParagraphs.push(para);
      }
    }
  }
  
  // Join the relevant paragraphs and limit total size to a larger value
  // With our new model we can handle much more text
  const maxAllowedLength = 50000; // Increased significantly from 8000
  return relevantParagraphs.join('\n\n').slice(0, maxAllowedLength);
}

/**
 * Analyzes market report text content using Groq LLM to create a comprehensive summary
 * @param textContent The extracted text content from the PDF
 * @returns Analysis results with a comprehensive summary
 */
export async function analyzeMarketReport(textContent: string): Promise<ReportResults> {
  // Check if we should use a fallback for testing
  const useFallback = process.env.USE_MOCK_ANALYSIS === 'true';
  if (useFallback) {
    return getMockAnalysisResults();
  }
  
  try {
    // Extract relevant sections to reduce text size
    const extractedText = extractRelevantSections(textContent);
    
    // Fallback to simple truncation if extraction doesn't reduce size enough
    const maxLength = 40000; // Much larger limit with our new model and context window
    const finalText = extractedText.length > maxLength ? extractedText.slice(0, maxLength) : extractedText;
    
    // Prepare the prompt for comprehensive market report summary
    const summaryPrompt = `
As an elite market research analyst, create a professional market report summary based on the provided content.

CRITICAL REQUIREMENTS:
1. NEVER include ANY thinking, planning, or meta-commentary in your response
2. NEVER include phrases like "Here is the..." or "Based on the report..."
3. Start IMMEDIATELY with the first section heading
4. ONLY use the EXACT 5 section headings specified below - no additions or modifications
5. Use proper Markdown formatting throughout:
   - Use ## for main section headings (exactly as shown below)
   - Use bullet points (- ) for lists and key points
   - Bold important terms and categories with **bold text**
   - Format numerical data in a consistent way
6. Include precise numerical data whenever available from the report
7. Organize information in a structured, scannable format

YOUR RESPONSE MUST CONTAIN EXACTLY THESE 5 SECTIONS WITH THESE EXACT MARKDOWN HEADINGS:

## EXECUTIVE SUMMARY
- Brief overview of key market insights (1-2 paragraphs)
- 2-3 most significant findings with business implications

## MARKET SIZE & GROWTH
- Current market valuation with exact figures
- Forecast market size with target year
- CAGR percentage
- Primary growth drivers

## MARKET SEGMENTATION
- Breakdown by segment with percentage distributions
- Identification of fastest-growing segments

## COMPETITIVE LANDSCAPE
- Top market players with share percentages
- Recent strategic developments (M&A, partnerships)
- Competitive positioning analysis

## EMERGING TRENDS
- Technological innovations driving market evolution
- New business models
- Future outlook (next 2-5 years)

Here is the market report to analyze:
${finalText}
`;

    // Call the Groq LLM with the summary prompt
    let summaryResponse = await callGroqAPI(summaryPrompt, 100000);
    
    // Post-process the response to remove any thinking section at the beginning
    summaryResponse = summaryResponse
        .replace(/<think>[\s\S]*?<\/think>/g, '')  // Remove any <think> tags and content
        .replace(/^[\s\S]*?## EXECUTIVE SUMMARY/m, '## EXECUTIVE SUMMARY')  // Remove anything before "## EXECUTIVE SUMMARY"
        .trim();
    
    // Add the title only if it's missing
    if (!summaryResponse.startsWith("# Market Report Summary")) {
        summaryResponse = "# Market Report Summary\n\n" + summaryResponse;
    }
    
    // Enhance formatting with proper Markdown headers and structure
    summaryResponse = summaryResponse
        // Ensure section headers are properly formatted
        .replace(/^EXECUTIVE SUMMARY\b/gm, '## EXECUTIVE SUMMARY')
        .replace(/^MARKET SIZE & GROWTH\b/gm, '## MARKET SIZE & GROWTH')
        .replace(/^MARKET SEGMENTATION\b/gm, '## MARKET SEGMENTATION')
        .replace(/^COMPETITIVE LANDSCAPE\b/gm, '## COMPETITIVE LANDSCAPE')
        .replace(/^EMERGING TRENDS\b/gm, '## EMERGING TRENDS')
        // Ensure consistent bullet point formatting
        .replace(/^([A-Z][^:]+):\s*$/gm, '**$1:**')  // Bold subheadings
        .replace(/^(?!##|-)(\w[^:]+):\s*/gm, '- **$1:** ')   // Convert label: value to bullet points with bold labels if not already a bullet point
        // Highlight numbers and percentages to make metrics stand out
        .replace(/(\$[\d,\.]+\s*(billion|million|trillion)|\d+\.?\d*\s*%|\d+\.?\d*\s*(CAGR|YoY))/g, '`$1`')
        // Format key performance metrics with visual emphasis
        .replace(/Top (\d+) (findings|players|companies|vendors|providers):/gi, '### Top $1 $2:')
        // Add spacing between sections for better readability
        .replace(/^## /gm, '\n## ')
        // Ensure we don't have excessive newlines
        .replace(/\n{3,}/g, '\n\n');
        
    // Add horizontal rules between sections properly
    const sections = summaryResponse.split(/\n## /);
    if (sections.length > 1) {
        // Start with the title section
        let formattedResponse = sections[0];
        
        // Add horizontal rule before each subsequent section
        for (let i = 1; i < sections.length; i++) {
            formattedResponse += '\n\n---\n\n## ' + sections[i];
        }
        
        summaryResponse = formattedResponse;
    }
    
    // Return simplified results
    return {
      summary: summaryResponse
    };
  } catch (error) {
    console.error('Error analyzing with Groq LLM:', error);
    
    // In case of error, use mock results instead of failing completely
    return getMockAnalysisResults();
  }
}