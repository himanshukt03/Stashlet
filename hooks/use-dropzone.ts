"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneFile extends File {
  preview?: string;
}

export function useCustomDropzone(options = {}) {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    try {
      setFiles(acceptedFiles as DropzoneFile[]);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process files";
      setError(errorMessage);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10485760, // 10MB
    maxFiles: 1,
    ...options
  });
  
  const resetFiles = () => {
    setFiles([]);
  };
  
  return {
    files,
    error,
    getRootProps,
    getInputProps,
    isDragActive,
    resetFiles
  };
}
