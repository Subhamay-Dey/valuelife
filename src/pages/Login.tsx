import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Award, Users, Target, Shield } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getAllUsers, setToStorage, updateCurrentUser } from '../utils/localStorageService';

// For demonstration purposes only - in a real app, use a proper secure verification method
const verifyPassword = (inputPassword: string, storedPassword: string) => {
  return inputPassword === storedPassword;
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const users = getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (user && user.password && verifyPassword(password, user.password)) {
        setToStorage('logged_in_user', user.id);
        updateCurrentUser(user);
        navigate('/dashboard');
      } else {
        if (!user) {
          setError('No account found with this email address. Please register first.');
        } else if (user && (!user.password || !verifyPassword(password, user.password))) {
          setError('Incorrect password. Please try again.');
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Premium Quality",
      description: "Our products meet the highest standards of quality and effectiveness"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Support",
      description: "Join thousands of satisfied customers in our growing community"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Goal Achievement",
      description: "We help you reach your health and wealth goals effectively"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Platform",
      description: "Your data and transactions are protected with top-tier security"
    }
  ];
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Company Info */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col h-full p-12" data-aos="fade-right">
          <div className="flex items-center space-x-4 mb-12">
            <img src="/images/logo.jpg" alt="Value Life Logo" className="h-16 w-16 object-contain bg-white rounded-xl shadow-lg p-2" />
            <div>
              <h1 className="text-3xl font-bold">Value Life</h1>
              <p className="text-blue-200">Transform Your Life, Create Your Legacy</p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="max-w-xl" data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-4xl font-bold leading-tight mb-6">
                Welcome to the Future of Health & Wealth
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                At Value Life, we believe in empowering individuals to achieve their fullest potential through holistic well-being and financial growth.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12" data-aos="fade-up" data-aos-delay="400">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={200 + (index * 100)}
                >
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-12" data-aos="fade-up" data-aos-delay="800">
              <div className="flex items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold">10k+</div>
                  <div className="text-blue-200">Active Users</div>
                </div>
                <div className="h-12 w-px bg-blue-400/30"></div>
                <div>
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-blue-200">Satisfaction Rate</div>
                </div>
                <div className="h-12 w-px bg-blue-400/30"></div>
                <div>
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-blue-200">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-4 sm:px-6 lg:px-12 bg-gray-50">
        <div className="max-w-md w-full mx-auto" data-aos="fade-left">
          <div className="lg:hidden flex items-center justify-center space-x-4 mb-8">
            <img src="/images/logo.jpg" alt="Value Life Logo" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Value Life</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
        </h2>
            <p className="text-gray-600">
              Sign in to continue your journey towards a better life
        </p>
      </div>
      
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-shake" data-aos="fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
              <div data-aos="fade-up" data-aos-delay="200">
            <Input
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              leftIcon={<Mail className="h-5 w-5" />}
              required
            />
              </div>

              <div data-aos="fade-up" data-aos-delay="400">
                <div className="relative">
                  <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                    label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-5 w-5" />}
                  required
                />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-[34px] p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
              </div>
            </div>
            
              <div className="flex items-center justify-between" data-aos="fade-up" data-aos-delay="600">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                </Link>
              </div>
            </div>
            
              <div data-aos="fade-up" data-aos-delay="800">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200"
              >
                Sign in
              </Button>
            </div>
            </form>
            
            <div className="mt-8" data-aos="fade-up" data-aos-delay="1000">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    New to Value Life?
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link to="/register">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    className="border-2 hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;