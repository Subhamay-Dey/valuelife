import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye, FileQuestion, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { KYCStatus } from '../../types';
import localStorageService, { KycSubmission } from '../../utils/localStorageService';

interface KycUploaderProps {
  documentType: 'idProof' | 'addressProof' | 'bankDetails';
  documentTitle: string;
  documentDescription: string;
  status?: KYCStatus | null;
  existingDocument?: string; // Can be a URL or base64 data
  existingDocumentName?: string; // Document filename
  rejectionReason?: string;
  onUpload?: (file: File) => void;
  showHistory?: boolean;
}

const KycUploader: React.FC<KycUploaderProps> = ({
  documentType,
  documentTitle,
  documentDescription,
  status,
  existingDocument,
  existingDocumentName,
  rejectionReason,
  onUpload,
  showHistory = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [submissionHistory, setSubmissionHistory] = useState<KycSubmission[]>([]);
  
  React.useEffect(() => {
    // Load submission history on component mount
    if (showHistory) {
      const history = localStorageService.getKycSubmissionHistory();
      const documentHistory = history.filter(item => item.documentType === documentType);
      setSubmissionHistory(documentHistory);
    }
  }, [documentType, showHistory]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Create preview for images
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(droppedFile);
      } else {
        setPreview(null);
      }
    }
  };
  
  const handleSubmit = () => {
    if (file) {
      // Track submission in history
      const newSubmission: KycSubmission = {
        documentType,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      
      localStorageService.addKycSubmission(newSubmission);
      
      // If showing history, update local state too
      if (showHistory) {
        setSubmissionHistory(prev => [...prev, newSubmission]);
      }
      
      onUpload(file);
      // Keep the preview but reset the file
      setFile(null);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const renderStatusIndicator = () => {
    if (!status) {
      return (
        <div className="flex items-center text-neutral-600">
          <FileQuestion className="h-5 w-5 mr-2" />
          <span>Not yet uploaded</span>
        </div>
      );
    }
    
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center text-success-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div>
            <div className="flex items-center text-error-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Rejected</span>
            </div>
            {rejectionReason && (
              <p className="mt-1 text-sm text-error-600">{rejectionReason}</p>
            )}
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-warning-600">
            <FileText className="h-5 w-5 mr-2" />
            <span>Under Review</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine if the existingDocument is a base64 string
  const isBase64Document = existingDocument?.startsWith('data:');
  
  // Get a display name for the document
  const getDocumentDisplayName = () => {
    if (existingDocumentName) {
      return existingDocumentName;
    }
    
    if (typeof existingDocument === 'string') {
      if (isBase64Document) {
        return `${documentType.charAt(0).toUpperCase() + documentType.slice(1)}.jpg`;
      }
      
      return existingDocument.includes('/') 
        ? existingDocument.split('/').pop() 
        : existingDocument;
    }
    
    return "Document uploaded";
  };
  
  // Document preview component
  const DocumentPreview = ({ src }: { src: string }) => {
    if (!src) return null;
    
    if (src.includes('pdf')) {
      return (
        <div className="flex items-center justify-center bg-neutral-100 p-4 rounded-md">
          <FileText className="h-8 w-8 text-neutral-500" />
          <span className="ml-2 text-sm">PDF Document</span>
        </div>
      );
    }
    
    return (
      <img 
        src={src} 
        alt="Document preview" 
        className="max-h-32 rounded-md mx-auto object-contain" 
      />
    );
  };
  
  return (
    <Card title={documentTitle}>
      <p className="text-neutral-600 mb-4">{documentDescription}</p>
      
      {/* Status indicator */}
      <div className="mb-4">
        {renderStatusIndicator()}
      </div>
      
      {/* Submission history */}
      {showHistory && submissionHistory.length > 0 && (
        <div className="mb-4 border rounded-lg overflow-hidden">
          <div className="bg-neutral-100 px-4 py-2 font-medium">
            Submission History
          </div>
          <div className="p-2 max-h-48 overflow-y-auto">
            {submissionHistory.map((submission, index) => (
              <div key={index} className="p-2 border-b last:border-b-0 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>
                      {new Date(submission.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    {submission.status === 'approved' && (
                      <span className="text-success-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approved
                      </span>
                    )}
                    {submission.status === 'rejected' && (
                      <span className="text-error-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Rejected
                      </span>
                    )}
                    {submission.status === 'pending' && (
                      <span className="text-warning-600 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                {submission.reviewedAt && (
                  <div className="mt-1 text-xs text-neutral-500">
                    Reviewed: {new Date(submission.reviewedAt).toLocaleString()}
                  </div>
                )}
                {submission.notes && (
                  <div className="mt-1 text-xs">
                    {submission.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* File upload area */}
      {(!status || status === 'rejected') && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center hover:bg-neutral-50 transition-colors ${
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf"
          />
          <Upload className="mx-auto h-10 w-10 text-neutral-400 mb-2" />
          <p className="font-medium">
            {status === 'rejected' ? 'Upload a new document' : 'Upload your document'}
          </p>
          <p className="text-sm text-neutral-500">
            Supported formats: JPG, PNG, PDF (max 5MB)
          </p>
        </div>
      )}
      
      {/* File preview */}
      {(file || preview) && (
        <div className="mb-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary-600 mr-2" />
                <span className="font-medium text-neutral-800">{file?.name || "Document uploaded"}</span>
              </div>
              <button
                className="text-neutral-500 hover:text-error-600"
                onClick={clearFile}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {preview && (
              <div className="mt-2 relative">
                <img 
                  src={preview} 
                  alt="Document preview" 
                  className="max-h-32 rounded-md mx-auto"
                />
              </div>
            )}
            
            <div className="text-xs text-neutral-500 mt-2">
              {file && `${(file.size / 1024 / 1024).toFixed(2)} MB`}
            </div>
          </div>
        </div>
      )}
      
      {file && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>
            Upload Document
          </Button>
        </div>
        
        
      )}
      <div className="mb-4">
  <label className="block mb-1 font-medium text-sm text-neutral-700">
    Or Enter manually:
  </label>
  <input
    type="text"
    placeholder="Enter document number or details"
    className="block w-full rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
</div>
      
      {/* For documents already uploaded and pending/approved */}
      {status && status !== 'rejected' && existingDocument && (
        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-primary-600 mr-2" />
              <span className="font-medium text-neutral-800">
                {getDocumentDisplayName()}
              </span>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              leftIcon={<Eye className="h-4 w-4" />}
              onClick={() => {
                if (isBase64Document) {
                  // Open base64 image in a new tab
                  const newWindow = window.open();
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head>
                          <title>Document Preview</title>
                          <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
                            img { max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 4px; }
                          </style>
                        </head>
                        <body>
                          <img src="${existingDocument}" alt="Document Preview" />
                        </body>
                      </html>
                    `);
                  }
                } else {
                  window.open(existingDocument, '_blank');
                }
              }}
            >
              View
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default KycUploader;