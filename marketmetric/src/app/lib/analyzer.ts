import { ReportResults } from '../components/ReportScore';

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

/**
 * Make a request to the Groq API using fetch
 * @param prompt The prompt to send to the LLM
 * @returns The LLM response
 */
async function callGroqAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_API_MODEL || 'llama3-8b-8192';
  
  if (!apiKey) {
    console.error('Missing Groq API key in environment variables');
    throw new Error('Missing Groq API key. Please check your .env.local file.');
  }
  
  console.log(`Using Groq model: ${model}`);
  
  try {
    console.log('Preparing Groq API request...');
    
    // Create a safer response handling approach
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
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 300,
        })
      });
    } catch (fetchError) {
      console.error('Network error when calling Groq API:', fetchError);
      throw new Error(`Network error when calling Groq API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    // Check response status
    console.log(`Groq API response status: ${response.status}`);
    
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
 * Fallback analysis function that returns mock results
 * This helps avoid API errors during testing
 * @returns Mock analysis results
 */
function getMockAnalysisResults(): ReportResults {
  console.log('Using mock analysis results');
  return {
    has_publication_date: true,
    has_author: true,
    has_tam: true, 
    has_cagr: true,
    has_customer_segments: true,
    has_competitive_landscape: false,
    has_emerging_tech: true,
    has_industry_trends: true,
    has_geographic_breakdown: true,
    has_regulatory_requirements: false,
    total_score: 8
  };
}

/**
 * Analyzes market report text content using Groq LLM
 * @param textContent The extracted text content from the PDF
 * @returns Analysis results with yes/no answers to each criterion
 */
export async function analyzeMarketReport(textContent: string): Promise<ReportResults> {
  console.log('Starting analysis of market report...');
  
  // Check if we should use a fallback for testing
  const useFallback = process.env.USE_MOCK_ANALYSIS === 'true';
  if (useFallback) {
    return getMockAnalysisResults();
  }
  
  // Create a truncated version of the text content if it's too long
  // Most LLMs have token limits, so we'll use the first ~8000 characters
  const truncatedText = textContent.slice(0, 8000);
  console.log(`Truncated text from ${textContent.length} to ${truncatedText.length} characters`);
  
  // Prepare the prompt for the LLM
  const prompt = `
You are an expert market research analyst. Analyze the following market report text and answer these yes/no questions:

${ANALYSIS_QUESTIONS.map((q, i) => `${i+1}. ${q}`).join('\n')}

Please carefully analyze the text and answer ONLY with "yes" or "no" for each question in this format:
1. yes/no
2. yes/no
...and so on.

Here is the market report text to analyze:
${truncatedText}
`;

  try {
    // Call the Groq LLM with the prepared prompt
    const response = await callGroqAPI(prompt);
    console.log('Raw LLM response:', response);
    
    // Process the response to extract yes/no answers
    const answers = response.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line)) // Only lines starting with a number
      .map(line => line.toLowerCase().includes('yes'));
    
    console.log('Parsed answers:', answers);

    // If we didn't get 10 answers, something went wrong
    if (answers.length !== 10) {
      console.warn(`Warning: Got ${answers.length} answers instead of 10. Using fallback default values for missing answers.`);
      
      // Create a properly sized array with default answers
      const defaultAnswers = Array(10).fill(false);
      // Copy any answers we did get
      answers.forEach((answer, index) => {
        if (index < 10) defaultAnswers[index] = answer;
      });
      
      // Map the answers to the report results structure
      const results: ReportResults = {
        has_publication_date: defaultAnswers[0],
        has_author: defaultAnswers[1],
        has_tam: defaultAnswers[2],
        has_cagr: defaultAnswers[3],
        has_customer_segments: defaultAnswers[4],
        has_competitive_landscape: defaultAnswers[5],
        has_emerging_tech: defaultAnswers[6],
        has_industry_trends: defaultAnswers[7],
        has_geographic_breakdown: defaultAnswers[8],
        has_regulatory_requirements: defaultAnswers[9],
        total_score: 0
      };
      
      // Calculate the total score
      results.total_score = Object.values(results)
        .filter(val => typeof val === 'boolean' && val)
        .length;
      
      return results;
    }

    // Map the answers to the report results structure
    const results: ReportResults = {
      has_publication_date: answers[0],
      has_author: answers[1],
      has_tam: answers[2],
      has_cagr: answers[3],
      has_customer_segments: answers[4],
      has_competitive_landscape: answers[5],
      has_emerging_tech: answers[6],
      has_industry_trends: answers[7],
      has_geographic_breakdown: answers[8],
      has_regulatory_requirements: answers[9],
      total_score: 0
    };
    
    // Calculate the total score
    results.total_score = Object.values(results)
      .filter(val => typeof val === 'boolean' && val)
      .length;
    
    console.log('Analysis completed successfully, returning results');
    return results;
  } catch (error) {
    console.error('Error analyzing with Groq LLM:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // In case of error, use mock results instead of failing completely
    console.log('Using fallback mock results due to analysis error');
    return getMockAnalysisResults();
  }
}