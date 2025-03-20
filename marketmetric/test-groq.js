// Simple script to test Groq API connection
// Run with: node test-groq.js
require('dotenv').config({ path: '.env.local' });
const Groq = require('groq-sdk');

async function testGroqConnection() {
  console.log('Testing Groq API connection...');
  
  // Get API key and settings from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  const baseURL = 'https://api.groq.com'; // Fixed base URL
  const model = process.env.GROQ_API_MODEL || 'deepseek-r1-distill-llama-70b';
  const maxTokens = parseInt(process.env.MAX_TOKENS || '100000', 10);
  
  // Check if API key is set
  if (!apiKey) {
    console.error('Error: GROQ_API_KEY is not set in .env.local file');
    process.exit(1);
  }
  
  // Log sanitized version of the API key (first 4 chars only)
  console.log(`Using API key starting with: ${apiKey.substring(0, 4)}***`);
  console.log(`Using base URL: ${baseURL}`);
  console.log(`Using model: ${model}`);
  console.log(`Using max tokens: ${maxTokens}`);
  
  try {
    // Initialize Groq client
    const groq = new Groq({
      apiKey: apiKey,
      baseURL: baseURL
    });
    
    console.log('Groq client initialized. Sending a test request...');
    
    // Make a simple test request
    const completion = await groq.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: "Hello, are you working correctly? Please respond with a short confirmation."
        }
      ],
      temperature: 0.5,
      max_tokens: 50, // Using a small value for the test response
    });
    
    // Check response
    const response = completion.choices[0]?.message?.content;
    console.log('\nAPI Response:');
    console.log(response);
    console.log('\n✅ Groq API is working correctly!\n');
  } catch (error) {
    console.error('\n❌ Error testing Groq API:');
    console.error(error.message);
    
    if (error.response) {
      console.error('\nError details:');
      console.error(error.response.data || error.response);
    }
    
    console.error('\nPlease check your API key, model name, and internet connection.');
    process.exit(1);
  }
}

// Run the test
testGroqConnection(); 