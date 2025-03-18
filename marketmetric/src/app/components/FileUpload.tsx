'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiLoader } from 'react-icons/fi';
import supabase from '../lib/supabase';

interface FileUploadProps {
  onFileUploaded: (filePath: string, fileName: string) => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      
      // Check if the file is a PDF
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }

      setUploading(true);
      setError(null);
      setUsingFallback(false);
      
      try {
        // Try server-side upload API first
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Server upload failed');
        }
        
        // Successfully uploaded through server API
        onFileUploaded(result.filePath, result.fileName);
        
      } catch (serverErr) {
        console.error('Server upload failed, trying direct Supabase upload:', serverErr);
        
        try {
          // Try to upload directly to Supabase
          const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          
          const { data, error: uploadError } = await supabase.storage
            .from('market-reports')
            .upload(`reports/${fileName}`, file);
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Direct upload successful
          onFileUploaded(data.path, file.name);
          
        } catch (uploadErr) {
          console.error('Direct upload failed, using local fallback:', uploadErr);
          setUsingFallback(true);
          setError('Using local storage (size limited). For large files, refresh and try again.');
          
          try {
            // Local storage as last resort - check file size first
            if (file.size > 4 * 1024 * 1024) { // 4MB max for safety
              setError('File too large for local storage. Please try again or use a smaller file.');
              return;
            }
            
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const reader = new FileReader();
            
            reader.onload = function(event) {
              if (event.target && event.target.result) {
                try {
                  sessionStorage.setItem(`file_${fileName}`, event.target.result as string);
                  
                  // Create a mock file path and notify parent
                  const mockFilePath = `local/${fileName}`;
                  onFileUploaded(mockFilePath, file.name);
                } catch (storageErr) {
                  setError('Browser storage limit exceeded. Try a smaller file or refresh the page.');
                }
              }
            };
            
            reader.readAsDataURL(file);
          } catch (localErr) {
            setError('All upload methods failed. Please try again later.');
          }
        }
      } finally {
        setUploading(false);
      }
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`p-8 border-4 border-dashed rounded-lg text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-primary-700 bg-primary-100' 
            : uploading 
              ? 'border-gray-700 bg-gray-100'
              : 'border-gray-800 hover:border-primary-700 hover:bg-primary-100'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          {uploading ? (
            <FiLoader className="w-16 h-16 mb-4 text-primary-900 animate-spin" />
          ) : (
            <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-primary-600 text-white">
              <FiUpload className="w-10 h-10" />
            </div>
          )}
          
          {uploading ? (
            <p className="text-black font-black text-xl">Uploading your report...</p>
          ) : (
            <>
              <p className="mb-3 text-black font-black text-2xl">
                {isDragActive ? 'Drop your PDF report here' : 'Drag & drop a market report PDF here'}
              </p>
              <div className="flex items-center gap-2 text-base font-extrabold text-black bg-gray-300 py-3 px-5 rounded-full border-2 border-gray-500">
                <FiFile className="text-primary-900 w-5 h-5" />
                <span>or click to select a file (PDF only)</span>
              </div>
            </>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg text-black text-base font-bold">
              {error}
            </div>
          )}
        </div>
      </div>
      {usingFallback && (
        <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-base text-black font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Using local storage fallback mode. This is for testing purposes only.
        </div>
      )}
    </div>
  );
} 