import { supabase } from '../lib/supabase';

export interface PaymentTransaction {
  id: string;
  shipmentId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  type: 'ESCROW_IN' | 'COMMISSION' | 'SETTLEMENT' | 'REFUND' | 'CHARGEBACK';
  status: 'PENDING' | 'HELD' | 'COMPLETE' | 'FAILED' | 'CANCELLED';
  providerTxnId?: string;
  providerResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowDetails {
  shipmentId: string;
  totalAmount: number;
  commissionAmount: number;
  netAmount: number;
  holdPeriod: number; // days
  status: 'HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';
  releaseDate?: string;
  disputeReason?: string;
}

export interface SettlementRequest {
  shipmentId: string;
  payeeId: string;
  amount: number;
  reason: string;
  metadata?: any;
}

export class PaymentSettlementService {
  private static instance: PaymentSettlementService;
  private readonly COMMISSION_PERCENTAGE = 5.0; // 5%
  private readonly HOLD_PERIOD_DAYS = 3; // 3 days hold for disputes

  public static getInstance(): PaymentSettlementService {
    if (!PaymentSettlementService.instance) {
      PaymentSettlementService.instance = new PaymentSettlementService();
    }
    return PaymentSettlementService.instance;
  }

  // Create escrow for shipment
  async createEscrow(shipmentId: string, shipperId: string, amount: number): Promise<PaymentTransaction> {
    try {
      // Calculate commission
      const commissionAmount = amount * (this.COMMISSION_PERCENTAGE / 100);
      const netAmount = amount - commissionAmount;

      // Create escrow transaction
      const escrowTransaction = await this.createPaymentTransaction({
        shipmentId,
        payerId: shipperId,
        payeeId: '', // Will be set when assigned
        amount: netAmount,
        type: 'ESCROW_IN',
        status: 'PENDING'
      });

      // Create commission transaction
      const commissionTransaction = await this.createPaymentTransaction({
        shipmentId,
        payerId: shipperId,
        payeeId: '', // Platform commission
        amount: commissionAmount,
        type: 'COMMISSION',
        status: 'PENDING'
      });

      // Process payments
      await this.processPayment(escrowTransaction.id);
      await this.processPayment(commissionTransaction.id);

      return escrowTransaction;
    } catch (error) {
      console.error('Error creating escrow:', error);
      throw new Error('Failed to create escrow');
    }
  }

  // Process shipment settlement
  async processSettlement(shipmentId: string): Promise<boolean> {
    try {
      // Get shipment details
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      // Check if shipment is delivered
      if (shipment.status !== 'DELIVERED') {
        throw new Error('Shipment must be delivered before settlement');
      }

      // Get escrow transaction
      const escrowTransaction = await this.getEscrowTransaction(shipmentId);
      if (!escrowTransaction) {
        throw new Error('Escrow transaction not found');
      }

      // Check hold period
      const holdPeriod = await this.getHoldPeriod(shipmentId);
      if (holdPeriod > 0) {
        // Still in hold period
        console.log(`Settlement on hold for ${holdPeriod} more days`);
        return false;
      }

      // Check for disputes
      const hasDispute = await this.checkForDisputes(shipmentId);
      if (hasDispute) {
        console.log('Settlement blocked due to active dispute');
        return false;
      }

      // Process settlement
      const settlementAmount = escrowTransaction.amount;
      const payeeId = shipment.assigned_fleet_id || shipment.assigned_driver_id;

      if (!payeeId) {
        throw new Error('No payee found for settlement');
      }

      // Create settlement transaction
      const settlementTransaction = await this.createPaymentTransaction({
        shipmentId,
        payerId: '', // Platform releases escrow
        payeeId,
        amount: settlementAmount,
        type: 'SETTLEMENT',
        status: 'PENDING'
      });

      // Process settlement payment
      await this.processPayment(settlementTransaction.id);

      // Update escrow status
      await this.updateEscrowStatus(shipmentId, 'RELEASED');

      // Create settlement event
      await this.createSettlementEvent(shipmentId, settlementAmount, payeeId);

      return true;
    } catch (error) {
      console.error('Error processing settlement:', error);
      return false;
    }
  }

  // Create payment transaction
  private async createPaymentTransaction(data: {
    shipmentId: string;
    payerId: string;
    payeeId: string;
    amount: number;
    type: 'ESCROW_IN' | 'COMMISSION' | 'SETTLEMENT' | 'REFUND' | 'CHARGEBACK';
    status: 'PENDING' | 'HELD' | 'COMPLETE' | 'FAILED' | 'CANCELLED';
  }): Promise<PaymentTransaction> {
    try {
      const { data: transaction, error } = await supabase
        .from('payments')
        .insert({
          shipment_id: data.shipmentId,
          payer_id: data.payerId,
          payee_id: data.payeeId,
          amount: data.amount,
          type: data.type,
          status: data.status
        })
        .select()
        .single();

      if (error) throw error;
      return transaction;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  // Process payment through payment gateway
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
      await this.updatePaymentStatus(transactionId, paymentResult.status, paymentResult.providerTxnId, paymentResult.response);

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
          gateway: 'mock_gateway',
          status: 'success',
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        status: 'FAILED',
        response: {
          gateway: 'mock_gateway',
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

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }

  // Get shipment details
  private async getShipment(shipmentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting shipment:', error);
      return null;
    }
  }

  // Get escrow transaction
  private async getEscrowTransaction(shipmentId: string): Promise<PaymentTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('shipment_id', shipmentId)
        .eq('type', 'ESCROW_IN')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting escrow transaction:', error);
      return null;
    }
  }

