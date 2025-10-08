import { monitoring } from './monitoringService';

export interface PaymentRetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

export interface PaymentRetryAttempt {
  id: string;
  paymentId: string;
  attemptNumber: number;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  error?: string;
  responseTime?: number;
  attemptedAt: string;
  completedAt?: string;
  nextRetryAt?: string;
}

export interface PaymentWebhook {
  id: string;
  paymentId: string;
  eventType: 'payment.success' | 'payment.failed' | 'payment.pending' | 'payment.cancelled';
  payload: any;
  signature: string;
  receivedAt: string;
  processedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
}

export class PaymentRetryService {
  private static instance: PaymentRetryService;
  private retryConfig: PaymentRetryConfig;
  private retryAttempts: Map<string, PaymentRetryAttempt[]> = new Map();
  private webhooks: Map<string, PaymentWebhook> = new Map();
  private retryQueue: Set<string> = new Set();

  private constructor() {
    this.retryConfig = {
      maxRetries: 5,
      initialDelayMs: 1000, // 1 second
      maxDelayMs: 300000, // 5 minutes
      backoffMultiplier: 2,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      retryableErrors: [
        'NETWORK_ERROR',
        'TIMEOUT',
        'RATE_LIMITED',
        'SERVER_ERROR',
        'GATEWAY_ERROR'
      ]
    };
  }

  public static getInstance(): PaymentRetryService {
    if (!PaymentRetryService.instance) {
      PaymentRetryService.instance = new PaymentRetryService();
    }
    return PaymentRetryService.instance;
  }

  // Process payment webhook with automatic retry
  async processWebhook(webhook: Omit<PaymentWebhook, 'id' | 'receivedAt' | 'retryCount'>): Promise<PaymentWebhook> {
    return await monitoring.measureAsyncPerformance('processWebhook', async () => {
      const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newWebhook: PaymentWebhook = {
        id: webhookId,
        ...webhook,
        receivedAt: new Date().toISOString(),
        retryCount: 0,
        status: 'pending'
      };

      this.webhooks.set(webhookId, newWebhook);

      try {
        await this.executeWebhook(newWebhook);
        newWebhook.status = 'completed';
        newWebhook.processedAt = new Date().toISOString();
        this.webhooks.set(webhookId, newWebhook);

        monitoring.trackEvent('webhook_processed', { 
          webhookId, 
          paymentId: webhook.paymentId, 
          eventType: webhook.eventType 
        });

        return newWebhook;
      } catch (error) {
        newWebhook.status = 'failed';
        newWebhook.lastError = (error as Error).message;
        this.webhooks.set(webhookId, newWebhook);

        // Schedule retry if applicable
        if (this.shouldRetry(error as Error)) {
          await this.scheduleRetry(webhookId);
        }

        monitoring.recordError(error as Error, 'PaymentRetryService', 'medium');
        throw error;
      }
    });
  }

