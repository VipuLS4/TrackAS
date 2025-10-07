import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Star, 
  CreditCard, 
  Zap,
  Brain,
  Shield,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

interface FlowDemoProps {
  autoPlay?: boolean;
  onSceneChange?: (scene: number) => void;
}

const FlowDemo: React.FC<FlowDemoProps> = ({ autoPlay = true, onSceneChange }) => {
  const [currentScene, setCurrentScene] = useState(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showProgress, setShowProgress] = useState(true);

  const scenes = [
    {
      id: 1,
      title: "Shipper Creates Shipment",
      icon: Package,
      description: "📦 Shipper enters pickup, drop, and load details",
      subtext: "💡 AI validates price instantly",
      duration: 4000
    },
    {
      id: 2,
      title: "TrackAS Matches Fleet in 2 Minutes",
      icon: Truck,
      description: "⏱️ TrackAS AI matches the best fleet within 2 minutes",
      subtext: "✅ Fleet Assigned",
      duration: 4000
    },
    {
      id: 3,
      title: "Driver Picks Up & Starts Trip",
      icon: MapPin,
      description: "🚛 Driver starts trip — live tracking begins instantly",
      subtext: "📍 GPS tracking active",
      duration: 4000
    },
    {
      id: 4,
      title: "Payment & Escrow Automation",
      icon: CreditCard,
      description: "💰 Payment secured in Escrow — auto-released on delivery",
      subtext: "0% fraud | Transparent commission",
      duration: 4000
    },
    {
      id: 5,
      title: "Delivery Confirmed & Rated",
      icon: Star,
      description: "✅ Delivery done. Feedback collected. Fleet & Shipper rated",
      subtext: "TrackAS — Logistics. Simplified. Automated. Trusted.",
      duration: 4000
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentScene(prev => {
        const nextScene = prev === 5 ? 1 : prev + 1;
        onSceneChange?.(nextScene);
        return nextScene;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, onSceneChange]);

  const currentSceneData = scenes.find(scene => scene.id === currentScene);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSceneClick = (sceneId: number) => {
    setCurrentScene(sceneId);
    onSceneChange?.(sceneId);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Background Map Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
          <path
            d="M100 200 Q400 100 700 200 T700 400 Q400 500 100 400 T100 200"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-blue-300"
          />
          <circle cx="100" cy="200" r="8" fill="currentColor" className="text-green-500" />
          <circle cx="700" cy="400" r="8" fill="currentColor" className="text-red-500" />
          <circle cx="400" cy="300" r="6" fill="currentColor" className="text-blue-500" />
        </svg>
      </div>

      {/* Scene Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
        {/* Progress Bar */}
        {showProgress && (
          <div className="absolute top-8 left-8 right-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">How TrackAS Works</span>
              <button
                onClick={handlePlayPause}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentScene / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Scene Indicators */}
        <div className="absolute top-8 right-8 flex space-x-2">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleSceneClick(scene.id)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentScene === scene.id
                  ? 'bg-blue-600 scale-125'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Main Scene Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl"
          >
            {/* Scene Icon */}
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  {currentSceneData && <currentSceneData.icon className="h-12 w-12 text-white" />}
                </div>
                {/* Animated Ring */}
                <motion.div
                  className="absolute inset-0 border-4 border-blue-300 rounded-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Scene Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              {currentSceneData?.title}
            </motion.h2>

            {/* Scene Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-700 mb-2"
            >
              {currentSceneData?.description}
            </motion.p>

            {/* Scene Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-gray-600 font-medium"
            >
              {currentSceneData?.subtext}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Scene-Specific Animations */}
        <div className="absolute inset-0 pointer-events-none">
          {currentScene === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex items-center space-x-2"
              >
                <Package className="h-6 w-6 text-blue-600" />
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <Brain className="h-6 w-6 text-purple-600" />
              </motion.div>
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-4"
              >
                <Truck className="h-8 w-8 text-green-600" />
                <CheckCircle className="h-6 w-6 text-green-500" />
              </motion.div>
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ x: [0, 200, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex items-center space-x-2"
              >
                <Truck className="h-8 w-8 text-blue-600" />
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              </motion.div>
            </motion.div>
          )}

          {currentScene === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-4"
              >
                <CreditCard className="h-8 w-8 text-green-600" />
                <Shield className="h-6 w-6 text-blue-600" />
                <CreditCard className="h-8 w-8 text-blue-600" />
              </motion.div>
            </motion.div>
          )}

          {currentScene === 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-2"
              >
                <Star className="h-8 w-8 text-yellow-500" />
                <Star className="h-8 w-8 text-yellow-500" />
                <Star className="h-8 w-8 text-yellow-500" />
                <Star className="h-8 w-8 text-yellow-500" />
                <Star className="h-8 w-8 text-yellow-500" />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Bottom Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-8 right-8 text-center"
        >
          <p className="text-sm text-gray-600 font-medium">
            AI-powered freight automation for fleets, shippers, and drivers
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default FlowDemo;
