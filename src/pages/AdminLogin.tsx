import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { validateAdminCredentials } from '../utils/localStorageService';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate admin credentials
    setTimeout(() => {
      if (validateAdminCredentials(formData.username, formData.password)) {
        // Store admin authentication state
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">MLM Portal</h1>
          <p className="text-neutral-600 mt-2">Admin Panel Access</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
                  Admin Login
                </h2>
                
                {error && (
                  <div className="bg-error-50 text-error-700 p-3 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <Input
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter admin username"
                    leftIcon={<User className="h-5 w-5 text-neutral-400" />}
                  />
                  
                  <Input
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter admin password"
                    leftIcon={<Lock className="h-5 w-5 text-neutral-400" />}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
              >
                Login to Admin Panel
              </Button>
            </div>
          </form>
        </Card>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-500">
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 