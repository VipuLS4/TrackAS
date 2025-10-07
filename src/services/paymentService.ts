import { supabase } from '../lib/supabase';

export interface PaymentTransaction {
  id: string;
  shipmentId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  type: 'ESCROW_IN' | 'ESCROW_OUT' | 'COMMISSION' | 'SUBSCRIPTION' | 'SETTLEMENT' | 'REFUND' | 'CHARGEBACK' | 'DISPUTE_HOLD';
  status: 'PENDING' | 'PROCESSING' | 'HELD' | 'COMPLETE' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED';
  providerTxnId?: string;
  providerResponse?: any;
  escrowWalletId?: string;
  commissionRate?: number;
  refundReason?: string;
  disputeId?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  settledAt?: string;
}

export interface EscrowWallet {
  id: string;
  walletType: 'TRACKAS_ESCROW' | 'TRACKAS_COMMISSION' | 'FLEET_WALLET' | 'DRIVER_WALLET';
  ownerId?: string;
  ownerType?: 'fleet' | 'driver' | 'shipper' | 'platform';
  balance: number;
  currency: string;
  providerAccountId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FleetSubscription {
  id: string;
  fleetId: string;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  feeAmount: number;
  feeBasis: 'per_fleet' | 'per_vehicle';
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  gracePeriodEnd?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  id: string;
  shipmentId: string;
  requestedBy: string;
  requestType: 'CANCELLATION' | 'DISPUTE' | 'FAILED_DELIVERY' | 'ADMIN_OVERRIDE';
  amountRequested: number;
  reason: string;
  evidence?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
  approvedBy?: string;
  approvedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfig {
  key: string;
  value: any;
  description: string;
  category: 'COMMISSION' | 'ESCROW' | 'SUBSCRIPTION' | 'REFUND' | 'DISPUTE' | 'GATEWAY';
  updatedAt: string;
  updatedBy?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private readonly DEFAULT_COMMISSION_RATE = 7.0;
  private readonly ESCROW_HOLD_PERIOD_DAYS = 3;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Create escrow for shipment
  async createShipmentEscrow(
    shipmentId: string,
    shipperId: string,
    amount: number,
    fleetSubscriptionTier: string = 'basic'
  ): Promise<PaymentTransaction> {
    try {
      // Calculate commission
      const commissionAmount = await this.calculateCommission(amount, fleetSubscriptionTier);
      const netAmount = amount - commissionAmount;

      // Get TrackAS escrow wallet
      const escrowWallet = await this.getTrackASEscrowWallet();
      if (!escrowWallet) {
        throw new Error('TrackAS escrow wallet not found');
      }

      // Create escrow payment
      const escrowPayment = await this.createPaymentTransaction({
        shipmentId,
        payerId: shipperId,
        payeeId: '', // Will be set when assigned
        amount: netAmount,
        type: 'ESCROW_IN',
        escrowWalletId: escrowWallet.id
      });

      // Create commission payment
      const commissionPayment = await this.createPaymentTransaction({
        shipmentId,
        payerId: shipperId,
        payeeId: '', // TrackAS commission
        amount: commissionAmount,
        type: 'COMMISSION',
        commissionRate: this.DEFAULT_COMMISSION_RATE
      });

      // Process payments
      await this.processPayment(escrowPayment.id);
      await this.processPayment(commissionPayment.id);

      // Update wallet balances
      await this.updateWalletBalance(escrowWallet.id, netAmount, 'CREDIT');

      return escrowPayment;
    } catch (error) {
      console.error('Error creating shipment escrow:', error);
      throw new Error('Failed to create escrow');
    }
  }

  // Process escrow release after delivery
  async processEscrowRelease(shipmentId: string, adminId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('process_escrow_release', {
        p_shipment_id: shipmentId,
        p_admin_id: adminId
      });

      if (error) throw error;

      // Log audit
      await this.logPaymentAudit(shipmentId, 'ESCROW_RELEASED', adminId || 'system', 'system');

      return true;
    } catch (error) {
      console.error('Error processing escrow release:', error);
      return false;
    }
  }

  // Calculate commission based on subscription tier
  async calculateCommission(amount: number, subscriptionTier: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_commission', {
        p_shipment_amount: amount,
        p_fleet_subscription_tier: subscriptionTier
      });

