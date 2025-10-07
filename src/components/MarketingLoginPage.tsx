import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import FlowDemo from './FlowDemo';
import LoginForm from './LoginForm';
import InteractiveDemo from './InteractiveDemo';

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
  const [currentScene, setCurrentScene] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullDemo, setShowFullDemo] = useState(false);
  const [hasSeenDemo, setHasSeenDemo] = useState(false);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);

  // Check if user has seen demo before (cookie/localStorage)
  useEffect(() => {
    const seenDemo = localStorage.getItem('trackas-demo-seen');
    if (seenDemo) {
      setHasSeenDemo(true);
    }
  }, []);

  // Mark demo as seen after first complete cycle
  useEffect(() => {
    if (currentScene === 5 && !hasSeenDemo) {
      setTimeout(() => {
        setHasSeenDemo(true);
        localStorage.setItem('trackas-demo-seen', 'true');
      }, 2000);
    }
  }, [currentScene, hasSeenDemo]);

  const handleSceneChange = (scene: number) => {
    setCurrentScene(scene);
  };

  const marketingCopy = [
    "AI-powered freight automation — reduce assignment time from 2 hours to 2 minutes",
    "Post. Match. Deliver. Get Paid. All in one smart logistics platform",
    "TrackAS connects fleets, shippers, and drivers — seamlessly, securely, and transparently"
  ];

  const [currentCopy, setCurrentCopy] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCopy(prev => (prev + 1) % marketingCopy.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [marketingCopy.length]);

  const stats = [
    { label: "Assignment Time", value: "< 2 min", icon: Clock },
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Success Rate", value: "99.9%", icon: TrendingUp },
    { label: "Security", value: "Bank-grade", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <motion.div
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Flow Demo (70% on desktop, full width on mobile) */}
        <div className="hidden lg:flex lg:w-3/5 xl:w-2/3">
          <div className="w-full h-screen">
            <FlowDemo 
              autoPlay={!hasSeenDemo}
              onSceneChange={handleSceneChange}
            />
          </div>
        </div>

        {/* Right Panel - Login Form (30% on desktop, full width on mobile) */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col justify-center p-8 lg:p-12">
          {/* Mobile Demo Toggle */}
          <div className="lg:hidden mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">How TrackAS Works</h3>
                <button
                  onClick={() => setShowFullDemo(!showFullDemo)}
                  className="flex items-center space-x-2 text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <span className="text-sm">
                    {showFullDemo ? 'Hide Demo' : 'Show Demo'}
                  </span>
                  <ArrowRight className={`h-4 w-4 transition-transform ${showFullDemo ? 'rotate-90' : ''}`} />
                </button>
              </div>
              
              <AnimatePresence>
                {showFullDemo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="h-64 rounded-lg overflow-hidden">
                      <FlowDemo 
                        autoPlay={true}
                        onSceneChange={handleSceneChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Marketing Copy */}
          <div className="mb-8 text-center lg:text-left">
            <motion.div
              key={currentCopy}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                {marketingCopy[currentCopy]}
              </h1>
            </motion.div>
            
            <div className="flex items-center justify-center lg:justify-start space-x-4 text-blue-300">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">AI-Powered Logistics Platform</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <stat.icon className="h-6 w-6 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-300">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Login Form */}
          <div className="mb-8">
            <LoginForm
              onLogin={onLogin}
              onSignUp={onSignUp}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Additional CTAs */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-4 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Schedule Demo</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowInteractiveDemo(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Watch Product Tour</span>
            </motion.button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center lg:text-left">
            <p className="text-xs text-gray-400 mb-2">
              Trusted by 500+ fleets and 1000+ shippers across India
            </p>
            <div className="flex items-center justify-center lg:justify-start space-x-4 text-xs text-gray-500">
              <span>© 2025 TrackAS</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Controls (Hidden by default) */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Interactive Demo Modal */}
      <AnimatePresence>
        {showInteractiveDemo && (
          <InteractiveDemo onClose={() => setShowInteractiveDemo(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketingLoginPage;
