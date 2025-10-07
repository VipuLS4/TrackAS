import React, { useRef } from 'react';
import { Upload, FileText, Download, X, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadFieldProps {
  docType: string;
  label: string;
  description: string;
  onUpload: (docType: string, file: File) => void;
  uploadedFile?: File;
  progress?: number;
  error?: string;
}

const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  docType,
  label,
  description,
  onUpload,
  uploadedFile,
  progress = 0,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(docType, file);
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Note: In a real implementation, you'd need to pass a remove function
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
        id={`file-${docType}`}
      />
      
      {!uploadedFile ? (
        <div className="text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-xs text-gray-600 mb-3">{description}</p>
          <label
            htmlFor={`file-${docType}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            Choose File
          </label>
          <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG up to 10MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(uploadedFile.size)}
              </p>
              {progress > 0 && progress < 100 && (
                <div className="mt-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
                </div>
              )}
              {progress === 100 && (
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">Uploaded successfully</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(URL.createObjectURL(uploadedFile), '_blank')}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Preview"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemoveFile}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadField;