      if (error) throw error;
      return data || (amount * (this.DEFAULT_COMMISSION_RATE / 100));
    } catch (error) {
      console.error('Error calculating commission:', error);
      return amount * (this.DEFAULT_COMMISSION_RATE / 100);
    }
  }

  // Create payment transaction
  private async createPaymentTransaction(data: {
    shipmentId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    type: string;
    escrowWalletId?: string;
    commissionRate?: number;
  }): Promise<PaymentTransaction> {
    try {
      const { data: transaction, error } = await supabase.rpc('create_payment_transaction', {
        p_shipment_id: data.shipmentId,
        p_payer_id: data.payerId,
        p_payee_id: data.payeeId,
        p_amount: data.amount,
        p_type: data.type,
        p_escrow_wallet_id: data.escrowWalletId,
        p_commission_rate: data.commissionRate
      });

      if (error) throw error;
      return transaction;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  // Process payment through gateway
  private async processPayment(transactionId: string): Promise<boolean> {
    try {
      // Get transaction details
      const { data: transaction, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      // Simulate payment gateway call
      const paymentResult = await this.mockPaymentGatewayCall(transaction);

      // Update transaction status
      await this.updatePaymentStatus(
        transactionId,
        paymentResult.status,
        paymentResult.providerTxnId,
        paymentResult.response
      );

      return paymentResult.success;
    } catch (error) {
      console.error('Error processing payment:', error);
      return false;
    }
  }

  // Mock payment gateway call
  private async mockPaymentGatewayCall(transaction: any): Promise<{
    success: boolean;
    status: string;
    providerTxnId?: string;
    response?: any;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success rate (95%)
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        status: transaction.type === 'ESCROW_IN' ? 'HELD' : 'COMPLETE',
        providerTxnId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        response: {
          gateway: 'razorpay',
          status: 'success',
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        status: 'FAILED',
        response: {
          gateway: 'razorpay',
          status: 'failed',
          error: 'Payment processing failed',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Update payment status
  private async updatePaymentStatus(
    transactionId: string,
    status: string,
    providerTxnId?: string,
    response?: any
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (providerTxnId) updateData.provider_txn_id = providerTxnId;
      if (response) updateData.provider_response = response;
      if (status === 'COMPLETE') updateData.processed_at = new Date().toISOString();

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }

  // Update wallet balance
  private async updateWalletBalance(
    walletId: string,
    amount: number,
    entryType: 'CREDIT' | 'DEBIT'
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_wallet_balance', {
        p_wallet_id: walletId,
        p_amount: amount,
        p_entry_type: entryType
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
    }
  }

  // Get TrackAS escrow wallet
  private async getTrackASEscrowWallet(): Promise<EscrowWallet | null> {
    try {
      const { data, error } = await supabase
        .from('escrow_wallets')
        .select('*')
        .eq('wallet_type', 'TRACKAS_ESCROW')
        .eq('owner_type', 'platform')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting TrackAS escrow wallet:', error);
      return null;
    }
  }

  // Process refund
  async processRefund(
    shipmentId: string,
    refundAmount: number,
    refundReason: string,
    adminId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('process_refund', {
        p_shipment_id: shipmentId,
        p_refund_amount: refundAmount,
        p_refund_reason: refundReason,
        p_admin_id: adminId
      });

      if (error) throw error;

      // Log audit
      await this.logPaymentAudit(shipmentId, 'REFUND_PROCESSED', adminId, 'admin');

      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  // Create refund request
  async createRefundRequest(
    shipmentId: string,
    requestedBy: string,
    requestType: string,
    amountRequested: number,
    reason: string,
    evidence?: any
  ): Promise<RefundRequest> {
    try {
      const { data, error } = await supabase
        .from('refund_requests')
        .insert({
          shipment_id: shipmentId,
          requested_by: requestedBy,
          request_type: requestType,
          amount_requested: amountRequested,
          reason,
          evidence
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating refund request:', error);
      throw error;
    }
  }

  // Approve refund request
  async approveRefundRequest(
    requestId: string,
    adminId: string,
    approvedAmount?: number
  ): Promise<boolean> {
    try {
      // Get refund request
      const { data: request, error: fetchError } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      const refundAmount = approvedAmount || request.amount_requested;

      // Process refund
      const success = await this.processRefund(
        request.shipment_id,
        refundAmount,
        `Approved: ${request.reason}`,
        adminId
      );

      if (success) {
        // Update refund request status
        const { error: updateError } = await supabase
          .from('refund_requests')
          .update({
            status: 'APPROVED',
            approved_by: adminId,
            approved_at: new Date().toISOString(),
            amount_requested: refundAmount
          })
          .eq('id', requestId);

        if (updateError) throw updateError;
      }

      return success;
    } catch (error) {
      console.error('Error approving refund request:', error);
      return false;
    }
  }

  // Create fleet subscription
  async createFleetSubscription(
    fleetId: string,
    subscriptionTier: string,
    billingCycle: string,
    feeAmount: number,
    feeBasis: string
  ): Promise<FleetSubscription> {
    try {
      const now = new Date();
      const periodEnd = new Date(now);
      
      // Calculate period end based on billing cycle
      switch (billingCycle) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          break;
        case 'yearly':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
      }

      const { data, error } = await supabase
        .from('fleet_subscriptions')
        .insert({
          fleet_id: fleetId,
          subscription_tier: subscriptionTier,
          billing_cycle: billingCycle,
          fee_amount: feeAmount,
          fee_basis: feeBasis,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          next_billing_date: periodEnd.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating fleet subscription:', error);
      throw error;
    }
  }

  // Process subscription payment
  async processSubscriptionPayment(subscriptionId: string): Promise<boolean> {
    try {
      // Get subscription details
      const { data: subscription, error: fetchError } = await supabase
        .from('fleet_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (fetchError) throw fetchError;

      // Create subscription payment
      const payment = await this.createPaymentTransaction({
        shipmentId: '', // No shipment for subscription
        payerId: subscription.fleet_id,
        payeeId: '', // TrackAS
        amount: subscription.fee_amount,
        type: 'SUBSCRIPTION'
      });

      // Process payment
      const success = await this.processPayment(payment.id);

      if (success) {
        // Update subscription period
        const now = new Date();
        const nextPeriodEnd = new Date(subscription.current_period_end);
        
        switch (subscription.billing_cycle) {
          case 'monthly':
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
            break;
          case 'quarterly':
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 3);
            break;
          case 'yearly':
            nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
            break;
        }

        const { error: updateError } = await supabase
          .from('fleet_subscriptions')
          .update({
            current_period_start: subscription.current_period_end,
            current_period_end: nextPeriodEnd.toISOString(),
            next_billing_date: nextPeriodEnd.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriptionId);

        if (updateError) throw updateError;
      }

      return success;
    } catch (error) {
      console.error('Error processing subscription payment:', error);
      return false;
    }
  }

  // Get payment history
  async getPaymentHistory(shipmentId?: string, userId?: string): Promise<PaymentTransaction[]> {
    try {
      let query = supabase.from('payments').select('*');

      if (shipmentId) {
        query = query.eq('shipment_id', shipmentId);
      }

      if (userId) {
        query = query.or(`payer_id.eq.${userId},payee_id.eq.${userId}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Get wallet balance
  async getWalletBalance(userId: string, walletType: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('escrow_wallets')
        .select('balance')
        .eq('owner_id', userId)
        .eq('wallet_type', walletType)
        .single();

      if (error) throw error;
      return data?.balance || 0;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  // Get payment configuration
  async getPaymentConfig(category?: string): Promise<PaymentConfig[]> {
    try {
      let query = supabase.from('payment_config').select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment config:', error);
      return [];
    }
  }

  // Update payment configuration
  async updatePaymentConfig(
    key: string,
    value: any,
    description: string,
    category: string,
    adminId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_config')
        .upsert({
          key,
          value,
          description,
          category,
          updated_at: new Date().toISOString(),
          updated_by: adminId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating payment config:', error);
      return false;
    }
  }

  // Log payment audit
  private async logPaymentAudit(
    paymentId: string,
    action: string,
    actorId: string,
    actorType: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_payment_audit', {
        p_payment_id: paymentId,
        p_action: action,
        p_actor_id: actorId,
        p_actor_type: actorType,
        p_old_values: oldValues,
        p_new_values: newValues
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging payment audit:', error);
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(startDate: string, endDate: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('payment_analytics')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Process analytics data
      const analytics = {
        totalCommission: 0,
        totalEscrowHeld: 0,
        totalSettlements: 0,
        totalRefunds: 0,
        subscriptionRevenue: 0,
        paymentFailures: 0,
        dailyData: data || []
      };

      data?.forEach(record => {
        switch (record.metric_type) {
          case 'DAILY_COMMISSION':
            analytics.totalCommission += parseFloat(record.metric_value);
            break;
          case 'ESCROW_HELD':
            analytics.totalEscrowHeld += parseFloat(record.metric_value);
            break;
          case 'SETTLEMENTS':
            analytics.totalSettlements += parseFloat(record.metric_value);
            break;
          case 'REFUNDS':
            analytics.totalRefunds += parseFloat(record.metric_value);
            break;
          case 'SUBSCRIPTION_REVENUE':
            analytics.subscriptionRevenue += parseFloat(record.metric_value);
            break;
          case 'PAYMENT_FAILURES':
            analytics.paymentFailures += parseFloat(record.metric_value);
            break;
        }
      });

      return analytics;
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      return {
        totalCommission: 0,
        totalEscrowHeld: 0,
        totalSettlements: 0,
        totalRefunds: 0,
        subscriptionRevenue: 0,
        paymentFailures: 0,
        dailyData: []
      };
    }
  }
}

export default PaymentService;
