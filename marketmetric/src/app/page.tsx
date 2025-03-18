'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReportScore, { ReportResults } from './components/ReportScore';
import { useSimpleAuth } from './context/SimpleAuthContext';
import { FiLoader } from 'react-icons/fi';

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
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: uploadedFile.path,
          fileName: uploadedFile.name,
          userId: 'anonymous-user', // Since we're not using real auth
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze report');
      }

      setResults(data.results);
    } catch (err) {
      console.error('Error analyzing report:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">
            MarketMetric
          </h1>
          
          {authError && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Access Application
            </button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            Hint: The password is Password123
          </div>
        </div>
      </div>
    );
  }

  // Main content when authenticated
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">MarketMetric</h1>
          <button 
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Market Report</h2>
          <FileUpload onFileUploaded={handleFileUploaded} />
          
          {uploadedFile && (
            <div className="mt-4">
              <p className="text-green-600 font-medium">
                Uploaded: {uploadedFile.name}
              </p>
              
              <button
                onClick={handleAnalyzeReport}
                disabled={analyzing}
                className={`mt-4 ${
                  analyzing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white py-2 px-4 rounded-md flex items-center gap-2`}
              >
                {analyzing ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Analyzing Report...
                  </>
                ) : (
                  'Analyze Report'
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
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
