'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import MarketSummary, { ReportResults } from './components/MarketSummary';
import { FiLoader, FiFileText } from 'react-icons/fi';

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<{path: string, name: string}[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ReportResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload success
  const handleFileUploaded = async (filePath: string, fileName: string) => {
    setUploadedFiles(prev => [...prev, { path: filePath, name: fileName }]);
    setResults(null);
    setError(null);
  };

  // Handle generate summary button click
  const handleGenerateSummary = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one market report first.");
      return;
    }

    setProcessing(true);
    setError(null);
    
    try {
      console.log(`Analyzing ${uploadedFiles.length} files`);
      
      // Currently we'll just analyze the first file for the MVP version
      // In the future, this could be expanded to process all files and merge results
      const fileToAnalyze = uploadedFiles[0];
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          filePath: fileToAnalyze.path,
          fileName: fileToAnalyze.name,
          userId: 'anonymous-user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results) {
        throw new Error('Server response missing results object');
      }
      
      setResults(data.results);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? `Error: ${err.message}` : 'An error occurred during analysis');
    } finally {
      setProcessing(false);
    }
  };
  
  // Clear all uploaded files and reset
  const handleReset = () => {
    setUploadedFiles([]);
    setResults(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-200 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 pb-4 border-b-2 border-gray-400">
          <h1 className="text-4xl font-extrabold text-black">MarketMetric</h1>
        </div>
        
        <div className="bg-white p-7 rounded-xl shadow-md mb-8 border-2 border-gray-400">
          <h2 className="text-3xl font-extrabold mb-5 text-black">Upload Market Reports</h2>
          <FileUpload onFileUploaded={handleFileUploaded} />
          
          {uploadedFiles.length > 0 && (
            <div className="mt-5 p-5 bg-primary-100 rounded-lg border-2 border-primary-500">
              <h3 className="text-xl font-bold text-black mb-3">Uploaded Files:</h3>
              <ul className="mb-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-black font-medium">
                    {index + 1}. {file.name}
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-4">
                <button
                  onClick={handleGenerateSummary}
                  disabled={processing}
                  className={`${
                    processing 
                      ? 'bg-gray-800 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950'
                  } text-white py-3 px-5 rounded-lg flex items-center gap-3 font-extrabold transition-all shadow-md hover:shadow-lg text-xl`}
                  style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {processing ? (
                    <>
                      <FiLoader className="w-6 h-6 animate-spin" />
                      <span className="text-white opacity-100">Processing...</span>
                    </>
                  ) : (
                    <>
                      <FiFileText className="w-6 h-6" />
                      <span className="text-white opacity-100">Generate Market Report Summary</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={processing}
                  className="border-2 border-gray-800 text-black py-3 px-5 rounded-lg font-bold hover:bg-gray-100"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results section */}
        {results && !processing && (
          <>
            <MarketSummary 
              results={results} 
              reportName={uploadedFiles.length === 1 
                ? uploadedFiles[0].name 
                : `${uploadedFiles.length} Market Reports`} 
            />
          </>
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
