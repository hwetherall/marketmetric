// Simple script to test Groq API using fetch
// Run with: node test-groq-fetch.js
require('dotenv').config({ path: '.env.local' });

// Use node-fetch in Node.js environment
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testGroqWithFetch() {
  console.log('Testing Groq API with fetch...');
  
  // Get API key and settings from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_API_MODEL || 'llama3-8b-8192';
  
  // Check if API key is set
  if (!apiKey) {
    console.error('Error: GROQ_API_KEY is not set in .env.local file');
    process.exit(1);
  }
  
  // Log sanitized version of the API key
  console.log(`Using API key starting with: ${apiKey.substring(0, 4)}***`);
  console.log(`Using model: ${model}`);
  
  try {
    // Test a simple completion request
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            content: "Hello, are you working correctly? Please respond with a short confirmation."
          }
        ],
        temperature: 0.5,
        max_tokens: 50,
      })
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`\n❌ API Error (${response.status} ${response.statusText}):`, errorBody);
      process.exit(1);
    }
    
    const data = await response.json();
    console.log('\nAPI Response:');
    console.log(data.choices[0]?.message?.content);
    
    console.log('\n✅ Groq API is working correctly with fetch!\n');
  } catch (error) {
    console.error('\n❌ Error testing Groq API with fetch:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
testGroqWithFetch(); 