  // Get hold period remaining
  private async getHoldPeriod(shipmentId: string): Promise<number> {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment || !shipment.delivered_at) return 0;

      const deliveredDate = new Date(shipment.delivered_at);
      const holdEndDate = new Date(deliveredDate.getTime() + (this.HOLD_PERIOD_DAYS * 24 * 60 * 60 * 1000));
      const now = new Date();

      if (now >= holdEndDate) return 0;
      return Math.ceil((holdEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    } catch (error) {
      console.error('Error getting hold period:', error);
      return 0;
    }
  }

  // Check for active disputes
  private async checkForDisputes(shipmentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('id')
        .eq('shipment_id', shipmentId)
        .in('status', ['OPEN', 'INVESTIGATING'])
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking disputes:', error);
      return false;
    }
  }

  // Update escrow status
  private async updateEscrowStatus(shipmentId: string, status: string): Promise<void> {
    try {
      // In a real implementation, this would update an escrow table
      // For now, we'll update the shipment's escrow_txn_id with status
      const { error } = await supabase
        .from('shipments')
        .update({
          escrow_txn_id: `${shipmentId}_${status.toLowerCase()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating escrow status:', error);
    }
  }

  // Create settlement event
  private async createSettlementEvent(shipmentId: string, amount: number, payeeId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_shipment_event', {
        p_shipment_id: shipmentId,
        p_event_type: 'SETTLEMENT_PROCESSED',
        p_actor_type: 'system',
        p_metadata: {
          amount,
          payeeId,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating settlement event:', error);
    }
  }

  // Get payment history for shipment
  async getPaymentHistory(shipmentId: string): Promise<PaymentTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Get escrow details
  async getEscrowDetails(shipmentId: string): Promise<EscrowDetails | null> {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) return null;

      const escrowTransaction = await this.getEscrowTransaction(shipmentId);
      if (!escrowTransaction) return null;

      const commissionAmount = shipment.price_submitted * (this.COMMISSION_PERCENTAGE / 100);
      const holdPeriod = await this.getHoldPeriod(shipmentId);
      const hasDispute = await this.checkForDisputes(shipmentId);

      let status: 'HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED' = 'HELD';
      if (hasDispute) status = 'DISPUTED';
      else if (holdPeriod === 0) status = 'RELEASED';

      return {
        shipmentId,
        totalAmount: shipment.price_submitted,
        commissionAmount,
        netAmount: escrowTransaction.amount,
        holdPeriod,
        status,
        releaseDate: holdPeriod > 0 ? new Date(Date.now() + (holdPeriod * 24 * 60 * 60 * 1000)).toISOString() : undefined
      };
    } catch (error) {
      console.error('Error getting escrow details:', error);
      return null;
    }
  }

  // Process refund
  async processRefund(shipmentId: string, reason: string): Promise<boolean> {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment) return false;

      const escrowTransaction = await this.getEscrowTransaction(shipmentId);
      if (!escrowTransaction) return false;

      // Create refund transaction
      const refundTransaction = await this.createPaymentTransaction({
        shipmentId,
        payerId: '', // Platform refunds
        payeeId: shipment.shipper_id,
        amount: escrowTransaction.amount,
        type: 'REFUND',
        status: 'PENDING'
      });

      // Process refund
      await this.processPayment(refundTransaction.id);

      // Update escrow status
      await this.updateEscrowStatus(shipmentId, 'REFUNDED');

      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  // Manual settlement override (admin function)
  async manualSettlementOverride(shipmentId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      // Process settlement
      const success = await this.processSettlement(shipmentId);

      if (success) {
        // Log admin action
        await this.createSettlementEvent(shipmentId, 0, adminId);
        console.log(`Admin ${adminId} manually processed settlement for shipment ${shipmentId}: ${reason}`);
      }

      return success;
    } catch (error) {
      console.error('Error in manual settlement override:', error);
      return false;
    }
  }

  // Get settlement statistics
  async getSettlementStats(): Promise<{
    totalSettlements: number;
    totalAmount: number;
    averageSettlementTime: number;
    failedSettlements: number;
  }> {
    try {
      const { data: settlements, error } = await supabase
        .from('payments')
        .select('*')
        .eq('type', 'SETTLEMENT');

      if (error) throw error;

      const totalSettlements = settlements?.length || 0;
      const totalAmount = settlements?.reduce((sum, s) => sum + parseFloat(s.amount), 0) || 0;
      const failedSettlements = settlements?.filter(s => s.status === 'FAILED').length || 0;

      // Calculate average settlement time (mock)
      const averageSettlementTime = 2.5; // days

      return {
        totalSettlements,
        totalAmount,
        averageSettlementTime,
        failedSettlements
      };
    } catch (error) {
      console.error('Error getting settlement stats:', error);
      return {
        totalSettlements: 0,
        totalAmount: 0,
        averageSettlementTime: 0,
        failedSettlements: 0
      };
    }
  }
}

export default PaymentSettlementService;
