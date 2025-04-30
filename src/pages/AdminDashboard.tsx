import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, FileCheck, LogOut, DollarSign, Wallet, RefreshCw, IndianRupee } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AdminLayout from '../components/layout/AdminLayout';
import { getAllKycRequests, getAdminStats, getAllTransactions, getAllUsersForAdmin, KycRequest } from '../utils/localStorageService';
import { Transaction, User } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingKyc: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string;
    details: string;
    timestamp: string;
    timeAgo: string;
  }>>([]);

  // Check for admin authentication
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      loadDashboardData();
    }
  }, [navigate]);

  const loadDashboardData = () => {
    setIsRefreshing(true);
    
    // Get admin stats
    const adminStats = getAdminStats();
    const users = getAllUsersForAdmin();
    const kycRequests = getAllKycRequests();
    const transactions = getAllTransactions();
    
    // Prepare stats
    setStats({
      pendingKyc: adminStats.pendingKycRequests,
      totalUsers: adminStats.totalUsers,
      activeUsers: users.filter(user => user.kycStatus === 'approved').length,
      totalTransactions: adminStats.totalTransactions,
      totalEarnings: adminStats.totalEarnings,
      totalWithdrawals: adminStats.totalWithdrawals,
      pendingWithdrawals: adminStats.pendingWithdrawals
    });
    
    // Prepare recent activity
    const allActivities: Array<{
      type: string;
      details: string;
      timestamp: string;
      timeAgo: string;
    }> = [];
    
    // Add KYC requests to activities
    kycRequests.forEach((request: KycRequest) => {
      const user = users.find(u => u.id === request.userId);
      if (user) {
        allActivities.push({
          type: 'kyc',
          details: `User: ${user.name} (ID: ${user.id})`,
          timestamp: request.submissionDate,
          timeAgo: getTimeAgo(new Date(request.submissionDate))
        });
      }
    });
    
    // Add transactions to activities
    transactions.forEach((transaction: Transaction) => {
      const user = users.find(u => u.id === transaction.userId);
      if (user) {
        allActivities.push({
          type: transaction.type,
          details: `User: ${user.name} (ID: ${user.id}) - ${transaction.description}`,
          timestamp: transaction.date,
          timeAgo: getTimeAgo(new Date(transaction.date))
        });
      }
    });
    
    // Sort by timestamp (most recent first) and limit to 10
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(allActivities.slice(0, 10));
    
    setIsRefreshing(false);
  };
  
  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 30) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-600">Manage users, KYC approvals, and products</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-full text-primary-600 mr-4">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Pending KYC</p>
              <h3 className="text-xl font-bold text-neutral-900">{stats.pendingKyc}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-full text-secondary-600 mr-4">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Earnings</p>
              <h3 className="text-xl font-bold text-neutral-900">₹{stats.totalEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-full text-accent-600 mr-4">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Users</p>
              <h3 className="text-xl font-bold text-neutral-900">{stats.totalUsers}</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-full text-success-600 mr-4">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Pending Withdrawals</p>
              <h3 className="text-xl font-bold text-neutral-900">₹{stats.pendingWithdrawals.toFixed(2)}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => navigate('/admin/kyc')}
            leftIcon={<FileCheck className="h-5 w-5" />}
          >
            Manage KYC Approvals
            {stats.pendingKyc > 0 && (
              <span className="ml-2 bg-white text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {stats.pendingKyc} new
              </span>
            )}
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => navigate('/admin/products')}
            leftIcon={<Package className="h-5 w-5" />}
          >
            Manage Products
          </Button>
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => navigate('/admin/users')}
            leftIcon={<Users className="h-5 w-5" />}
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-b-0">
                <div>
                  <p className="text-neutral-900 font-medium">
                    {activity.type === 'kyc' && 'New KYC submission'}
                    {activity.type === 'referral_bonus' && 'Referral Bonus'}
                    {activity.type === 'level_commission' && 'Level Commission'}
                    {activity.type === 'milestone_reward' && 'Milestone Reward'}
                    {activity.type === 'withdrawal' && 'Withdrawal Request'}
                    {activity.type === 'withdrawal_reversal' && 'Withdrawal Reversal'}
                  </p>
                  <p className="text-xs text-neutral-500">{activity.details}</p>
                </div>
                <p className="text-xs text-neutral-500">{activity.timeAgo}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard; 