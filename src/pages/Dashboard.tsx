import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Gift, Wallet, Clock, ArrowUpRight, ArrowDownLeft, Award, BarChart3, Repeat, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import TransactionList from '../components/dashboard/TransactionList';
import { getUserDashboardStats, getFromStorage, getCurrentUser } from '../utils/localStorageService';
import { DashboardStats } from '../types';
import { formatCurrency, currencySymbol } from '../utils/currencyFormatter';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get the current logged in user ID
    const loggedInUserId = getFromStorage<string>('logged_in_user');
    const currentUser = getCurrentUser();
    
    if (loggedInUserId && currentUser) {
      // Get user-specific dashboard stats
      const userDashboardStats = getUserDashboardStats(loggedInUserId);
      setStats(userDashboardStats);
      setUserName(currentUser.name);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading || !stats) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600">Welcome back, {userName}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg p-4">
          <StatCard
            title="Total Earnings"
            icon={<Wallet className="h-5 w-5 text-success-500" />}
            value={formatCurrency(stats.totalEarnings)}
            change={{ value: 10, isPositive: true }}
          />
        </div>
        
        <StatCard
          title="Direct Referrals"
          value={stats.directReferrals}
          icon={<Users className="h-6 w-6" />}
          change={{ value: 50, isPositive: true }}
        />
        
        <StatCard
          title="Team Size"
          value={stats.teamSize}
          icon={<Users className="h-6 w-6" />}
          change={{ value: 33.3, isPositive: true }}
        />
        
        <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg p-4">
          <StatCard
            title="Pending Withdrawals"
            icon={<Clock className="h-5 w-5 text-warning-500" />}
            value={formatCurrency(stats.pendingWithdrawals)}
            change={{ value: 0, isPositive: false }}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2">
          <Card title="Earnings Overview" subtitle="Last 30 days">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.earningsTimeline}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => `${currencySymbol}${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Earnings"]}
                    labelFormatter={(label) => `Date: ${label}`}
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
        
        {/* Earnings Breakdown */}
        <div>
          <Card title="Value Life Income Types">
            <div className="space-y-4">
              <div className="p-3 flex items-center rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">Retail Profit</p>
                  <p className="text-xs text-neutral-500">10-20% on product sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success-600">
                    {formatCurrency(stats.earningsByType.retail_profit || 0)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 flex items-center rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">Referral Bonus</p>
                  <p className="text-xs text-neutral-500">₹3,000 per direct referral</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success-600">
                    {formatCurrency(stats.earningsByType.referral_bonus || 0)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 flex items-center rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="bg-accent-100 p-2 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-accent-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">Team Matching</p>
                  <p className="text-xs text-neutral-500">₹2,500 per pair (1:1)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success-600">
                    {formatCurrency(stats.earningsByType.team_matching || 0)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 flex items-center rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="bg-secondary-100 p-2 rounded-lg mr-3">
                  <Award className="h-5 w-5 text-secondary-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">Royalty Bonus</p>
                  <p className="text-xs text-neutral-500">2% of company turnover</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success-600">
                    {formatCurrency(stats.earningsByType.royalty_bonus || 0)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 flex items-center rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Repeat className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">Repurchase Bonus</p>
                  <p className="text-xs text-neutral-500">3% repurchase bonus</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success-600">
                    {formatCurrency(stats.earningsByType.repurchase_bonus || 0)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 flex items-center rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <Gift className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">Awards & Rewards</p>
                  <p className="text-xs text-neutral-500">Based on achievements</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success-600">
                    {formatCurrency(stats.earningsByType.award_reward || 0)}
                  </p>
                </div>
              </div>
              
              <div className="p-3 flex items-center rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="bg-neutral-100 p-2 rounded-lg mr-3">
                  <ArrowDownLeft className="h-5 w-5 text-neutral-600" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-neutral-800">Withdrawals</p>
                  <p className="text-xs text-neutral-500">Completed withdrawals</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-error-600">
                    {formatCurrency(Math.abs(stats.earningsByType.withdrawal || 0))}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="mt-6">
        <TransactionList transactions={stats.recentTransactions} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;