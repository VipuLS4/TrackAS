import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Globe, 
  X, 
  Minimize2, 
  Maximize2,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
  escalated?: boolean;
}

interface AIAssistantProps {
  userType: 'admin' | 'shipper' | 'fleet' | 'individual' | 'customer' | 'guest';
  userId?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  userType, 
  userId, 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('english');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(userType, detectedLanguage);
      setMessages([{
        id: '1',
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
        language: detectedLanguage
      }]);
    }
  }, [isOpen, userType, detectedLanguage]);

  const getWelcomeMessage = (type: string, language: string) => {
    const messages = {
      english: {
        admin: "Hello! I'm your TrackAS AI Assistant. I can help you with user verification, system configuration, dispute management, and platform analytics. How can I assist you today?",
        shipper: "Hi there! I'm here to help you with shipment creation, tracking, payment management, and operator ratings. What would you like to know?",
        fleet: "Welcome! I can assist you with fleet management, driver assignments, subscription plans, and earnings tracking. How can I help you today?",
        individual: "Hello! I'm here to help you with job assignments, route navigation, earnings, and performance tracking. What do you need assistance with?",
        customer: "Hi! I can help you track your shipments, check delivery status, and answer any questions about your orders. How can I assist you?",
        guest: "Welcome to TrackAS! I'm here to help you with general information about our logistics platform. What would you like to know?"
      },
      hindi: {
        admin: "नमस्ते! मैं आपका TrackAS AI Assistant हूं। मैं आपकी user verification, system configuration, dispute management, और platform analytics में मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
        shipper: "नमस्ते! मैं आपकी shipment creation, tracking, payment management, और operator ratings में मदद करने के लिए यहां हूं। आप क्या जानना चाहते हैं?",
        fleet: "स्वागत है! मैं आपकी fleet management, driver assignments, subscription plans, और earnings tracking में सहायता कर सकता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        individual: "नमस्ते! मैं आपकी job assignments, route navigation, earnings, और performance tracking में मदद करने के लिए यहां हूं। आपको किस चीज में सहायता चाहिए?",
        customer: "नमस्ते! मैं आपकी shipments track करने, delivery status check करने, और आपके orders के बारे में सवालों के जवाब देने में मदद कर सकता हूं। मैं आपकी कैसे सहायता कर सकता हूं?",
        guest: "TrackAS में आपका स्वागत है! मैं आपकी हमारे logistics platform के बारे में सामान्य जानकारी में मदद करने के लिए यहां हूं। आप क्या जानना चाहते हैं?"
      }
    };

    return messages[language as keyof typeof messages]?.[type as keyof typeof messages[typeof language]] || 
           messages.english[type as keyof typeof messages.english];
  };

  const detectLanguage = (text: string): string => {
    // Simple language detection based on common Hindi words/characters
    const hindiPattern = /[\u0900-\u097F]/;
    return hindiPattern.test(text) ? 'hindi' : 'english';
  };

  const getContextualResponse = (message: string, userType: string, language: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Common responses based on user type and language
    const responses = {
      english: {
        admin: {
          'user verification': 'I can help you verify users. You can approve or reject shippers, fleet operators, individual operators, vehicles, and drivers. Would you like me to show you the pending verifications?',
          'commission': 'You can configure the commission percentage (0-10%) that shippers pay. The current setting can be adjusted in the admin settings. Would you like me to help you change it?',
          'disputes': 'I can help you manage disputes between users. You can view open disputes, review evidence, and provide resolutions. Would you like me to show you the current disputes?',
          'analytics': 'I can provide you with platform analytics including user registrations, shipment volumes, revenue reports, and performance metrics. What specific analytics would you like to see?'
        },
        shipper: {
          'create shipment': 'To create a shipment, you need to provide pickup and destination addresses, consignment details, customer information, and set the price. Would you like me to guide you through the process?',
          'track shipment': 'You can track your shipments in real-time. I can show you the current status, location, and estimated delivery time. Which shipment would you like to track?',
          'payment': 'Payments are processed through our escrow system. The shipment cost is held until delivery, and commission is paid upfront or deducted later. Would you like me to explain the payment process?',
          'rate operator': 'After delivery, you can rate the operator based on their performance. This helps maintain service quality. Would you like me to show you how to rate an operator?'
        },
        fleet: {
          'fleet management': 'I can help you manage your fleet, including adding vehicles, assigning drivers, and monitoring performance. What aspect of fleet management would you like to work on?',
          'subscription': 'You can choose between pay-per-shipment or subscription models. Subscription plans are available in Small (₹5,000), Medium (₹15,000), and Large (₹35,000) tiers. Would you like me to explain the benefits?',
          'assignments': 'You receive shipment requests for your vehicles and have 2 minutes to accept or reject. You can then assign them to specific drivers. Would you like me to show you pending assignments?',
          'earnings': 'I can show you your earnings from completed shipments, subscription fees, and performance metrics. What earnings information would you like to see?'
        },
        individual: {
          'jobs': 'You can view available shipment assignments and accept or reject them within 2 minutes. I can show you current opportunities. Would you like me to display available jobs?',
          'navigation': 'I can help you with AI-optimized route navigation using real-time traffic data. Would you like me to calculate the best route for your current assignment?',
          'earnings': 'I can show you your earnings history, performance ratings, and payment status. What earnings information would you like to see?',
          'availability': 'You can mark yourself as available or unavailable for new assignments. Would you like me to help you update your availability status?'
        },
        customer: {
          'track': 'I can help you track your shipment using your tracking token. You can see real-time status, location, and estimated delivery time. Do you have your tracking token?',
          'delivery': 'I can provide information about your delivery status, driver details, and estimated arrival time. Which shipment would you like to know about?',
          'feedback': 'After delivery, you can rate your experience and provide feedback. This helps us improve our service. Would you like me to help you submit feedback?'
        }
      },
      hindi: {
        admin: {
          'user verification': 'मैं आपकी user verification में मदद कर सकता हूं। आप shippers, fleet operators, individual operators, vehicles, और drivers को approve या reject कर सकते हैं। क्या आप pending verifications देखना चाहेंगे?',
          'commission': 'आप commission percentage (0-10%) configure कर सकते हैं जो shippers pay करते हैं। current setting को admin settings में adjust किया जा सकता है। क्या आप इसे change करना चाहेंगे?'
        },
        shipper: {
          'create shipment': 'Shipment create करने के लिए, आपको pickup और destination addresses, consignment details, customer information provide करनी होगी, और price set करनी होगी। क्या आप process के through guide करना चाहेंगे?',
          'track shipment': 'आप अपनी shipments को real-time track कर सकते हैं। मैं आपको current status, location, और estimated delivery time दिखा सकता हूं। आप कौन सी shipment track करना चाहेंगे?'
        }
        // Add more Hindi responses as needed
      }
    };

    const langResponses = responses[language as keyof typeof responses];
    if (!langResponses) return getDefaultResponse(language);

    const userResponses = langResponses[userType as keyof typeof langResponses];
    if (!userResponses) return getDefaultResponse(language);

    // Find matching response
    for (const [key, response] of Object.entries(userResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return getDefaultResponse(language);
  };

  const getDefaultResponse = (language: string): string => {
    const responses = {
      english: "I understand you're asking about that. Let me help you with that. Could you please provide more specific details about what you need assistance with?",
      hindi: "मैं समझ गया कि आप इसके बारे में पूछ रहे हैं। मैं आपकी इस में मदद करूंगा। क्या आप कृपया और specific details provide कर सकते हैं कि आपको किस में सहायता चाहिए?"
    };
    return responses[language as keyof typeof responses] || responses.english;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Detect language
    const detectedLang = detectLanguage(inputMessage);
    setDetectedLanguage(detectedLang);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = getContextualResponse(inputMessage, userType, detectedLang);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        language: detectedLang
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        language: detectedLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getQuickActions = () => {
    const actions = {
      admin: ['User Verification', 'Commission Settings', 'View Disputes', 'Platform Analytics'],
      shipper: ['Create Shipment', 'Track Shipment', 'Payment Info', 'Rate Operator'],
      fleet: ['Fleet Management', 'Subscription Plans', 'View Assignments', 'Earnings Report'],
      individual: ['Available Jobs', 'Route Navigation', 'Earnings History', 'Update Availability'],
      customer: ['Track Shipment', 'Delivery Status', 'Submit Feedback', 'Contact Support'],
      guest: ['How It Works', 'Pricing Info', 'Contact Us', 'Register Now']
    };

    return actions[userType] || actions.guest;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">TrackAS AI Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDetectedLanguage(detectedLanguage === 'english' ? 'hindi' : 'english')}
            className="p-1 hover:bg-blue-700 rounded"
            title="Switch Language"
          >
            <Globe className="h-4 w-4" />
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-blue-700 rounded"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 max-w-xs p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-1">
          {getQuickActions().slice(0, 2).map((action) => (
            <button
              key={action}
              onClick={() => setInputMessage(action)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Language: {detectedLanguage === 'english' ? 'English' : 'हिंदी'}</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;