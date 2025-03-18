import groq from './groq';
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
 * Analyzes market report text content using Groq LLM
 * @param textContent The extracted text content from the PDF
 * @returns Analysis results with yes/no answers to each criterion
 */
export async function analyzeMarketReport(textContent: string): Promise<ReportResults> {
  // Create a truncated version of the text content if it's too long
  // Most LLMs have token limits, so we'll use the first ~8000 characters
  const truncatedText = textContent.slice(0, 8000);
  
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
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_API_MODEL || "deepseek-r1-distill-llama-70b",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Lower temperature for more deterministic responses
      max_tokens: 300, // Limit response length
    });

    // Process the response to extract yes/no answers
    const response = completion.choices[0]?.message?.content || '';
    const answers = response.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line)) // Only lines starting with a number
      .map(line => line.toLowerCase().includes('yes'));

    // If we didn't get 10 answers, something went wrong
    if (answers.length !== 10) {
      throw new Error('Failed to get complete analysis from LLM');
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
    
    return results;
  } catch (error) {
    console.error('Error analyzing with Groq LLM:', error);
    throw new Error('Failed to analyze market report');
  }
} 