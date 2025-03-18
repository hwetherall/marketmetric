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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      
      // Check if the file is a PDF
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }

      try {
        setUploading(true);
        setError(null);
        
        // Generate a unique file name to prevent collisions
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        // Upload the file to Supabase storage
        const { data, error: uploadError } = await supabase.storage
          .from('market-reports')
          .upload(`reports/${fileName}`, file);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the file path
        const filePath = data.path;
        
        // Pass the file info back to the parent component
        onFileUploaded(filePath, file.name);
        
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Error uploading file. Please try again.');
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
  );
} 