import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Wallet as WalletIcon, Clock, ArrowDown, ArrowUp, Filter, RefreshCw } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import TransactionList from '../components/dashboard/TransactionList';
import WithdrawFunds from '../components/wallet/WithdrawFunds';
import { 
  getUserWalletWithUpdatedBonuses, 
  getUserDashboardStats, 
  getUserTransactions, 
  getFromStorage, 
  getCurrentUser 
} from '../utils/localStorageService';
import { Wallet as WalletType, DashboardStats, Transaction, User } from '../types';
import KycRequired from '../components/auth/KycRequired';
import { formatCurrency, currencySymbol } from '../utils/currencyFormatter';
import { getUserWithdrawalRequests, WithdrawalRequest } from '../services/walletService';

const Wallet: React.FC = () => {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('transactions');
  
  const loadData = () => {
    setIsLoading(true);
    
    // Get current user
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // Get the current logged in user ID
    const loggedInUserId = user?.id || getFromStorage<string>('logged_in_user');
    
    if (loggedInUserId) {
      try {
        console.log('Loading wallet data for user:', loggedInUserId);
        
        // Force clear any cached data
        localStorage.removeItem('_temp_wallet_cache');
        
        // Get user-specific wallet data with updated referral bonuses
        const userWallet = getUserWalletWithUpdatedBonuses(loggedInUserId);
        const userDashboardStats = getUserDashboardStats(loggedInUserId);
        const userTransactions = getUserTransactions(loggedInUserId);
        const userWithdrawalRequests = getUserWithdrawalRequests(loggedInUserId);
        
        console.log('Loaded wallet data:', {
          balance: userWallet.balance,
          transactions: userTransactions.length,
          withdrawalRequests: userWithdrawalRequests.length
        });
        
        setWallet(userWallet);
        setStats(userDashboardStats);
        setTransactions(userTransactions);
        setWithdrawalRequests(userWithdrawalRequests);
      } catch (error) {
        console.error('Error loading wallet data:', error);
      }
    }
    
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleWithdrawalSuccess = () => {
    setShowWithdrawForm(false);
    loadData();
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    if (filterStatus === 'all') return true;
    return transaction.status === filterStatus;
  });
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }
  
  // Check KYC status
  if (currentUser && currentUser.kycStatus !== 'approved') {
    return (
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Wallet</h1>
          <p className="text-neutral-600">Manage your earnings and withdrawals</p>
        </div>
        
        <KycRequired featureName="Wallet" />
      </MainLayout>
    );
  }
  
  if (!wallet || !stats) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-neutral-600">Wallet data not available</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Wallet</h1>
          <p className="text-neutral-600">Manage your earnings and withdrawals</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button
            variant="outline"
            onClick={loadData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            leftIcon={showWithdrawForm ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          >
            {showWithdrawForm ? 'Hide Withdrawal Form' : 'Withdraw Funds'}
          </Button>
        </div>
      </div>
      
      {/* Wallet Balance Card */}
      <div className="mb-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
            <WalletIcon className="w-full h-full" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-neutral-700">Available Balance</h2>
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-bold text-neutral-900">{formatCurrency(wallet.balance)}</span>
                {stats.pendingWithdrawals > 0 && (
                  <span className="ml-4 text-sm text-neutral-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatCurrency(stats.pendingWithdrawals)} pending
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Total Earned</p>
                <p className="mt-1 text-xl font-semibold text-success-600">
                  +{formatCurrency(stats.totalEarnings)}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Total Withdrawn</p>
                <p className="mt-1 text-xl font-semibold text-warning-600">
                  -{formatCurrency(stats.completedWithdrawals)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Withdrawal Form */}
      {showWithdrawForm && (
        <div className="mb-6 animate-slide-down">
          <WithdrawFunds 
            walletBalance={wallet.balance} 
            onSuccess={handleWithdrawalSuccess} 
          />
        </div>
      )}
      
      {/* Earnings Chart */}
      <div className="mb-6">
        <Card title="Earnings History">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.earningsTimeline}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E4" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6C6C6C" />
                <YAxis 
                  tickFormatter={(value) => `${currencySymbol}${value}`} 
                  tick={{ fontSize: 12 }} 
                  stroke="#6C6C6C" 
                />
                <Tooltip
                  formatter={(value) => [`${formatCurrency(value as number)}`, "Earnings"]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #E4E4E4",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0F52BA"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Transactions & Withdrawals Tabs */}
      <div className="mb-4 border-b border-neutral-200">
        <div className="flex space-x-4">
          <button 
            className={`py-2 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'transactions' 
                ? 'border-primary-600 text-primary-700' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            Transaction History
          </button>
          <button 
            className={`py-2 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'withdrawals' 
                ? 'border-primary-600 text-primary-700' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawal Requests
          </button>
        </div>
      </div>
      
      {activeTab === 'transactions' ? (
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-neutral-900">Transaction History</h3>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-neutral-600">
                <Filter className="h-4 w-4 inline mr-1" />
                Filter:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="p-1 text-sm border border-neutral-300 rounded-md bg-white"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <TransactionList transactions={filteredTransactions} showTitle={false} />
          {filteredTransactions.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-neutral-500">No transactions found</p>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-neutral-900">Withdrawal Requests</h3>
          </div>
          
          {withdrawalRequests.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-neutral-500">No withdrawal requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Bank Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {withdrawalRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(request.requestDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-semibold text-neutral-800">
                          ₹{request.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {request.accountDetails.bankName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          A/C: {request.accountDetails.accountNumber.replace(/(\d{4})(\d+)(\d{4})/, '$1****$3')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                          request.status === 'approved' ? 'bg-info-100 text-info-800' :
                          request.status === 'rejected' ? 'bg-error-100 text-error-800' :
                          'bg-success-100 text-success-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.processedDate && (
                          <div className="text-xs text-neutral-500 mt-1">
                            {new Date(request.processedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </MainLayout>
  );
};

export default Wallet;