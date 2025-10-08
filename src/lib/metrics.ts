// Prometheus metrics collection for TrackAS
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics({ register });

// Custom metrics for TrackAS
export const trackasMetrics = {
  // Shipment metrics
  shipmentsCreated: new Counter({
    name: 'trackas_shipments_created_total',
    help: 'Total number of shipments created',
    labelNames: ['user_role', 'urgency', 'status']
  }),

  shipmentsCompleted: new Counter({
    name: 'trackas_shipments_completed_total',
    help: 'Total number of shipments completed',
    labelNames: ['user_role', 'delivery_time_category']
  }),

  shipmentDuration: new Histogram({
    name: 'trackas_shipment_duration_seconds',
    help: 'Duration of shipments from creation to completion',
    labelNames: ['user_role', 'distance_category'],
    buckets: [300, 600, 1800, 3600, 7200, 14400, 28800, 86400] // 5min to 24h
  }),

  // Payment metrics
  paymentsProcessed: new Counter({
    name: 'trackas_payments_processed_total',
    help: 'Total number of payments processed',
    labelNames: ['payment_method', 'status', 'amount_category']
  }),

  paymentAmount: new Histogram({
    name: 'trackas_payment_amount_rupees',
    help: 'Payment amounts in Indian Rupees',
    labelNames: ['payment_method'],
    buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000]
  }),

  // User activity metrics
  userLogins: new Counter({
    name: 'trackas_user_logins_total',
    help: 'Total number of user logins',
    labelNames: ['user_role', 'login_method']
  }),

  activeUsers: new Gauge({
    name: 'trackas_active_users_current',
    help: 'Current number of active users',
    labelNames: ['user_role']
  }),

  // System performance metrics
  apiResponseTime: new Histogram({
    name: 'trackas_api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['endpoint', 'method', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
  }),

  apiRequests: new Counter({
    name: 'trackas_api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['endpoint', 'method', 'status_code']
  }),

  // Error metrics
  errorsTotal: new Counter({
    name: 'trackas_errors_total',
    help: 'Total number of errors',
    labelNames: ['error_type', 'severity', 'component']
  }),

  // Business metrics
  revenueGenerated: new Counter({
    name: 'trackas_revenue_generated_rupees',
    help: 'Total revenue generated in Indian Rupees',
    labelNames: ['user_role', 'revenue_type']
  }),

  fleetUtilization: new Gauge({
    name: 'trackas_fleet_utilization_percent',
    help: 'Fleet utilization percentage',
    labelNames: ['fleet_id', 'vehicle_type']
  }),

  // AI/ML metrics
  aiPredictions: new Counter({
    name: 'trackas_ai_predictions_total',
    help: 'Total number of AI predictions made',
    labelNames: ['prediction_type', 'model_version', 'accuracy_category']
  }),

  aiPredictionAccuracy: new Histogram({
    name: 'trackas_ai_prediction_accuracy',
    help: 'Accuracy of AI predictions (0-1 scale)',
    labelNames: ['prediction_type', 'model_version'],
    buckets: [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99, 1.0]
  })
};

// Helper functions for metrics
export const metricsHelpers = {
  recordShipmentCreated: (userRole: string, urgency: string, status: string) => {
    trackasMetrics.shipmentsCreated.inc({ user_role: userRole, urgency, status });
  },

  recordShipmentCompleted: (userRole: string, deliveryTimeHours: number) => {
    const category = deliveryTimeHours < 2 ? 'express' : 
                    deliveryTimeHours < 8 ? 'same_day' : 
                    deliveryTimeHours < 24 ? 'next_day' : 'standard';
    trackasMetrics.shipmentsCompleted.inc({ user_role: userRole, delivery_time_category: category });
  },

  recordPayment: (method: string, status: string, amount: number) => {
    const amountCategory = amount < 1000 ? 'small' :
                          amount < 5000 ? 'medium' :
                          amount < 20000 ? 'large' : 'enterprise';
    
    trackasMetrics.paymentsProcessed.inc({ 
      payment_method: method, 
      status, 
      amount_category: amountCategory 
    });
    trackasMetrics.paymentAmount.observe({ payment_method: method }, amount);
  },

  recordUserLogin: (userRole: string, method: string = 'email') => {
    trackasMetrics.userLogins.inc({ user_role: userRole, login_method: method });
  },

  recordApiRequest: (endpoint: string, method: string, statusCode: number, responseTime: number) => {
    trackasMetrics.apiRequests.inc({ endpoint, method, status_code: statusCode.toString() });
    trackasMetrics.apiResponseTime.observe({ endpoint, method, status_code: statusCode.toString() }, responseTime);
  },

  recordError: (errorType: string, severity: string, component: string) => {
    trackasMetrics.errorsTotal.inc({ error_type: errorType, severity, component });
  },

  recordRevenue: (userRole: string, revenueType: string, amount: number) => {
    trackasMetrics.revenueGenerated.inc({ user_role: userRole, revenue_type: revenueType }, amount);
  },

  recordAIPrediction: (predictionType: string, modelVersion: string, accuracy: number) => {
    const accuracyCategory = accuracy >= 0.95 ? 'excellent' :
                             accuracy >= 0.9 ? 'good' :
                             accuracy >= 0.8 ? 'fair' : 'poor';
    
    trackasMetrics.aiPredictions.inc({ 
      prediction_type: predictionType, 
      model_version: modelVersion, 
      accuracy_category: accuracyCategory 
    });
    trackasMetrics.aiPredictionAccuracy.observe({ 
      prediction_type: predictionType, 
      model_version: modelVersion 
    }, accuracy);
  }
};

export { register };
