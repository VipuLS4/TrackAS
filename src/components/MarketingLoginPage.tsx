import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  Shield, 
  Users, 
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  LogIn,
  User,
  Building,
  Car
} from 'lucide-react';
import LoginForm from './LoginForm';

interface MarketingLoginPageProps {
  onLogin: (credentials: any) => void;
  onSignUp: () => void;
  isLoading?: boolean;
  error?: string;
}

const MarketingLoginPage: React.FC<MarketingLoginPageProps> = ({ 
  onLogin, 
  onSignUp, 
  isLoading = false, 
  error 
}) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'shipper' | 'fleet' | 'individual' | null>(null);

  const features = [
    {
      icon: Truck,
      title: "Smart Fleet Management",
      description: "AI-powered vehicle assignment and route optimization"
    },
    {
      icon: Package,
      title: "Real-time Tracking",
      description: "Live shipment tracking with GPS integration"
    },
    {
      icon: MapPin,
      title: "Route Optimization",
      description: "AI-driven route planning for maximum efficiency"
    },
    {
      icon: Clock,
      title: "Fast Assignment",
      description: "Reduce assignment time from hours to minutes"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-grade security with encrypted transactions"
    },
    {
      icon: Users,
      title: "Multi-role Support",
      description: "Support for all logistics stakeholders"
    }
  ];

  const userRoles = [
    {
      role: 'admin',
      title: 'Admin',
      icon: Shield,
      description: 'System Administrator',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    {
      role: 'shipper',
      title: 'Shipper',
      icon: Building,
      description: 'Logistics Company',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      role: 'fleet',
      title: 'Fleet Operator',
      icon: Truck,
      description: 'Fleet Management',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      role: 'individual',
      title: 'Individual Owner',
      icon: Car,
      description: 'Vehicle Owner',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  const handleRoleSelect = (role: 'admin' | 'shipper' | 'fleet' | 'individual') => {
    setSelectedRole(role);
    setShowLoginForm(true);
  };

  const handleLogin = (credentials: any) => {
    onLogin({ ...credentials, role: selectedRole });
  };

  if (showLoginForm && selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login as {userRoles.find(r => r.role === selectedRole)?.title}
              </h2>
              <p className="text-gray-600">
                {userRoles.find(r => r.role === selectedRole)?.description}
              </p>
            </div>
            
            <LoginForm 
              onLogin={handleLogin}
              onSignUp={onSignUp}
              isLoading={isLoading}
              error={error}
              defaultRole={selectedRole}
            />
            
            <button
              onClick={() => {
                setShowLoginForm(false);
                setSelectedRole(null);
              }}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to role selection
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              TrackAS
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              Smart Logistics Platform
            </p>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Connect fleets, shippers, and drivers seamlessly with AI-powered logistics management
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300"
            >
              <feature.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* User Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Role
            </h2>
            <p className="text-gray-300">
              Select your role to access the appropriate dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoles.map((role, index) => (
              <motion.button
                key={role.role}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                onClick={() => handleRoleSelect(role.role as any)}
                className={`${role.color} ${role.hoverColor} text-white rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <role.icon className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {role.title}
                </h3>
                <p className="text-sm opacity-90">
                  {role.description}
                </p>
                <ArrowRight className="h-5 w-5 mx-auto mt-4" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                &lt; 2 min
              </div>
              <div className="text-gray-300 text-sm">
                Assignment Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                10K+
              </div>
              <div className="text-gray-300 text-sm">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                99.9%
              </div>
              <div className="text-gray-300 text-sm">
                Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                Bank-grade
              </div>
              <div className="text-gray-300 text-sm">
                Security
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketingLoginPage;