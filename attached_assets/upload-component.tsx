'use client';

import { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, FileText, FileSpreadsheet, FileImage } from 'lucide-react';

interface FileUploadProps {
  categories: string[];
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  allowedFileTypes?: string[];
}

export default function FileUpload({
  categories,
  onSuccess,
  onError,
  maxSizeMB = 10,
  allowedFileTypes = [
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'text/markdown',
    'application/json'
  ],
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(categories[0] || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      setUploadStatus('error');
      if (onError) onError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    
    // Check file type
    if (!allowedFileTypes.includes(selectedFile.type)) {
      setErrorMessage('File type not supported. Allowed types are: TXT, CSV, Excel, PDF, Markdown, and JSON.');
      setUploadStatus('error');
      if (onError) onError('File type not supported.');
      return;
    }
    
    setFile(selectedFile);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    
    if (!droppedFile) {
      return;
    }
    
    // Check file size
    if (droppedFile.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      setUploadStatus('error');
      if (onError) onError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    
    // Check file type
    if (!allowedFileTypes.includes(droppedFile.type)) {
      setErrorMessage('File type not supported. Allowed types are: TXT, CSV, Excel, PDF, Markdown, and JSON.');
      setUploadStatus('error');
      if (onError) onError('File type not supported.');
      return;
    }
    
    setFile(droppedFile);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || !category) {
      setErrorMessage('Please select a file and category.');
      setUploadStatus('error');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('metadata', JSON.stringify({
        uploadedAt: new Date().toISOString(),
      }));
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setUploadStatus('success');
      if (onSuccess) onSuccess(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage(error.message || 'Upload failed');
      setUploadStatus('error');
      if (onError) onError(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('csv') || file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (file.type.includes('image')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          file ? 'border-primary-blue bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: TXT, CSV, Excel, PDF, Markdown, JSON (max {maxSizeMB}MB)
              </p>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept={allowedFileTypes.join(',')}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-blue hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
              >
                Browse files
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              {getFileIcon(file)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="mt-3 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="mt-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Select Category
        </label>
        <select
          id="category"
          value={category}
          onChange={handleCategoryChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm rounded-md"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Status */}
      {uploadStatus === 'error' && (
        <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mt-4 p-3 rounded-md bg-green-50 text-green-700 text-sm flex items-start">
          <Check className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>File uploaded successfully!</span>
        </div>
      )}

      {/* Upload Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-blue hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload to Knowledge Base
            </>
          )}
        </button>
      </div>
    </div>
  );
}
