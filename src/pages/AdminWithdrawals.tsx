import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, AlertTriangle, Eye, DollarSign, CreditCard, RefreshCw } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { getWithdrawalRequests, updateWithdrawalStatus, WithdrawalRequest } from '../services/walletService';
import { processPayout, getRazorpayBalance } from '../services/razorpayService';
import toast from 'react-hot-toast';

const AdminWithdrawals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [razorpayBalance, setRazorpayBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load withdrawal requests and Razorpay balance
  const loadData = async () => {
    // Check for admin authentication
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }

    // Load withdrawal requests
    const requests = getWithdrawalRequests();
    setWithdrawalRequests(requests);
    
    // Load Razorpay balance
    loadRazorpayBalance();
  };
  
  const loadRazorpayBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const balance = await getRazorpayBalance();
      setRazorpayBalance(balance);
    } catch (error) {
      console.error('Error loading Razorpay balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApproveRequest = async (request: WithdrawalRequest) => {
    // Update request status to approved
    const success = updateWithdrawalStatus(request.id, 'approved', 'Approved by admin');
    if (success) {
      toast.success(`Request approved for ${request.userName}`);
      loadData();
    } else {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (request: WithdrawalRequest) => {
    // Update request status to rejected
    const success = updateWithdrawalStatus(request.id, 'rejected', 'Rejected by admin');
    if (success) {
      toast.success(`Request rejected for ${request.userName}`);
      loadData();
    } else {
      toast.error('Failed to reject request');
    }
  };

  const handleProcessPayment = async (request: WithdrawalRequest) => {
    setIsProcessing(true);

    try {
      toast.loading("Initializing Razorpay payment gateway...");
      
      // Process the payout using Razorpay (this will open the Razorpay checkout UI)
      const result = await processPayout(request);
      
      toast.dismiss(); // Remove loading toast
      
      if (result.success && result.data) {
        // Update withdrawal request status
        const updateSuccess = updateWithdrawalStatus(
          request.id,
          'paid',
          'Processed through Razorpay',
          result.data.id
        );
        
        if (updateSuccess) {
          toast.success(`Payment of ₹${request.amount} processed successfully to ${request.accountDetails.accountHolderName}`);
          setShowDetailsModal(false);
          loadData();
        } else {
          toast.error('Failed to update withdrawal status');
        }
      } else {
        toast.error(`Payment failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.dismiss(); // Remove loading toast
      console.error('Error processing payment:', error);
      
      if (error instanceof Error && error.message === "Payment cancelled by user") {
        toast.error("Payment cancelled by user");
      } else {
        toast.error('Payment processing failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      case 'paid':
        return 'bg-primary-100 text-primary-800';
      case 'pending':
      default:
        return 'bg-warning-100 text-warning-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-error-600" />;
      case 'paid':
        return <CreditCard className="h-4 w-4 text-primary-600" />;
      case 'pending':
      default:
        return <AlertTriangle className="h-4 w-4 text-warning-600" />;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Withdrawal Requests</h1>
        <p className="text-neutral-600">Manage and process user withdrawal requests</p>
      </div>

      {/* Balance and Controls */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-neutral-600">Razorpay Account Balance:</span>
              {isLoadingBalance ? (
                <span className="text-sm text-neutral-500">Loading...</span>
              ) : (
                <span className="text-lg font-semibold text-success-600">
                  ₹{(razorpayBalance !== null ? razorpayBalance / 100 : 0).toLocaleString('en-IN')}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRazorpayBalance}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-neutral-600">Status:</label>
              <select
                value={filterStatus}
                onChange={handleStatusFilter}
                className="rounded-md border-neutral-300 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 text-sm w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Withdrawal Requests Table */}
      <Card title="Withdrawal Requests">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Bank Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-neutral-900">
                      {request.userName}
                    </div>
                    <div className="text-xs text-neutral-500">
                      ID: {request.userId.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-neutral-800">
                      ₹{request.amount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-600">
                      {request.accountDetails.bankName}
                    </div>
                    <div className="text-xs text-neutral-500">
                      A/C: {request.accountDetails.accountNumber.replace(/(\d{4})(\d+)(\d{4})/, '$1****$3')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(request.requestDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        leftIcon={<Eye className="h-4 w-4" />}
                      >
                        Details
                      </Button>
                      
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success-600 hover:text-success-800 hover:bg-success-50"
                            onClick={() => handleApproveRequest(request)}
                            leftIcon={<CheckCircle className="h-4 w-4" />}
                          >
                            Approve
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error-600 hover:text-error-800 hover:bg-error-50"
                            onClick={() => handleRejectRequest(request)}
                            leftIcon={<XCircle className="h-4 w-4" />}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {request.status === 'approved' && (
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="text-primary-600 hover:text-primary-800 hover:bg-primary-50"
                          onClick={() => handleProcessPayment(request)}
                          leftIcon={<DollarSign className="h-4 w-4" />}
                        >
                          Pay via Razorpay
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                    No withdrawal requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Withdrawal Request Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-600">Request ID:</span>
                    <span className="text-sm text-neutral-800">{selectedRequest.id}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-600">User:</span>
                    <span className="text-sm text-neutral-800">{selectedRequest.userName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-600">Amount:</span>
                    <span className="text-lg font-semibold text-neutral-800">₹{selectedRequest.amount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="bg-info-50 p-2 mb-2 rounded text-info-800 text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Please check user's current wallet balance before approving this request.
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-600">Request Date:</span>
                    <span className="text-sm text-neutral-800">{formatDate(selectedRequest.requestDate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-600">Status:</span>
                    <div className="flex items-center">
                      {getStatusIcon(selectedRequest.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-neutral-800 mb-3">Bank Account Details</h4>
                  
                  <div className="bg-warning-50 p-2 mb-3 rounded text-warning-800 text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Please verify these bank details carefully before processing payment.
                  </div>

                  <div className="bg-info-50 p-2 mb-3 rounded text-info-800 text-sm">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Clicking "Process via Razorpay" will open the Razorpay payment interface to transfer funds.
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-600">Account Holder:</span>
                      <span className="text-sm text-neutral-800">{selectedRequest.accountDetails.accountHolderName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-600">Bank:</span>
                      <span className="text-sm text-neutral-800">{selectedRequest.accountDetails.bankName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-600">Account Number:</span>
                      <span className="text-sm text-neutral-800">{selectedRequest.accountDetails.accountNumber}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-600">IFSC:</span>
                      <span className="text-sm text-neutral-800">{selectedRequest.accountDetails.ifscCode}</span>
                    </div>
                  </div>
                </div>
                
                {selectedRequest.processedDate && (
                  <div className="border border-neutral-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-neutral-800 mb-3">Processing Details</h4>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-neutral-600">Processed Date:</span>
                        <span className="text-sm text-neutral-800">{formatDate(selectedRequest.processedDate)}</span>
                      </div>
                      
                      {selectedRequest.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-600">Transaction ID:</span>
                          <span className="text-sm text-neutral-800">{selectedRequest.transactionId}</span>
                        </div>
                      )}
                      
                      {selectedRequest.remarks && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-neutral-600">Remarks:</span>
                          <span className="text-sm text-neutral-800">{selectedRequest.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectRequest(selectedRequest)}
                      leftIcon={<XCircle className="h-4 w-4" />}
                    >
                      Reject
                    </Button>
                    
                    <Button
                      variant="primary"
                      onClick={() => handleApproveRequest(selectedRequest)}
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                    >
                      Approve
                    </Button>
                  </>
                )}
                
                {selectedRequest.status === 'approved' && (
                  <Button
                    variant="primary"
                    onClick={() => handleProcessPayment(selectedRequest)}
                    isLoading={isProcessing}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                  >
                    Process via Razorpay
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWithdrawals; 