# MarketMetric

MarketMetric is an application that analyzes market research reports using LLM technology to score them based on 10 key criteria.

## Features

- **PDF Upload**: Users can upload market research report PDFs
- **AI Analysis**: Reports are analyzed by an LLM (deepseek-r1-distill-llama-70b via Groq)
- **10-Point Scoring**: Each report receives a score out of 10 based on key criteria
- **Report Storage**: Reports are stored securely in Supabase storage
- **User Authentication**: Secure login and registration via Supabase Auth

## Scoring Criteria

The LLM evaluates market reports based on these criteria:

1. Publication date included
2. Author or research organization identified
3. Total Addressable Market (TAM) values provided
4. Compound Annual Growth Rate (CAGR) presented
5. Distinct customer segments identified
6. Competitive landscape described
7. Emerging technologies or innovations included
8. Industry trends discussed
9. Regional or geographic breakdown provided
10. Regulatory requirements identified

## Technology Stack

- **Frontend**: Next.js 15 (React 19, TypeScript)
- **UI**: TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **LLM**: Groq API with deepseek-r1-distill-llama-70b (100k token context window)
- **PDF Processing**: pdf-parse

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   GROQ_API_MODEL=deepseek-r1-distill-llama-70b
   MAX_TOKENS=100000
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Supabase Setup

1. Create a new Supabase project
2. Run the schema SQL (`supabase/schema.sql`)
3. Run the storage SQL (`supabase/storage.sql`)
4. Enable Authentication

## Planned Features

- URL ingestion for generating PDFs from web content
- Custom question configuration
- Report dashboard with history
- Vercel deployment

## License

MIT