  // Execute webhook processing
  private async executeWebhook(webhook: PaymentWebhook): Promise<void> {
    const startTime = Date.now();

    try {
      // Simulate webhook processing
      await this.processPaymentEvent(webhook);
      
      const responseTime = Date.now() - startTime;
      monitoring.recordApiRequest(
        `webhook/${webhook.eventType}`,
        'POST',
        200,
        responseTime / 1000
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const statusCode = this.getStatusCodeFromError(error as Error);
      
      monitoring.recordApiRequest(
        `webhook/${webhook.eventType}`,
        'POST',
        statusCode,
        responseTime / 1000
      );
      
      throw error;
    }
  }

  // Process payment event based on type
  private async processPaymentEvent(webhook: PaymentWebhook): Promise<void> {
    switch (webhook.eventType) {
      case 'payment.success':
        await this.handlePaymentSuccess(webhook);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(webhook);
        break;
      case 'payment.pending':
        await this.handlePaymentPending(webhook);
        break;
      case 'payment.cancelled':
        await this.handlePaymentCancelled(webhook);
        break;
      default:
        throw new Error(`Unknown event type: ${webhook.eventType}`);
    }
  }

  // Handle payment success
  private async handlePaymentSuccess(webhook: PaymentWebhook): Promise<void> {
    const { paymentId, payload } = webhook;
    
    // Update payment status in database
    console.log(`Processing successful payment: ${paymentId}`);
    
    // Credit wallet if applicable
    if (payload.walletId) {
      // This would integrate with the wallet service
      console.log(`Crediting wallet ${payload.walletId} with ${payload.amount}`);
    }

    // Update shipment status if applicable
    if (payload.shipmentId) {
      console.log(`Updating shipment ${payload.shipmentId} status to paid`);
    }

    // Send confirmation notification
    console.log(`Sending payment confirmation for ${paymentId}`);
  }

  // Handle payment failure
  private async handlePaymentFailed(webhook: PaymentWebhook): Promise<void> {
    const { paymentId, payload } = webhook;
    
    console.log(`Processing failed payment: ${paymentId}`);
    
    // Update payment status
    console.log(`Payment ${paymentId} failed: ${payload.failureReason}`);
    
    // Notify user
    console.log(`Notifying user about payment failure for ${paymentId}`);
    
    // Update shipment status
    if (payload.shipmentId) {
      console.log(`Updating shipment ${payload.shipmentId} status to payment_failed`);
    }
  }

  // Handle payment pending
  private async handlePaymentPending(webhook: PaymentWebhook): Promise<void> {
    const { paymentId, payload } = webhook;
    
    console.log(`Processing pending payment: ${paymentId}`);
    
    // Update payment status
    console.log(`Payment ${paymentId} is pending verification`);
    
    // Set up monitoring for this payment
    console.log(`Setting up monitoring for pending payment ${paymentId}`);
  }

  // Handle payment cancellation
  private async handlePaymentCancelled(webhook: PaymentWebhook): Promise<void> {
    const { paymentId, payload } = webhook;
    
    console.log(`Processing cancelled payment: ${paymentId}`);
    
    // Update payment status
    console.log(`Payment ${paymentId} was cancelled: ${payload.cancellationReason}`);
    
    // Release any held funds
    if (payload.walletId) {
      console.log(`Releasing held funds for wallet ${payload.walletId}`);
    }
  }

  // Schedule retry for failed webhook
  private async scheduleRetry(webhookId: string): Promise<void> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    if (webhook.retryCount >= this.retryConfig.maxRetries) {
      console.log(`Max retries reached for webhook ${webhookId}`);
      monitoring.trackEvent('webhook_max_retries_reached', { webhookId });
      return;
    }

    const delay = this.calculateRetryDelay(webhook.retryCount);
    const retryAt = new Date(Date.now() + delay);

    // Create retry attempt record
    const attemptId = `attempt_${webhookId}_${webhook.retryCount + 1}`;
    const attempt: PaymentRetryAttempt = {
      id: attemptId,
      paymentId: webhook.paymentId,
      attemptNumber: webhook.retryCount + 1,
      status: 'pending',
      attemptedAt: new Date().toISOString(),
      nextRetryAt: retryAt.toISOString()
    };

    if (!this.retryAttempts.has(webhookId)) {
      this.retryAttempts.set(webhookId, []);
    }
    this.retryAttempts.get(webhookId)!.push(attempt);

    // Schedule retry
    setTimeout(async () => {
      await this.executeRetry(webhookId);
    }, delay);

    this.retryQueue.add(webhookId);
    webhook.retryCount++;
    this.webhooks.set(webhookId, webhook);

    console.log(`Scheduled retry ${webhook.retryCount} for webhook ${webhookId} in ${delay}ms`);
  }

