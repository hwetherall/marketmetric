import Groq from 'groq-sdk';

// Initialize the Groq client
const apiKey = process.env.GROQ_API_KEY;
// Fix baseURL to avoid double path segment
const baseURL = 'https://api.groq.com';

let groq: Groq;

try {
  // Check if API key is set
  if (!apiKey) {
    console.error('GROQ_API_KEY is not set in environment variables!');
    throw new Error('Missing Groq API key. Please check your .env.local file.');
  }

  // Log sanitized version of API key for debugging (first 4 chars only)
  console.log(`Using Groq API key starting with: ${apiKey.substring(0, 4)}***`);
  console.log(`Using Groq base URL: ${baseURL}`);

  // Create the Groq client
  groq = new Groq({
    apiKey: apiKey,
    baseURL: baseURL
  });
  
  console.log('Groq client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Groq client:', error);
  // Create a mock client that will throw a more descriptive error when used
  groq = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('Groq client failed to initialize properly. Check server logs for details.');
        }
      }
    }
  } as unknown as Groq;
}

export default groq; 