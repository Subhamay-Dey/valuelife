import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Globe, CreditCard, BarChart, Save, Bell, Key } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { updateAdminCredentials, getFromStorage } from '../utils/localStorageService';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentialsChanged, setCredentialsChanged] = useState(false);
  
  // System settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Value Life',
    contactEmail: 'admin@valuelife.in',
    supportPhone: '+91 1234567890',
    maintenanceMode: false,
    allowRegistration: true
  });
  
  const [commissionSettings, setCommissionSettings] = useState({
    directReferralBonus: 3000,
    matchingBonus: 2500,
    royaltyBonus: 2,
    repurchaseBonus: 3
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    minimumWithdrawal: 500,
    withdrawalFee: 0,
    taxRate: 5,
    adminCharges: 10
  });

  // Admin credentials state
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [adminCredentialsError, setAdminCredentialsError] = useState<string | null>(null);
  const [adminCredentialsSuccess, setAdminCredentialsSuccess] = useState<string | null>(null);

  // Check for admin authentication
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      // Set current admin username
      const currentUsername = getFromStorage<string>('admin_username') || 'admin';
      setAdminCredentials(prev => ({
        ...prev,
        username: currentUsername
      }));
    }
  }, [navigate]);

  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleAdminCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setAdminCredentialsError(null);
    setCredentialsChanged(true);
  };

  const handleSaveAdminCredentials = () => {
    // Validate
    if (adminCredentials.password !== adminCredentials.confirmPassword) {
      setAdminCredentialsError("Passwords don't match");
      return;
    }

    if (adminCredentials.password.length < 6) {
      setAdminCredentialsError("Password must be at least 6 characters");
      return;
    }

    if (!adminCredentials.username.trim()) {
      setAdminCredentialsError("Username cannot be empty");
      return;
    }

    // Update credentials
    const success = updateAdminCredentials(
      adminCredentials.username, 
      adminCredentials.password
    );

    if (success) {
      setAdminCredentialsSuccess("Admin credentials updated successfully");
      // Clear password fields
      setAdminCredentials(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      setCredentialsChanged(false);
    } else {
      setAdminCredentialsError("Failed to update credentials");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">System Settings</h1>
          <p className="text-neutral-600">Configure application-wide settings</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSaveSettings}
          isLoading={loading}
        >
          Save All Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Admin Credentials */}
        <Card>
          <div className="flex items-center mb-6">
            <Key className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Admin Credentials</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Admin Username"
              name="username"
              value={adminCredentials.username}
              onChange={handleAdminCredentialsChange}
              placeholder="Admin username"
            />
            
            <div className="md:col-span-2">
              <Input
                label="New Password"
                name="password"
                type="password"
                value={adminCredentials.password}
                onChange={handleAdminCredentialsChange}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="md:col-span-2">
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={adminCredentials.confirmPassword}
                onChange={handleAdminCredentialsChange}
                placeholder="Confirm new password"
              />
            </div>
            
            {adminCredentialsError && (
              <div className="md:col-span-2 text-error-600 text-sm mt-1">
                {adminCredentialsError}
              </div>
            )}
            
            {adminCredentialsSuccess && (
              <div className="md:col-span-2 text-success-600 text-sm mt-1">
                {adminCredentialsSuccess}
              </div>
            )}
            
            <div className="md:col-span-2 mt-2">
              <Button
                variant="primary"
                onClick={handleSaveAdminCredentials}
                disabled={!credentialsChanged}
              >
                Update Admin Credentials
              </Button>
            </div>
          </div>
        </Card>

        {/* General Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <Settings className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">General Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Site Name"
              value={generalSettings.siteName}
              onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
              placeholder="Company or platform name"
            />
            
            <Input
              label="Contact Email"
              type="email"
              value={generalSettings.contactEmail}
              onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
              placeholder="Primary contact email"
            />
            
            <Input
              label="Support Phone"
              value={generalSettings.supportPhone}
              onChange={(e) => setGeneralSettings({...generalSettings, supportPhone: e.target.value})}
              placeholder="Customer support phone number"
            />
            
            <div className="md:col-span-2">
              <div className="flex flex-col mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onChange={() => setGeneralSettings({...generalSettings, maintenanceMode: !generalSettings.maintenanceMode})}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 text-sm font-medium text-neutral-700">
                    Maintenance Mode (Temporarily disable user access)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    checked={generalSettings.allowRegistration}
                    onChange={() => setGeneralSettings({...generalSettings, allowRegistration: !generalSettings.allowRegistration})}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="allowRegistration" className="ml-2 text-sm font-medium text-neutral-700">
                    Allow New User Registrations
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Commission Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <BarChart className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Commission Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Direct Referral Bonus (₹)"
              type="number"
              value={commissionSettings.directReferralBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, directReferralBonus: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Matching Bonus (₹)"
              type="number"
              value={commissionSettings.matchingBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, matchingBonus: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Royalty Bonus (%)"
              type="number"
              value={commissionSettings.royaltyBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, royaltyBonus: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
            
            <Input
              label="Repurchase Bonus (%)"
              type="number"
              value={commissionSettings.repurchaseBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, repurchaseBonus: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </Card>

        {/* Payment Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <CreditCard className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Payment & Withdrawal Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Minimum Withdrawal Amount (₹)"
              type="number"
              value={paymentSettings.minimumWithdrawal}
              onChange={(e) => setPaymentSettings({...paymentSettings, minimumWithdrawal: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Withdrawal Fee (₹)"
              type="number"
              value={paymentSettings.withdrawalFee}
              onChange={(e) => setPaymentSettings({...paymentSettings, withdrawalFee: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Tax Rate (%)"
              type="number"
              value={paymentSettings.taxRate}
              onChange={(e) => setPaymentSettings({...paymentSettings, taxRate: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
            
            <Input
              label="Admin Charges (%)"
              type="number"
              value={paymentSettings.adminCharges}
              onChange={(e) => setPaymentSettings({...paymentSettings, adminCharges: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </Card>
        
        {/* Security Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <Shield className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Require KYC Verification</p>
                <p className="text-sm text-neutral-500">Require users to complete KYC before withdrawal</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="requireKyc"
                />
                <label 
                  htmlFor="requireKyc" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Two-Factor Authentication for Admin</p>
                <p className="text-sm text-neutral-500">Require 2FA for all admin accounts</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={false} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="adminTwoFactor"
                />
                <label 
                  htmlFor="adminTwoFactor" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-neutral-300"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-0" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">IP Restriction for Admin Panel</p>
                <p className="text-sm text-neutral-500">Restrict admin access to specific IP addresses</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={false} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="ipRestriction"
                />
                <label 
                  htmlFor="ipRestriction" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-neutral-300"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-0" 
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <div className="flex items-center mb-6">
            <Bell className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">New User Registration</p>
                <p className="text-sm text-neutral-500">Receive notifications for new user registrations</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="newUserNotification"
                />
                <label 
                  htmlFor="newUserNotification" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">KYC Submission</p>
                <p className="text-sm text-neutral-500">Receive notifications for new KYC submissions</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="kycNotification"
                />
                <label 
                  htmlFor="kycNotification" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Withdrawal Requests</p>
                <p className="text-sm text-neutral-500">Receive notifications for withdrawal requests</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="withdrawalNotification"
                />
                <label 
                  htmlFor="withdrawalNotification" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings; 