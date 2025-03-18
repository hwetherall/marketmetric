'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReportScore, { ReportResults } from './components/ReportScore';
import { useAuth } from './context/AuthContext';
import { FiLoader } from 'react-icons/fi';

export default function Home() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<{path: string, name: string} | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<ReportResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle file upload success
  const handleFileUploaded = async (filePath: string, fileName: string) => {
    setUploadedFile({ path: filePath, name: fileName });
    setResults(null);
    setError(null);
  };

  // Handle analyze report button click
  const handleAnalyzeReport = async () => {
    if (!uploadedFile || !user) return;

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
          userId: user.id,
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

  // Handle auth
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
        
      if (error) throw error;
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  // Auth form
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Sign In to MarketMetric'}
          </h1>
          
          {authError && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
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
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-blue-600 text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content when logged in
  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">MarketMetric</h1>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user.email}</span>
              <button 
                onClick={() => signOut()} 
                className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Upload Market Report</h2>
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
          
          {error && (
            <div className="mt-4 bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}
        </div>
        
        {results && (
          <ReportScore results={results} reportName={uploadedFile?.name || 'Market Report'} />
        )}
      </div>
    </main>
  );
}
