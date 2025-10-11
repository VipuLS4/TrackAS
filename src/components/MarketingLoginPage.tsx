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

      {/* Stats Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join the growing community of logistics professionals using TrackAS to optimize their operations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center animate-slide-up">
              <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                &lt; 2 min
              </div>
              <div className="text-white/80 text-sm">
                Assignment Time
              </div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                10K+
              </div>
              <div className="text-white/80 text-sm">
                Active Users
              </div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                99.9%
              </div>
              <div className="text-white/80 text-sm">
                Success Rate
              </div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                Bank-grade
              </div>
              <div className="text-white/80 text-sm">
                Security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/LOGO.png" alt="TrackAS" className="h-8 w-8" />
                <span className="text-xl font-heading font-bold">TrackAS</span>
              </div>
              <p className="text-white/80 mb-6 max-w-md">
                Revolutionary AI-powered logistics platform connecting the global supply chain for smarter, faster, and safer deliveries.
              </p>
              
              {/* Founder Badge */}
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <img
                  src="/Vipul.png"
                  alt="Vipul Sharma"
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                />
                <div>
                  <p className="text-white font-medium text-sm">Featured</p>
                  <p className="text-white/80 text-xs">Founded by Vipul Sharma</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-heading font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Admin Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipper Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fleet Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Driver App</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-heading font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60 text-sm">
            <p>&copy; 2024 TrackAS. All rights reserved. Built with ❤️ for the logistics industry.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLoginPage;