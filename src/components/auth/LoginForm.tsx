import React, { useState } from 'react';
import { ParkingCircle, Mail, Lock, Eye, EyeOff, AlertCircle, Wifi, WifiOff, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { testConnection } from '../../lib/supabase';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [loginTimeout, setLoginTimeout] = useState(false);
  const { login, isLoading, error } = useAuth();

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoginTimeout(false);
    
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      setLocalError('Please enter your password');
      return;
    }
    
    // Set a timeout to detect hanging requests
    const timeoutId = setTimeout(() => {
      setLoginTimeout(true);
    }, 20000); // 20 seconds
    
    try {
      const success = await login(email, password);
      clearTimeout(timeoutId);
      
      if (!success && !error && !localError) {
        setLocalError('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Login form error:', error);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const displayError = localError || error;

  const fillDemoCredentials = (role: 'admin' | 'owner' | 'user') => {
    const credentials = {
      admin: { email: 'admin@pae.com', password: 'password123' },
      owner: { email: 'owner@pae.com', password: 'password123' },
      user: { email: 'user@pae.com', password: 'password123' }
    };
    
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
    setLocalError('');
  };

  const retryConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      if (isConnected) {
        setLocalError('');
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const showServerWarning = displayError && (
    displayError.includes('technical difficulties') ||
    displayError.includes('server error') ||
    displayError.includes('temporarily unavailable') ||
    displayError.includes('configuration issue') ||
    displayError.includes('unexpected error') ||
    displayError.includes('Database error') ||
    displayError.includes('experiencing issues')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ParkingCircle className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PAE</h1>
          <p className="text-gray-600">Your premium parking solution</p>
        </div>

        {/* Timeout Warning */}
        {loginTimeout && (
          <div className="mb-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex items-start">
              <Clock className="text-orange-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-orange-800 mb-1">Request Taking Too Long</h3>
                <p className="text-sm text-orange-700">
                  The login request is taking longer than expected. This may indicate server issues. Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Server Status Warning */}
        {showServerWarning && (
          <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start">
              <AlertTriangle className="text-amber-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">Server Issue Detected</h3>
                <p className="text-sm text-amber-700 mb-2">
                  The authentication service is experiencing technical difficulties. This appears to be a temporary server-side issue.
                </p>
                <p className="text-xs text-amber-600">
                  Please try again in a few minutes. If the problem persists, contact support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          connectionStatus === 'connected' ? 'bg-green-50 border border-green-200' :
          connectionStatus === 'disconnected' ? 'bg-red-50 border border-red-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center">
            {connectionStatus === 'connected' ? (
              <Wifi className="text-green-600 mr-2" size={16} />
            ) : connectionStatus === 'disconnected' ? (
              <WifiOff className="text-red-600 mr-2" size={16} />
            ) : (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            )}
            <span className={`text-sm font-medium ${
              connectionStatus === 'connected' ? 'text-green-800' :
              connectionStatus === 'disconnected' ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              {connectionStatus === 'connected' ? 'Connected to server' :
               connectionStatus === 'disconnected' ? 'Connection issues detected' :
               'Checking connection...'}
            </span>
          </div>
          {connectionStatus === 'disconnected' && (
            <button
              onClick={retryConnection}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          )}
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Demo Credentials:</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium">Admin:</span> admin@pae.com / password123
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('owner')}
              className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium">Owner:</span> owner@pae.com / password123
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('user')}
              className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
            >
              <span className="font-medium">User:</span> user@pae.com / password123
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {displayError && !showServerWarning && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  {displayError}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};