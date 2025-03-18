'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
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
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <FiUpload className="w-12 h-12 mb-4 text-gray-400" />
          {uploading ? (
            <p className="text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="mb-2 text-gray-700 font-medium">
                {isDragActive ? 'Drop the PDF here' : 'Drag & drop a market report PDF here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to select a file (PDF only)
              </p>
            </>
          )}
          {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
        </div>
      </div>
      {usingFallback && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-700">
          Using local storage fallback mode. This is for testing purposes only.
        </div>
      )}
    </div>
  );
} 