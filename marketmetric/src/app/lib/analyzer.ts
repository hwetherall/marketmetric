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
  
  // Validate model name
  const validGroqModels = [
    "llama3-70b-8192",
    "llama3-8b-8192",
    "gemma-7b-it",
    "mixtral-8x7b-32768"
  ];
  
  // Use a supported model
  const selectedModel = validGroqModels.includes(model) ? model : "llama3-8b-8192";
  if (selectedModel !== model) {
    console.warn(`Warning: Model "${model}" may not be valid. Falling back to ${selectedModel}`);
  }
  
  console.log(`Making API call to Groq with model: ${selectedModel}`);
  
  try {
    console.log('Preparing Groq API request...');
    
    // Log the API URL and headers (without the actual API key)
    console.log('Groq API URL: https://api.groq.com/openai/v1/chat/completions');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey.length);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
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
 * Analyzes market report text content using Groq LLM
 * @param textContent The extracted text content from the PDF
 * @returns Analysis results with yes/no answers to each criterion
 */
export async function analyzeMarketReport(textContent: string): Promise<ReportResults> {
  console.log('Starting analysis of market report...');
  
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
      throw new Error(`Failed to get complete analysis from LLM. Got ${answers.length} answers instead of 10.`);
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
    throw new Error(`Failed to analyze market report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 