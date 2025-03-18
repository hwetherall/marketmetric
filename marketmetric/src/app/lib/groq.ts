import Groq from 'groq-sdk';

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: process.env.GROQ_API_BASE_URL
});

export default groq; 