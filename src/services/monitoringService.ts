import { metricsHelpers } from '../lib/metrics';
import * as Sentry from '@sentry/react';

export class MonitoringService {
  private static instance: MonitoringService;
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Shipment monitoring
  public recordShipmentCreated(userRole: string, urgency: string, status: string) {
    try {
      metricsHelpers.recordShipmentCreated(userRole, urgency, status);
      Sentry.addBreadcrumb({
        message: 'Shipment created',
        category: 'shipment',
        data: { userRole, urgency, status }
      });
    } catch (error) {
      console.error('Error recording shipment creation:', error);
    }
  }

  public recordShipmentCompleted(userRole: string, deliveryTimeHours: number) {
    try {
      metricsHelpers.recordShipmentCompleted(userRole, deliveryTimeHours);
      Sentry.addBreadcrumb({
        message: 'Shipment completed',
        category: 'shipment',
        data: { userRole, deliveryTimeHours }
      });
    } catch (error) {
      console.error('Error recording shipment completion:', error);
    }
  }

  // Payment monitoring
  public recordPayment(method: string, status: string, amount: number) {
    try {
      metricsHelpers.recordPayment(method, status, amount);
      Sentry.addBreadcrumb({
        message: 'Payment processed',
        category: 'payment',
        data: { method, status, amount }
      });
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  }

  // User activity monitoring
  public recordUserLogin(userRole: string, method: string = 'email') {
    try {
      metricsHelpers.recordUserLogin(userRole, method);
      Sentry.addBreadcrumb({
        message: 'User login',
        category: 'auth',
        data: { userRole, method }
      });
    } catch (error) {
      console.error('Error recording user login:', error);
    }
  }

  // API monitoring
  public recordApiRequest(endpoint: string, method: string, statusCode: number, responseTime: number) {
    try {
      metricsHelpers.recordApiRequest(endpoint, method, statusCode, responseTime);
    } catch (error) {
      console.error('Error recording API request:', error);
    }
  }

  // Error monitoring
  public recordError(error: Error, context: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    try {
      metricsHelpers.recordError(error.name, severity, context);
      
      Sentry.withScope((scope) => {
        scope.setTag('component', context);
        scope.setLevel(severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info');
        scope.setContext('error_context', {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        Sentry.captureException(error);
      });
    } catch (monitoringError) {
      console.error('Error recording error:', monitoringError);
    }
  }

  // Revenue monitoring
  public recordRevenue(userRole: string, revenueType: string, amount: number) {
    try {
      metricsHelpers.recordRevenue(userRole, revenueType, amount);
      Sentry.addBreadcrumb({
        message: 'Revenue generated',
        category: 'business',
        data: { userRole, revenueType, amount }
      });
    } catch (error) {
      console.error('Error recording revenue:', error);
    }
  }

  // AI/ML monitoring
  public recordAIPrediction(predictionType: string, modelVersion: string, accuracy: number) {
    try {
      metricsHelpers.recordAIPrediction(predictionType, modelVersion, accuracy);
      Sentry.addBreadcrumb({
        message: 'AI prediction made',
        category: 'ai',
        data: { predictionType, modelVersion, accuracy }
      });
    } catch (error) {
      console.error('Error recording AI prediction:', error);
    }
  }

  // Performance monitoring
  public measurePerformance<T>(operation: string, fn: () => T): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds
      
      this.recordApiRequest(operation, 'internal', 200, duration);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      
      this.recordApiRequest(operation, 'internal', 500, duration);
      this.recordError(error as Error, operation, 'high');
      throw error;
    }
  }

  // Async performance monitoring
  public async measureAsyncPerformance<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      
      this.recordApiRequest(operation, 'internal', 200, duration);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      
      this.recordApiRequest(operation, 'internal', 500, duration);
      this.recordError(error as Error, operation, 'high');
      throw error;
    }
  }

  // Custom event tracking
  public trackEvent(eventName: string, properties: Record<string, any> = {}) {
    try {
      Sentry.addBreadcrumb({
        message: eventName,
        category: 'custom_event',
        data: properties
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Get system uptime
  public getUptime(): number {
    return (Date.now() - this.startTime) / 1000;
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();
