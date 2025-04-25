import React, { useState } from 'react';
import { Bell, Lock, CreditCard, Shield, Globe, Moon, Save } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Settings: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    newReferralAlert: true,
    commissionAlert: true,
  });

  const [appearance, setAppearance] = useState('light');
  const [language, setLanguage] = useState('english');

  const handleNotificationChange = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Notification Settings */}
        <Card>
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Email Notifications</p>
                <p className="text-sm text-neutral-500">Receive notifications via email</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.emailNotifications} 
                  onChange={() => handleNotificationChange('emailNotifications')}
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="emailNotifications"
                />
                <label 
                  htmlFor="emailNotifications" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    notificationSettings.emailNotifications ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                >
                  <span 
                    className={`dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">SMS Notifications</p>
                <p className="text-sm text-neutral-500">Receive notifications via text message</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.smsNotifications} 
                  onChange={() => handleNotificationChange('smsNotifications')}
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="smsNotifications"
                />
                <label 
                  htmlFor="smsNotifications" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    notificationSettings.smsNotifications ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                >
                  <span 
                    className={`dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out ${
                      notificationSettings.smsNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Marketing Emails</p>
                <p className="text-sm text-neutral-500">Receive promotional emails and offers</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.marketingEmails} 
                  onChange={() => handleNotificationChange('marketingEmails')}
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="marketingEmails"
                />
                <label 
                  htmlFor="marketingEmails" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    notificationSettings.marketingEmails ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                >
                  <span 
                    className={`dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out ${
                      notificationSettings.marketingEmails ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">New Referral Alerts</p>
                <p className="text-sm text-neutral-500">Receive alerts when you get a new referral</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.newReferralAlert} 
                  onChange={() => handleNotificationChange('newReferralAlert')}
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="newReferralAlert"
                />
                <label 
                  htmlFor="newReferralAlert" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    notificationSettings.newReferralAlert ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                >
                  <span 
                    className={`dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out ${
                      notificationSettings.newReferralAlert ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Commission Alerts</p>
                <p className="text-sm text-neutral-500">Receive alerts for new commissions</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.commissionAlert} 
                  onChange={() => handleNotificationChange('commissionAlert')}
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="commissionAlert"
                />
                <label 
                  htmlFor="commissionAlert" 
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    notificationSettings.commissionAlert ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                >
                  <span 
                    className={`dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out ${
                      notificationSettings.commissionAlert ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Security Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-neutral-800 font-medium">Two-Factor Authentication</p>
                <Button
                  variant="outline"
                  size="sm"
                >
                  Setup
                </Button>
              </div>
              <p className="text-sm text-neutral-500">Add an extra layer of security to your account</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-neutral-800 font-medium">Change Password</p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Lock className="h-4 w-4" />}
                >
                  Update
                </Button>
              </div>
              <p className="text-sm text-neutral-500">Update your password regularly for better security</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-neutral-800 font-medium">Session Management</p>
                <Button
                  variant="outline"
                  size="sm"
                >
                  Manage
                </Button>
              </div>
              <p className="text-sm text-neutral-500">View and manage your active sessions</p>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card>
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Payment Methods</h3>
          </div>
          
          <div className="mb-4">
            <p className="text-neutral-600 mb-2">Add a payment method to receive your commissions</p>
            <Button
              variant="primary"
              size="sm"
            >
              Add Payment Method
            </Button>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg text-center">
            <p className="text-neutral-500">No payment methods added yet</p>
          </div>
        </Card>

        {/* Appearance & Language */}
        <Card>
          <div className="flex items-center mb-4">
            <Moon className="h-5 w-5 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold">Appearance & Language</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Theme</label>
              <div className="flex space-x-4">
                <div 
                  className={`px-4 py-2 border rounded-md cursor-pointer ${appearance === 'light' ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-neutral-300 text-neutral-600'}`}
                  onClick={() => setAppearance('light')}
                >
                  Light
                </div>
                <div 
                  className={`px-4 py-2 border rounded-md cursor-pointer ${appearance === 'dark' ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-neutral-300 text-neutral-600'}`}
                  onClick={() => setAppearance('dark')}
                >
                  Dark
                </div>
                <div 
                  className={`px-4 py-2 border rounded-md cursor-pointer ${appearance === 'system' ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-neutral-300 text-neutral-600'}`}
                  onClick={() => setAppearance('system')}
                >
                  System Default
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Language</label>
              <select 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings; 