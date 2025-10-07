import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw, 
  X,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Star,
  Brain,
  Shield,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';

interface InteractiveDemoProps {
  onClose: () => void;
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const demoSteps = [
    {
      id: 1,
      title: "Shipper Creates Shipment",
      description: "Logistics companies post their freight requirements with pickup and delivery details",
      details: [
        "Enter pickup location (Delhi)",
        "Enter delivery location (Mumbai)", 
        "Specify cargo details (weight, volume, type)",
        "AI validates pricing instantly",
        "Payment secured in escrow"
      ],
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      duration: 4000
    },
    {
      id: 2,
      title: "AI Matching in 2 Minutes",
      description: "TrackAS AI engine matches the best available fleet based on proximity, reliability, and capacity",
      details: [
        "Scan available fleets in real-time",
        "Prioritize subscribed fleets first",
        "Calculate optimal route and pricing",
        "Send priority request to best match",
        "Fleet accepts within 2-minute window"
      ],
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      duration: 4000
    },
    {
      id: 3,
      title: "Driver Assignment & Pickup",
      description: "Fleet operator assigns driver and vehicle, driver proceeds to pickup location",
      details: [
        "Fleet operator selects driver",
        "Assigns appropriate vehicle",
        "Driver receives job notification",
        "GPS navigation to pickup point",
        "Geofence verification on arrival"
      ],
      icon: Truck,
      color: "from-green-500 to-emerald-500",
      duration: 4000
    },
    {
      id: 4,
      title: "Live Tracking & Transit",
      description: "Real-time GPS tracking provides visibility to all stakeholders throughout the journey",
      details: [
        "Continuous GPS location updates",
        "ETA calculations and updates",
        "Route optimization in real-time",
        "Automated status notifications",
        "Customer tracking portal access"
      ],
      icon: MapPin,
      color: "from-orange-500 to-red-500",
      duration: 4000
    },
    {
      id: 5,
      title: "Delivery & Payment",
      description: "Secure delivery confirmation triggers automatic payment release and commission processing",
      details: [
        "Driver arrives at destination",
        "Customer receives delivery",
        "POD (Proof of Delivery) captured",
        "Escrow automatically released",
        "Commission processed to TrackAS"
      ],
      icon: CreditCard,
      color: "from-indigo-500 to-blue-500",
      duration: 4000
    },
    {
      id: 6,
      title: "Feedback & Analytics",
      description: "Customer feedback improves service quality and provides valuable insights for optimization",
      details: [
        "Customer rates delivery experience",
        "Feedback collected anonymously",
        "Driver and fleet ratings updated",
        "Performance analytics generated",
        "Continuous improvement cycle"
      ],
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      duration: 4000
    }
  ];

  const currentStepData = demoSteps[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % demoSteps.length);
    }, currentStepData.duration);

    return () => clearInterval(interval);
  }, [isPlaying, currentStepData.duration, demoSteps.length]);

  const handlePrevious = () => {
    setCurrentStep(prev => prev === 0 ? demoSteps.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentStep(prev => (prev + 1) % demoSteps.length);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">TrackAS Interactive Demo</h2>
              <p className="text-blue-100">Experience the complete logistics automation flow</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Left Panel - Demo Content */}
          <div className="flex-1 p-8">
            <div className="h-full flex flex-col">
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {demoSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleStepClick(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentStep === index
                            ? 'bg-blue-600 scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {demoSteps.length}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl"
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, type: "spring" }}
                      className="mb-8"
                    >
                      <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-2xl`}>
                        <currentStepData.icon className="h-12 w-12 text-white" />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold text-gray-900 mb-4"
                    >
                      {currentStepData.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg text-gray-600 mb-6"
                    >
                      {currentStepData.description}
                    </motion.p>

                    {/* Details Toggle */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showDetails ? 'Hide Details' : 'Show Details'}
                    </motion.button>

                    {/* Details */}
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6"
                        >
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Process Steps:</h4>
                            <ul className="space-y-2">
                              {currentStepData.details.map((detail, index) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center space-x-3 text-gray-700"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span>{detail}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {Math.round((currentStep / demoSteps.length) * 100)}% Complete
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / demoSteps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>{currentStep === demoSteps.length - 1 ? 'Restart' : 'Next'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Stats & Benefits */}
          <div className="w-80 bg-gray-50 p-6 border-l">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">TrackAS Benefits</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">2x Faster Assignment</div>
                  <div className="text-sm text-gray-600">From 2 hours to 2 minutes</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">100% Secure Payments</div>
                  <div className="text-sm text-gray-600">Escrow-protected transactions</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">10K+ Active Users</div>
                  <div className="text-sm text-gray-600">Trusted by fleets & shippers</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">99.9% Success Rate</div>
                  <div className="text-sm text-gray-600">Reliable delivery performance</div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Ready to Get Started?</h4>
              <p className="text-sm text-blue-700 mb-4">
                Join thousands of logistics professionals using TrackAS
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveDemo;
