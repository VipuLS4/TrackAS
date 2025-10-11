import React from 'react';
import { HeroSection } from '../components/ui/HeroSection';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { 
  Truck, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp, 
  Globe,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const handleGetStarted = () => {
    console.log('Get Started clicked');
  };

  const handleLearnMore = () => {
    console.log('Learn More clicked');
  };

  const handleRoleSelect = (role: string) => {
    console.log(`Role selected: ${role}`);
  };

  const features = [
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: "Smart Fleet Management",
      description: "AI-powered vehicle routing and optimization for maximum efficiency and cost savings.",
      stats: "40% faster deliveries"
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "Secure Escrow System",
      description: "Blockchain-powered payment security ensuring safe transactions for all parties.",
      stats: "100% secure payments"
    },
    {
      icon: <Zap className="w-8 h-8 text-warm" />,
      title: "Real-time Tracking",
      description: "Live GPS tracking with predictive analytics and automated notifications.",
      stats: "99.9% uptime"
    },
    {
      icon: <Users className="w-8 h-8 text-success" />,
      title: "Multi-Role Platform",
      description: "Comprehensive ecosystem for shippers, fleet operators, drivers, and customers.",
      stats: "5 user roles"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "AI Analytics",
      description: "Advanced analytics and insights to optimize your logistics operations.",
      stats: "25% cost reduction"
    },
    {
      icon: <Globe className="w-8 h-8 text-accent" />,
      title: "Global Reach",
      description: "Connect with logistics partners worldwide for seamless cross-border operations.",
      stats: "50+ countries"
    }
  ];

  const roles = [
    {
      name: "Admin",
      description: "Platform governance and management",
      color: "bg-primary",
      icon: <Shield className="w-6 h-6 text-white" />
    },
    {
      name: "Shipper",
      description: "Cargo owners and logistics companies",
      color: "bg-accent",
      icon: <Truck className="w-6 h-6 text-white" />
    },
    {
      name: "Fleet Operator",
      description: "Transportation companies",
      color: "bg-warm",
      icon: <Users className="w-6 h-6 text-white" />
    },
    {
      name: "Individual Owner",
      description: "Independent drivers",
      color: "bg-success",
      icon: <Zap className="w-6 h-6 text-white" />
    }
  ];

  const stats = [
    { label: "Active Users", value: "10,000+" },
    { label: "Shipments Delivered", value: "500,000+" },
    { label: "Countries Served", value: "50+" },
    { label: "Success Rate", value: "99.5%" }
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/LOGO.png" alt="TrackAS" className="h-8 w-8" />
              <span className="text-xl font-heading font-bold text-text">TrackAS</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection
        title="TrackAS Logistics Platform"
        subtitle="Revolutionary AI-powered logistics ecosystem connecting shippers, fleet operators, and drivers for seamless, secure, and efficient cargo transportation."
        tagline="Track smarter, deliver faster, pay safer"
        primaryButtonText="Get Started"
        secondaryButtonText="Learn More"
        onPrimaryClick={handleGetStarted}
        onSecondaryClick={handleLearnMore}
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
                  {feature.icon}
                </div>
                <CardTitle level={4} className="mb-2">{feature.title}</CardTitle>
                <CardContent className="mb-4">{feature.description}</CardContent>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {feature.stats}
                </div>
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
            {roles.map((role, index) => (
              <Card 
                key={index} 
                hover 
                className="text-center cursor-pointer group animate-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleRoleSelect(role.name)}
              >
                <div className={`w-12 h-12 ${role.color} rounded-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {role.icon}
                </div>
                <CardTitle level={4} className="mb-2">{role.name}</CardTitle>
                <CardContent className="text-sm">{role.description}</CardContent>
                <CardFooter className="pt-4">
                  <div className="flex items-center justify-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardFooter>
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
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 font-heading font-bold text-text mb-4">
            Ready to Transform Your Logistics?
          </h2>
          <p className="text-xl text-muted mb-8">
            Join TrackAS today and experience the future of intelligent logistics management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton size="lg" onClick={handleGetStarted}>
              Start Free Trial
            </PrimaryButton>
            <PrimaryButton variant="secondary" size="lg" onClick={handleLearnMore}>
              Schedule Demo
            </PrimaryButton>
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
