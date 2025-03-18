'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReportScore, { ReportResults } from './components/ReportScore';
import { useSimpleAuth } from './context/SimpleAuthContext';
import { FiLoader, FiUpload, FiBarChart2, FiLogOut } from 'react-icons/fi';

export default function Home() {
  const { isAuthenticated, login, logout } = useSimpleAuth();
  const [uploadedFile, setUploadedFile] = useState<{path: string, name: string} | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<ReportResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple Auth form state
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle file upload success
  const handleFileUploaded = async (filePath: string, fileName: string) => {
    console.log(`File uploaded: ${fileName} at path: ${filePath}`);
    setUploadedFile({ path: filePath, name: fileName });
    setResults(null);
    setError(null);
  };

  // Handle analyze report button click
const handleAnalyzeReport = async () => {
  if (!uploadedFile) return;

  setAnalyzing(true);
  setError(null);
  
  try {
    console.log(`Analyzing file: ${uploadedFile.name}, path: ${uploadedFile.path}`);
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        filePath: uploadedFile.path,
        fileName: uploadedFile.name,
        userId: 'anonymous-user',
      }),
    });

    // First check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Received non-JSON response: ${contentType}`);
      
      // Try to get response text for debugging
      const responseText = await response.text();
      console.error('Response text:', responseText.substring(0, 500)); // Log first 500 chars
      throw new Error('Server returned a non-JSON response. Please check server logs.');
    }

    // Parse JSON response
    const data = await response.json();
    
    // Check for error in the JSON response
    if (!response.ok || data.error) {
      const errorMessage = data.error || `Server returned status ${response.status}`;
      const errorDetails = data.details ? `: ${data.details}` : '';
      throw new Error(`${errorMessage}${errorDetails}`);
    }
    
    // Check for valid results object
    if (!data.results) {
      throw new Error('Server response missing results object');
    }
    
    console.log('Analysis results:', data.results);
    setResults(data.results);
  } catch (err) {
    console.error('Error analyzing report:', err);
    setError(err instanceof Error ? `Analysis error: ${err.message}` : 'An error occurred during analysis');
  } finally {
    setAnalyzing(false);
  }
};

  // Handle simple auth
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    const success = login(password);
    if (!success) {
      setAuthError('Incorrect password');
    }
  };

  // Auth form (simple password protection)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-2 border-gray-300">
          <h1 className="text-4xl font-extrabold mb-6 text-center text-black">
            MarketMetric
          </h1>
          
          {authError && (
            <div className="bg-red-100 text-black p-4 rounded-lg mb-4 text-base font-bold border-2 border-red-400">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-lg font-bold text-black mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-black text-lg"
                placeholder="Enter password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-700 to-primary-800 text-white py-3 px-5 rounded-lg hover:from-primary-800 hover:to-primary-900 font-extrabold transition-all shadow-md hover:shadow-lg text-lg"
            >
              Access Application
            </button>
          </form>
          
          <div className="mt-5 text-center text-base font-semibold text-black">
            Hint: The password is <span className="font-extrabold">Password123</span>
          </div>
        </div>
      </div>
    );
  }

  // Main content when authenticated
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-200 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-400">
          <h1 className="text-4xl font-extrabold text-black">MarketMetric</h1>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-base text-black hover:text-primary-900 font-black bg-white py-2 px-4 rounded-lg shadow-md border-2 border-gray-600 hover:border-primary-800 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
        
        <div className="bg-white p-7 rounded-xl shadow-md mb-8 border-2 border-gray-400">
          <h2 className="text-3xl font-extrabold mb-5 text-black">Upload Market Report</h2>
          <FileUpload onFileUploaded={handleFileUploaded} />
          
          {uploadedFile && (
            <div className="mt-5 p-5 bg-primary-100 rounded-lg border-2 border-primary-500">
              <p className="text-black font-bold flex items-center gap-2 text-xl">
                <FiUpload className="w-6 h-6" />
                Uploaded: {uploadedFile.name}
              </p>
              
              <button
                onClick={handleAnalyzeReport}
                disabled={analyzing}
                className={`mt-4 ${
                  analyzing 
                    ? 'bg-gray-800 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950'
                } text-white py-3 px-5 rounded-lg flex items-center gap-3 font-extrabold transition-all shadow-md hover:shadow-lg text-xl`}
                style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
              >
                {analyzing ? (
                  <>
                    <FiLoader className="w-6 h-6 animate-spin" />
                    <span className="text-white opacity-100">Analyzing Report...</span>
                  </>
                ) : (
                  <>
                    <FiBarChart2 className="w-6 h-6" />
                    <span className="text-white opacity-100">Analyze Report</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results section */}
        {results && !analyzing && (
          <ReportScore results={results} reportName={uploadedFile?.name || 'Unknown Report'} />
        )}

        {error && (
          <div className="mt-4 p-5 bg-red-100 text-black rounded-lg border-2 border-red-400 font-bold text-lg">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
