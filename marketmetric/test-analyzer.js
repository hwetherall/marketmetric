// Test script to verify analyzer configuration
require('dotenv').config({ path: '.env.local' });

async function testAnalyzerConfig() {
  console.log('Testing analyzer configuration...');
  
  // Get API key and settings from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_API_MODEL || 'deepseek-r1-distill-llama-70b';
  const maxTokens = parseInt(process.env.MAX_TOKENS || '100000', 10);
  
  console.log('Configuration:');
  console.log(`- Model: ${model}`);
  console.log(`- Max tokens: ${maxTokens}`);
  console.log(`- API Key: ${apiKey ? 'Set (first chars: ' + apiKey.substring(0, 4) + '***)' : 'Not set'}`);
  
  console.log('\nSending test request to Groq API...');
  
  try {
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
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "What is the total context length you can handle? Can you process large documents?"
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('\nAPI Response:');
    console.log(data.choices[0]?.message?.content);
    console.log('\n✅ Configuration test successful!');
  } catch (error) {
    console.error('\n❌ Error testing configuration:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
testAnalyzerConfig(); 