  // Execute retry attempt
  private async executeRetry(webhookId: string): Promise<void> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      console.error(`Webhook ${webhookId} not found for retry`);
      return;
    }

    const attempts = this.retryAttempts.get(webhookId) || [];
    const currentAttempt = attempts[attempts.length - 1];
    
    if (!currentAttempt) {
      console.error(`No retry attempt found for webhook ${webhookId}`);
      return;
    }

    currentAttempt.status = 'processing';
    this.retryAttempts.set(webhookId, attempts);

    try {
      await this.executeWebhook(webhook);
      
      // Success
      currentAttempt.status = 'success';
      currentAttempt.completedAt = new Date().toISOString();
      webhook.status = 'completed';
      webhook.processedAt = new Date().toISOString();
      
      this.retryAttempts.set(webhookId, attempts);
      this.webhooks.set(webhookId, webhook);
      this.retryQueue.delete(webhookId);

      monitoring.trackEvent('webhook_retry_success', { 
        webhookId, 
        attemptNumber: currentAttempt.attemptNumber 
      });

      console.log(`Retry successful for webhook ${webhookId} on attempt ${currentAttempt.attemptNumber}`);
    } catch (error) {
      // Failed again
      currentAttempt.status = 'failed';
      currentAttempt.error = (error as Error).message;
      currentAttempt.completedAt = new Date().toISOString();
      
      this.retryAttempts.set(webhookId, attempts);

      console.log(`Retry failed for webhook ${webhookId} on attempt ${currentAttempt.attemptNumber}: ${(error as Error).message}`);

      // Schedule next retry if not at max
      if (webhook.retryCount < this.retryConfig.maxRetries) {
        await this.scheduleRetry(webhookId);
      } else {
        webhook.status = 'failed';
        webhook.lastError = (error as Error).message;
        this.webhooks.set(webhookId, webhook);
        this.retryQueue.delete(webhookId);

        monitoring.trackEvent('webhook_retry_failed', { 
          webhookId, 
          finalAttempt: currentAttempt.attemptNumber 
        });
      }
    }
  }

  // Calculate retry delay with exponential backoff
  private calculateRetryDelay(retryCount: number): number {
    const delay = this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  // Check if error should trigger retry
  private shouldRetry(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    
    // Check for retryable error messages
    for (const retryableError of this.retryConfig.retryableErrors) {
      if (errorMessage.includes(retryableError.toLowerCase())) {
        return true;
      }
    }

    // Check for retryable status codes (if available in error)
    const statusCodeMatch = errorMessage.match(/status[:\s]*(\d+)/i);
    if (statusCodeMatch) {
      const statusCode = parseInt(statusCodeMatch[1]);
      return this.retryConfig.retryableStatusCodes.includes(statusCode);
    }

    return false;
  }

  // Get status code from error message
  private getStatusCodeFromError(error: Error): number {
    const statusCodeMatch = error.message.match(/status[:\s]*(\d+)/i);
    if (statusCodeMatch) {
      return parseInt(statusCodeMatch[1]);
    }
    return 500; // Default to internal server error
  }

  // Get retry statistics
  async getRetryStats(): Promise<{
    totalWebhooks: number;
    pendingRetries: number;
    successfulRetries: number;
    failedRetries: number;
    averageRetryCount: number;
  }> {
    const webhooks = Array.from(this.webhooks.values());
    const totalWebhooks = webhooks.length;
    const pendingRetries = this.retryQueue.size;
    
    let successfulRetries = 0;
    let failedRetries = 0;
    let totalRetryCount = 0;

    webhooks.forEach(webhook => {
      if (webhook.status === 'completed') {
        successfulRetries++;
      } else if (webhook.status === 'failed') {
        failedRetries++;
      }
      totalRetryCount += webhook.retryCount;
    });

    const averageRetryCount = totalWebhooks > 0 ? totalRetryCount / totalWebhooks : 0;

    return {
      totalWebhooks,
      pendingRetries,
      successfulRetries,
      failedRetries,
      averageRetryCount
    };
  }

  // Get retry attempts for a webhook
  async getRetryAttempts(webhookId: string): Promise<PaymentRetryAttempt[]> {
    return this.retryAttempts.get(webhookId) || [];
  }

  // Cancel retry for a webhook
  async cancelRetry(webhookId: string, reason: string): Promise<void> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    webhook.status = 'cancelled';
    webhook.lastError = reason;
    this.webhooks.set(webhookId, webhook);
    this.retryQueue.delete(webhookId);

    // Cancel any pending retry attempts
    const attempts = this.retryAttempts.get(webhookId) || [];
    const pendingAttempt = attempts.find(a => a.status === 'pending');
    if (pendingAttempt) {
      pendingAttempt.status = 'cancelled';
      pendingAttempt.completedAt = new Date().toISOString();
      this.retryAttempts.set(webhookId, attempts);
    }

    monitoring.trackEvent('webhook_retry_cancelled', { webhookId, reason });
  }

  // Update retry configuration
  updateRetryConfig(config: Partial<PaymentRetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
    console.log('Retry configuration updated:', this.retryConfig);
  }
}

// Export singleton instance
export const paymentRetryService = PaymentRetryService.getInstance();
