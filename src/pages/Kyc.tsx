import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import { FileCheck, AlertTriangle, CheckCircle, Lock, Upload, Check, ArrowRight } from 'lucide-react';
import KycUploader from '../components/kyc/KycUploader';
import { saveFile, getAllFiles, FILE_STORAGE_KEYS, StoredFile } from '../utils/fileStorage';
import { 
  getCurrentUser, 
  updateCurrentUser, 
  addKycRequest, 
  getUserData, 
  getKycDocuments, 
  saveLastKycStatus,
  getKycSubmissionHistory,
  KycSubmission,
  addKycSubmission
} from '../utils/localStorageService';
import { v4 as uuidv4 } from 'uuid';
import { KYCStatus } from '../types';
import Button from '../components/ui/Button';

interface KycDocuments {
  idProof?: StoredFile | null;
  addressProof?: StoredFile | null;
  bankDetails?: StoredFile | null;
}

const Kyc: React.FC = () => {
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [documents, setDocuments] = useState<KycDocuments>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [kycRequestCreated, setKycRequestCreated] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [submissionHistory, setSubmissionHistory] = useState<KycSubmission[]>([]);
  
  // Load user data and KYC documents on component mount
  useEffect(() => {
    const loadUserData = () => {
      const user = getCurrentUser();
      if (user) {
        // Check if KYC status has changed since last visit
        const previousStatus = localStorage.getItem('last_kyc_status');
        const currentStatus = user.kycStatus || 'pending';
        
        if (previousStatus && previousStatus !== currentStatus) {
          // Alert user about status change
          if (currentStatus === 'approved') {
            alert('Good news! Your KYC verification has been approved.');
          } else if (currentStatus === 'rejected') {
            alert('Your KYC verification was rejected. Please check the details and resubmit.');
          }
        }
        
        // Save current status for next comparison
        localStorage.setItem('last_kyc_status', currentStatus);
        setKycStatus(currentStatus);
        
        // If KYC request was already created previously
        if (currentStatus === 'pending' && user.kycDocuments?.idProof) {
          setKycRequestCreated(true);
        }
      }
      
      // Load documents from local storage
      const idProofFiles = getAllFiles(FILE_STORAGE_KEYS.KYC_ID_PROOF);
      const addressProofFiles = getAllFiles(FILE_STORAGE_KEYS.KYC_ADDRESS_PROOF);
      const bankDetailsFiles = getAllFiles(FILE_STORAGE_KEYS.KYC_BANK_DETAILS);
      
      // Get the most recent file of each type
      setDocuments({
        idProof: idProofFiles.length > 0 ? idProofFiles[idProofFiles.length - 1] : null,
        addressProof: addressProofFiles.length > 0 ? addressProofFiles[addressProofFiles.length - 1] : null,
        bankDetails: bankDetailsFiles.length > 0 ? bankDetailsFiles[bankDetailsFiles.length - 1] : null
      });
      
      setIsLoading(false);
    };
    
    loadUserData();
  }, []);
  
  useEffect(() => {
    // Load user data and KYC documents
    const user = getUserData();
    setUserData(user);
    
    const kycDocs = getKycDocuments() || [];
    // Convert kycDocs to the expected KycDocuments type format
    const formattedDocs: KycDocuments = {};
    if (Array.isArray(kycDocs) && kycDocs.length > 0) {
      // Process the array and extract the relevant documents
      kycDocs.forEach((doc: any) => {
        if (doc.type === 'idProof' && doc.file) {
          formattedDocs.idProof = doc.file;
        } else if (doc.type === 'addressProof' && doc.file) {
          formattedDocs.addressProof = doc.file;
        } else if (doc.type === 'bankDetails' && doc.file) {
          formattedDocs.bankDetails = doc.file;
        }
      });
    }
    setDocuments(formattedDocs);
    
    // Check for status change
    const lastStatus = localStorage.getItem('lastKycStatus');
    if (user && user.kycStatus && lastStatus && user.kycStatus !== lastStatus) {
      const message = user.kycStatus === 'approved' 
        ? 'Your KYC verification has been approved!'
        : user.kycStatus === 'rejected'
        ? 'Your KYC verification was rejected. Please check the feedback and resubmit.'
        : 'Your KYC status has been updated.';
      
      alert(message);
    }
    
    // Save current status for future comparison
    if (user && user.kycStatus) {
      saveLastKycStatus(user.kycStatus);
    }
    
    // Get submission history using our new function
    const history = getKycSubmissionHistory();
    setSubmissionHistory(history);
    
    setIsLoading(false);
  }, []);
  
  const handleDocumentUpload = async (docType: string, file: File) => {
    try {
      // Save file to local storage
      let storedFile: StoredFile;
      let storageKey: string;
      
      switch (docType) {
        case 'idProof':
          storageKey = FILE_STORAGE_KEYS.KYC_ID_PROOF;
          break;
        case 'addressProof':
          storageKey = FILE_STORAGE_KEYS.KYC_ADDRESS_PROOF;
          break;
        case 'bankDetails':
          storageKey = FILE_STORAGE_KEYS.KYC_BANK_DETAILS;
          break;
        default:
          throw new Error(`Unknown document type: ${docType}`);
      }
      
      storedFile = await saveFile(file, storageKey);
      
      // Update documents state with new file
      setDocuments(prev => ({
        ...prev,
        [docType]: storedFile
      }));
      
      // Add submission to history
      const newSubmission: KycSubmission = {
        documentType: docType,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      addKycSubmission(newSubmission);
      setSubmissionHistory(prev => [...prev, newSubmission]);
      
      // Set KYC status to pending if it was rejected
      if (kycStatus === 'rejected') {
        setKycStatus('pending');
        
        // Update user KYC status in local storage
        const user = getCurrentUser();
        if (user) {
          updateCurrentUser({
            ...user,
            kycStatus: 'pending'
          });
        }
      }
      
      // Close the active section after successful upload
      setActiveSection(null);
      
      console.log(`Uploaded ${docType}:`, file.name);
    } catch (error) {
      console.error(`Error uploading ${docType}:`, error);
      alert(`Failed to upload document. Please try again.`);
    }
  };
  
  const getTotalDocumentsUploaded = () => {
    let count = 0;
    if (documents.idProof) count++;
    if (documents.addressProof) count++;
    if (documents.bankDetails) count++;
    return count;
  };
  
  const allDocumentsUploaded = documents.idProof && documents.addressProof && documents.bankDetails;
  
  const handleSubmitKycRequest = () => {
    if (!allDocumentsUploaded) {
      alert('Please upload all required documents before submitting.');
      return;
    }
    
    // Create a KYC request for admin review
    const user = getCurrentUser();
    if (user) {
      // Update user KYC status in local storage
      updateCurrentUser({
        ...user,
        kycStatus: 'pending',
        kycDocuments: {
          idProof: documents.idProof?.name || '',
          addressProof: documents.addressProof?.name || '',
          bankDetails: documents.bankDetails?.name || ''
        }
      });
      
      // Create a KYC request for admin
      const kycRequest = {
        id: uuidv4(),
        userId: user.id,
        userName: user.name,
        documents: {
          idProof: documents.idProof?.base64 || '',
          addressProof: documents.addressProof?.base64 || '',
          bankDetails: documents.bankDetails?.base64 || ''
        },
        status: 'pending' as KYCStatus,
        submissionDate: new Date().toISOString()
      };
      
      addKycRequest(kycRequest);
      setKycRequestCreated(true);
      setShowSuccessMessage(true);
      
      // Record submissions in history for all document types if not already there
      const currentTime = new Date().toISOString();
      const documentTypes = ['idProof', 'addressProof', 'bankDetails'];
      
      // Check existing submissions to avoid duplicates
      const existingTypes = submissionHistory.map(s => s.documentType);
      
      documentTypes.forEach(docType => {
        // Only add to history if this is a new submission or existing one was rejected
        const existingSubmission = submissionHistory.find(s => 
          s.documentType === docType && s.status === 'pending'
        );
        
        if (!existingSubmission) {
          const newSubmission: KycSubmission = {
            documentType: docType,
            status: 'pending',
            submittedAt: currentTime
          };
          
          addKycSubmission(newSubmission);
          
          // Update local state
          setSubmissionHistory(prev => [...prev, newSubmission]);
        }
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      console.log("KYC request created and sent to admin:", kycRequest.id);
    }
  };
  
  const handleStartKyc = (section: string) => {
    setActiveSection(section);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-neutral-600">Loading KYC information...</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">KYC Verification</h1>
        <p className="text-neutral-600">Verify your identity to unlock full platform features</p>
      </div>
      
      {/* Feature Access Notification */}
      {kycStatus !== 'approved' && (
        <div className="mb-6">
          <Card>
            <div className="flex items-start">
              <div className="p-3 rounded-full mr-4 flex-shrink-0 bg-primary-100 text-primary-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">KYC Verification Required</h3>
                <p className="mt-1 text-neutral-600">
                  Your KYC verification must be approved to access these features:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-neutral-600">
                  <li>My Network - View and manage your referral network</li>
                  <li>Wallet - Access earnings and manage withdrawals</li>
                  <li>Referral Tools - Promote and grow your network</li>
                </ul>
                <p className="mt-2 text-sm text-primary-600 font-medium">
                  Complete your KYC verification below to gain full access to all platform features.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* KYC Status Card */}
      <div className="mb-6">
        <Card>
          <div className="flex items-start">
            <div className={`
              p-3 rounded-full mr-4 flex-shrink-0
              ${kycStatus === 'approved' ? 'bg-success-100 text-success-600' : 
                kycStatus === 'rejected' ? 'bg-error-100 text-error-600' : 
                'bg-warning-100 text-warning-600'}
            `}>
              {kycStatus === 'approved' ? (
                <CheckCircle className="h-6 w-6" />
              ) : kycStatus === 'rejected' ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <FileCheck className="h-6 w-6" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                KYC Status: {' '}
                <span className={
                  kycStatus === 'approved' ? 'text-success-600' : 
                  kycStatus === 'rejected' ? 'text-error-600' : 
                  'text-warning-600'
                }>
                  {kycStatus === 'approved' ? 'Approved' : 
                   kycStatus === 'rejected' ? 'Rejected' : 
                   'Pending'}
                </span>
              </h3>
              
              <p className="mt-1 text-neutral-600">
                {kycStatus === 'approved' ? 
                  'Your KYC verification has been approved. You now have full access to all platform features.' : 
                 kycStatus === 'rejected' ? 
                  'Your KYC verification was rejected. Please check the reason below and resubmit the required documents.' : 
                  kycRequestCreated ? 
                    'Your KYC documents are under review. This process usually takes 1-2 business days.' :
                    'Please upload all required documents and submit for verification.'}
              </p>
              
              {kycStatus === 'rejected' && (
                <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-md">
                  <p className="text-sm text-error-700">
                    <strong>Reason for rejection:</strong> The uploaded documents were unclear or incomplete. Please upload clear, high-resolution images of your documents.
                  </p>
                </div>
              )}
              
              {!kycRequestCreated && (
                <div className="mt-3">
                  <div className="bg-neutral-100 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Verification Progress: </span>
                        <span className="text-sm font-bold">{getTotalDocumentsUploaded()}/3 documents uploaded</span>
                      </div>
                      <div className="w-32 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${(getTotalDocumentsUploaded() / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Success message when documents are submitted */}
              {showSuccessMessage && (
                <div className="mt-3 p-3 bg-success-50 border border-success-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                    <p className="text-sm text-success-700">
                      <strong>Success!</strong> Your KYC documents have been submitted for review. You'll be notified once the verification is complete.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Document Upload Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Document Verification</h2>
        
        {!kycRequestCreated && kycStatus !== 'approved' && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Identity Proof Section */}
            <div>
              {activeSection === 'idProof' ? (
                <KycUploader
                  documentType="idProof"
                  documentTitle="Identity Proof"
                  documentDescription="Upload a government-issued ID (passport, driver's license, etc.)"
                  status={documents.idProof ? 'pending' : null as any}
                  existingDocument={documents.idProof?.base64}
                  existingDocumentName={documents.idProof?.name}
                  rejectionReason={kycStatus === 'rejected' ? "The document was blurry or incomplete" : undefined}
                  onUpload={(file) => handleDocumentUpload('idProof', file)}
                  showHistory={true}
                />
              ) : (
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${documents.idProof ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        {documents.idProof ? (
                          <Check className="h-5 w-5 text-success-600" />
                        ) : (
                          <Upload className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Identity Proof</h3>
                        <p className="text-sm text-neutral-600">
                          {documents.idProof ? 
                            `Uploaded: ${documents.idProof.name}` : 
                            'Government-issued ID (passport, driver\'s license)'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={documents.idProof ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleStartKyc('idProof')}
                    >
                      {documents.idProof ? 'Replace' : 'Upload'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Address Proof Section */}
            <div>
              {activeSection === 'addressProof' ? (
                <KycUploader
                  documentType="addressProof"
                  documentTitle="Address Proof"
                  documentDescription="Upload a utility bill or bank statement (not older than 3 months)"
                  status={documents.addressProof ? 'pending' : null as any}
                  existingDocument={documents.addressProof?.base64}
                  existingDocumentName={documents.addressProof?.name}
                  rejectionReason={kycStatus === 'rejected' ? "The document was expired or too old" : undefined}
                  onUpload={(file) => handleDocumentUpload('addressProof', file)}
                  showHistory={true}
                />
              ) : (
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${documents.addressProof ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        {documents.addressProof ? (
                          <Check className="h-5 w-5 text-success-600" />
                        ) : (
                          <Upload className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Address Proof</h3>
                        <p className="text-sm text-neutral-600">
                          {documents.addressProof ? 
                            `Uploaded: ${documents.addressProof.name}` : 
                            'Utility bill or bank statement (not older than 3 months)'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={documents.addressProof ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleStartKyc('addressProof')}
                    >
                      {documents.addressProof ? 'Replace' : 'Upload'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Bank Details Section */}
            <div>
              {activeSection === 'bankDetails' ? (
                <KycUploader
                  documentType="bankDetails"
                  documentTitle="Bank Account Details"
                  documentDescription="Upload a cancelled check or bank statement showing your account details"
                  status={documents.bankDetails ? 'pending' : null as any}
                  existingDocument={documents.bankDetails?.base64}
                  existingDocumentName={documents.bankDetails?.name}
                  rejectionReason={kycStatus === 'rejected' ? "The account details were not clearly visible" : undefined}
                  onUpload={(file) => handleDocumentUpload('bankDetails', file)}
                />
              ) : (
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${documents.bankDetails ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        {documents.bankDetails ? (
                          <Check className="h-5 w-5 text-success-600" />
                        ) : (
                          <Upload className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Bank Account Details</h3>
                        <p className="text-sm text-neutral-600">
                          {documents.bankDetails ? 
                            `Uploaded: ${documents.bankDetails.name}` : 
                            'Cancelled check or bank statement showing your account details'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={documents.bankDetails ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleStartKyc('bankDetails')}
                    >
                      {documents.bankDetails ? 'Replace' : 'Upload'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {/* Already submitted documents in review status */}
        {kycRequestCreated && kycStatus !== 'approved' && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card>
              <div className="p-4 rounded-lg bg-warning-50 mb-4">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-warning-600 mr-2" />
                  <p className="text-warning-700 font-medium">Your documents are under review</p>
                </div>
                <p className="text-sm text-warning-600 mt-1">Please check back later for updates on your verification status.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-800">Identity Proof</h3>
                  <div className="flex items-center mt-2 text-warning-600">
                    <FileCheck className="h-4 w-4 mr-1" />
                    <span className="text-sm">Under Review</span>
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-800">Address Proof</h3>
                  <div className="flex items-center mt-2 text-warning-600">
                    <FileCheck className="h-4 w-4 mr-1" />
                    <span className="text-sm">Under Review</span>
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-800">Bank Account Details</h3>
                  <div className="flex items-center mt-2 text-warning-600">
                    <FileCheck className="h-4 w-4 mr-1" />
                    <span className="text-sm">Under Review</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Submit Button */}
        {!kycRequestCreated && allDocumentsUploaded && kycStatus !== 'approved' && (
          <div className="flex justify-center mt-6 mb-8">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleSubmitKycRequest}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Submit Documents for Verification
            </Button>
          </div>
        )}
      </div>
      
      {/* KYC Information */}
      <div>
        <Card
          title="KYC Requirements"
          icon={<AlertTriangle className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-neutral-900">Why is KYC required?</h4>
              <p className="mt-1 text-sm text-neutral-600">
                KYC (Know Your Customer) verification is required to ensure platform security,
                prevent fraud, and comply with financial regulations.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900">Document Guidelines</h4>
              <ul className="mt-1 text-sm text-neutral-600 list-disc list-inside space-y-1">
                <li>Documents must be valid and not expired</li>
                <li>All corners and information must be clearly visible</li>
                <li>Files must be in JPG, PNG, or PDF format, max 5MB in size</li>
                <li>Address proof must be recent (issued within the last 3 months)</li>
                <li>Bank details must clearly show your account number and name</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-900">Processing Time</h4>
              <p className="mt-1 text-sm text-neutral-600">
                KYC verification typically takes 1-2 business days. You'll be notified once
                the verification is complete.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {submissionHistory.length > 0 && (
        <div className="mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Submission History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Document Type</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Review Date</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissionHistory.map((submission, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{formatDate(submission.submittedAt)}</td>
                      <td className="px-4 py-2 capitalize">{submission.documentType}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {submission.reviewedAt ? formatDate(submission.reviewedAt) : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {submission.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

export default Kyc;