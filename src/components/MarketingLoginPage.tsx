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
import { HeroSection } from './ui/HeroSection';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { PrimaryButton } from './ui/PrimaryButton';

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
      color: 'bg-primary',
      hoverColor: 'hover:bg-primary-600'
    },
    {
      role: 'shipper',
      title: 'Shipper',
      icon: Building,
      description: 'Logistics Company',
      color: 'bg-accent',
      hoverColor: 'hover:bg-accent-600'
    },
    {
      role: 'fleet',
      title: 'Fleet Operator',
      icon: Truck,
      description: 'Fleet Management',
      color: 'bg-warm',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      role: 'individual',
      title: 'Individual Owner',
      icon: Car,
      description: 'Vehicle Owner',
      color: 'bg-success',
      hoverColor: 'hover:bg-green-600'
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
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <HeroSection
        title="TrackAS Logistics Platform"
        subtitle="Revolutionary AI-powered logistics ecosystem connecting shippers, fleet operators, and drivers for seamless, secure, and efficient cargo transportation."
        tagline="Track smarter, deliver faster, pay safer"
        primaryButtonText="Get Started"
        secondaryButtonText="Learn More"
        onPrimaryClick={() => setShowLoginForm(true)}
        onSecondaryClick={() => console.log('Learn more')}
        showFounder={true}
      />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-text mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Comprehensive logistics platform with AI-powered optimization, secure payments, and real-time tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle level={4} className="mb-2">{feature.title}</CardTitle>
                <CardContent>{feature.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-text mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              TrackAS serves multiple user types with specialized dashboards and features tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoles.map((role, index) => (
              <Card 
                key={index} 
                hover 
                className="text-center cursor-pointer group animate-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleRoleSelect(role.role as any)}
              >
                <div className={`w-12 h-12 ${role.color} rounded-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle level={4} className="mb-2">{role.title}</CardTitle>
                <CardContent className="text-sm">{role.description}</CardContent>
                <div className="flex items-center justify-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform mt-4">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

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