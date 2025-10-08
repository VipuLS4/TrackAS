// AI Feedback & Reinforcement Learning Types
export interface AIFeedback {
  id: string;
  shipmentId: string;
  fleetId: string;
  userId: string;
  userType: 'shipper' | 'fleet' | 'individual';
  feedbackType: 'rating' | 'completion_time' | 'service_quality' | 'route_efficiency' | 'cost_effectiveness';
  rating: number; // 1-5 scale
  feedback: string;
  metadata: {
    actualDeliveryTime?: number; // in minutes
    estimatedDeliveryTime?: number; // in minutes
    actualCost?: number; // in paise
    estimatedCost?: number; // in paise
    routeEfficiency?: number; // 0-1 scale
    serviceQuality?: number; // 1-5 scale
    weatherConditions?: string;
    trafficConditions?: string;
    vehicleType?: string;
    driverExperience?: number; // years
    distance?: number; // in km
    weight?: number; // in kg
    urgency?: 'low' | 'medium' | 'high' | 'express';
  };
  createdAt: string;
  processedAt?: string;
  status: 'pending' | 'processed' | 'ignored';
}

export interface AIPrediction {
  id: string;
  predictionType: 'shipment_matching' | 'route_optimization' | 'price_estimation' | 'delivery_time' | 'demand_forecasting';
  inputData: any;
  prediction: any;
  confidence: number; // 0-1 scale
  modelVersion: string;
  accuracy?: number; // Calculated after validation
  createdAt: string;
  validatedAt?: string;
  validationResult?: 'correct' | 'incorrect' | 'partial';
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'reinforcement_learning' | 'supervised_learning' | 'unsupervised_learning';
  status: 'training' | 'active' | 'deprecated' | 'failed';
  accuracy: number;
  lastTrained: string;
  trainingDataSize: number;
  hyperparameters: any;
  performanceMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    accuracy: number;
    mse?: number; // For regression models
    mae?: number; // For regression models
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentMatch {
  id: string;
  shipmentId: string;
  fleetId: string;
  matchScore: number; // 0-1 scale
  confidence: number; // 0-1 scale
  reasons: string[];
  metadata: {
    distance: number;
    estimatedDeliveryTime: number;
    estimatedCost: number;
    fleetRating: number;
    availability: boolean;
    vehicleType: string;
    driverExperience: number;
    previousPerformance: number;
  };
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

export interface ReinforcementLearningState {
  stateId: string;
  shipmentId: string;
  fleetId: string;
  state: {
    shipment: {
      weight: number;
      volume: number;
      urgency: string;
      distance: number;
      pickupLocation: { lat: number; lng: number };
      deliveryLocation: { lat: number; lng: number };
      timeWindow: { start: string; end: string };
    };
    fleet: {
      currentLocation: { lat: number; lng: number };
      vehicleType: string;
      capacity: number;
      driverExperience: number;
      rating: number;
      availability: boolean;
      currentLoad: number;
    };
    environment: {
      timeOfDay: number; // 0-24
      dayOfWeek: number; // 0-6
      weather: string;
      trafficLevel: number; // 0-1
      season: string;
    };
  };
  action: 'accept' | 'reject' | 'counter_offer';
  reward: number;
  nextState?: string;
  createdAt: string;
}

export interface AIInsights {
  id: string;
  insightType: 'performance_trend' | 'optimization_suggestion' | 'anomaly_detection' | 'market_analysis';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: 'efficiency' | 'cost' | 'quality' | 'safety' | 'compliance';
  data: any;
  recommendations: string[];
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'dismissed' | 'implemented';
}

// AI Service Interface
export interface AIService {
  // Feedback Management
  createFeedback(feedback: Omit<AIFeedback, 'id' | 'createdAt' | 'status'>): Promise<AIFeedback>;
  processFeedback(feedbackId: string): Promise<AIFeedback>;
  getFeedbackByShipment(shipmentId: string): Promise<AIFeedback[]>;
  getFeedbackByFleet(fleetId: string): Promise<AIFeedback[]>;
  getFeedbackStats(period: string): Promise<{
    totalFeedback: number;
    averageRating: number;
    feedbackByType: Record<string, number>;
    trend: 'improving' | 'declining' | 'stable';
  }>;

  // Prediction Management
  createPrediction(prediction: Omit<AIPrediction, 'id' | 'createdAt'>): Promise<AIPrediction>;
  validatePrediction(predictionId: string, actualResult: any): Promise<AIPrediction>;
  getPredictionsByType(type: string, limit?: number): Promise<AIPrediction[]>;
  getPredictionAccuracy(modelVersion: string): Promise<number>;

  // Model Management
  createModel(model: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIModel>;
  updateModel(modelId: string, updates: Partial<AIModel>): Promise<AIModel>;
  getActiveModel(type: string): Promise<AIModel>;
  getModelPerformance(modelId: string): Promise<AIModel['performanceMetrics']>;

  // Shipment Matching
  findBestMatches(shipmentId: string, limit?: number): Promise<ShipmentMatch[]>;
  calculateMatchScore(shipmentId: string, fleetId: string): Promise<number>;
  updateMatchScore(shipmentId: string, fleetId: string, feedback: number): Promise<void>;

  // Reinforcement Learning
  createRLState(state: Omit<ReinforcementLearningState, 'id' | 'createdAt'>): Promise<ReinforcementLearningState>;
  updateRLReward(stateId: string, reward: number): Promise<ReinforcementLearningState>;
  getRLTrainingData(limit?: number): Promise<ReinforcementLearningState[]>;
  trainRLModel(): Promise<AIModel>;

  // Insights Generation
  generateInsights(): Promise<AIInsights[]>;
  getInsightsByCategory(category: string): Promise<AIInsights[]>;
  dismissInsight(insightId: string): Promise<void>;
  implementInsight(insightId: string): Promise<void>;
}
