import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => void;
  onSignUp: () => void;
  isLoading?: boolean;
  error?: string;
  defaultRole?: 'admin' | 'shipper' | 'fleet' | 'individual';
}

interface LoginCredentials {
  email: string;
  password: string;
  role: 'admin' | 'shipper' | 'fleet' | 'individual';
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSignUp, isLoading = false, error, defaultRole }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    role: defaultRole || 'shipper'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(credentials);
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin', icon: Shield, description: 'System Administrator' },
    { value: 'shipper', label: 'Shipper', icon: User, description: 'Logistics Company' },
    { value: 'fleet', label: 'Fleet Operator', icon: User, description: 'Fleet Management' },
    { value: 'individual', label: 'Individual Owner', icon: User, description: 'Vehicle Owner' }
  ];

  const selectedRole = roleOptions.find(role => role.value === credentials.role);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="backdrop-blur-xl bg-white/15 border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Zap className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUpMode ? 'Join TrackAS' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUpMode 
              ? 'Start your logistics journey today' 
              : 'Sign in to your account'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector */}
          {!defaultRole && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((role) => (
                  <motion.button
                    key={role.value}
                    type="button"
                    onClick={() => handleInputChange('role', role.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      credentials.role === role.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white/50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <role.icon className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{role.label}</div>
                  </motion.button>
                ))}
              </div>
              {selectedRole && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {selectedRole.description}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>{isSignUpMode ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-200" />
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Sign Up Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUpMode(!isSignUpMode)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center space-x-2 mx-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>
              {isSignUpMode 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Demo Access */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Try Demo</span>
          </div>
          <p className="text-xs text-purple-600 mb-3">
            Experience TrackAS with our interactive demo
          </p>
          <button
            type="button"
            onClick={onSignUp}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Launch Demo
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Secure & Encrypted</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
