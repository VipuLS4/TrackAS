import { 
  Wallet, 
  Transaction, 
  LedgerEntry, 
  PayoutRequest, 
  WalletAuditLog, 
  WalletBalance, 
  TransactionSummary,
  WalletService,
  TransactionFilters
} from '../types/wallet';
import { monitoring } from './monitoringService';

export class TrackASWalletService implements WalletService {
  private static instance: TrackASWalletService;
  private wallets: Map<string, Wallet> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private ledgerEntries: Map<string, LedgerEntry> = new Map();
  private payoutRequests: Map<string, PayoutRequest> = new Map();
  private auditLogs: Map<string, WalletAuditLog> = new Map();

  private constructor() {}

  public static getInstance(): TrackASWalletService {
    if (!TrackASWalletService.instance) {
      TrackASWalletService.instance = new TrackASWalletService();
    }
    return TrackASWalletService.instance;
  }

  // Wallet Management
  async createWallet(userId: string, userType: string, metadata?: any): Promise<Wallet> {
    return await monitoring.measureAsyncPerformance('createWallet', async () => {
      const walletId = `wallet_${userId}_${Date.now()}`;
      const wallet: Wallet = {
        id: walletId,
        userId,
        userType: userType as Wallet['userType'],
        balance: 0,
        currency: 'INR',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          kycStatus: 'pending',
          ...metadata
        }
      };

      this.wallets.set(walletId, wallet);
      
      await this.createAuditLog({
        walletId,
        action: 'create',
        performedBy: userId,
        performedByType: 'user',
        reason: 'Wallet created',
        createdAt: new Date().toISOString()
      });

      monitoring.trackEvent('wallet_created', { userId, userType, walletId });
      return wallet;
    });
  }

  async getWallet(walletId: string): Promise<Wallet> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    return wallet;
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = Array.from(this.wallets.values()).find(w => w.userId === userId);
    if (!wallet) {
      throw new Error(`Wallet for user ${userId} not found`);
    }
    return wallet;
  }

  async updateWallet(walletId: string, updates: Partial<Wallet>): Promise<Wallet> {
    return await monitoring.measureAsyncPerformance('updateWallet', async () => {
      const wallet = await this.getWallet(walletId);
      const oldWallet = { ...wallet };
      
      const updatedWallet: Wallet = {
        ...wallet,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.wallets.set(walletId, updatedWallet);

      // Create audit log for changes
      const changes = Object.keys(updates).map(key => ({
        field: key,
        oldValue: (oldWallet as any)[key],
        newValue: (updates as any)[key]
      }));

      await this.createAuditLog({
        walletId,
        action: 'update',
        performedBy: wallet.userId,
        performedByType: 'user',
        changes,
        createdAt: new Date().toISOString()
      });

      return updatedWallet;
    });
  }

  async suspendWallet(walletId: string, reason: string): Promise<Wallet> {
    return await this.updateWallet(walletId, { 
      status: 'suspended',
      metadata: { ...(await this.getWallet(walletId)).metadata, suspensionReason: reason }
    });
  }

  async reactivateWallet(walletId: string): Promise<Wallet> {
    return await this.updateWallet(walletId, { status: 'active' });
  }

  async closeWallet(walletId: string, reason: string): Promise<Wallet> {
    return await this.updateWallet(walletId, { 
      status: 'closed',
      metadata: { ...(await this.getWallet(walletId)).metadata, closureReason: reason }
    });
  }

  // Balance Management
  async getBalance(walletId: string): Promise<WalletBalance> {
    const wallet = await this.getWallet(walletId);
    const transactions = Array.from(this.transactions.values())
      .filter(t => t.walletId === walletId);

    const availableBalance = wallet.balance;
    const pendingBalance = transactions
      .filter(t => t.status === 'pending' && t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const frozenBalance = transactions
      .filter(t => t.status === 'processing' && t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      walletId,
      availableBalance,
      pendingBalance,
      frozenBalance,
      totalBalance: availableBalance + pendingBalance,
      lastUpdated: new Date().toISOString()
    };
  }

  async freezeBalance(walletId: string, amount: number, reason: string): Promise<void> {
    const wallet = await this.getWallet(walletId);
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance to freeze');
    }

    await this.createTransaction({
      walletId,
      type: 'debit',
      category: 'adjustment',
      amount,
      currency: 'INR',
      status: 'processing',
      description: `Balance frozen: ${reason}`,
      metadata: { freezeReason: reason }
    });
  }

  async unfreezeBalance(walletId: string, amount: number): Promise<void> {
    await this.createTransaction({
      walletId,
      type: 'credit',
      category: 'adjustment',
      amount,
      currency: 'INR',
      status: 'processing',
      description: `Balance unfrozen: ${amount} paise`
    });
  }

  // Transaction Management
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    return await monitoring.measureAsyncPerformance('createTransaction', async () => {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTransaction: Transaction = {
        id: transactionId,
        ...transaction,
        createdAt: new Date().toISOString()
      };

      // Validate transaction
      const validation = await this.validateTransaction(newTransaction);
      if (!validation.valid) {
        throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
      }

      this.transactions.set(transactionId, newTransaction);

      // Update wallet balance
      const wallet = await this.getWallet(transaction.walletId);
      const balanceBefore = wallet.balance;
      const balanceAfter = transaction.type === 'credit' 
        ? balanceBefore + transaction.amount 
        : balanceBefore - transaction.amount;

      await this.updateWallet(transaction.walletId, { balance: balanceAfter });

      // Create ledger entry
      await this.createLedgerEntry({
        walletId: transaction.walletId,
        transactionId,
        type: transaction.type,
        amount: transaction.amount,
        balanceBefore,
        balanceAfter,
        description: transaction.description,
        createdAt: new Date().toISOString()
      });

      // Record metrics
      monitoring.recordPayment(
        transaction.metadata?.paymentMethod || 'internal',
        transaction.status,
        transaction.amount / 100 // Convert paise to rupees
      );

      return newTransaction;
    });
  }

  async processTransaction(transactionId: string): Promise<Transaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'completed',
      processedAt: new Date().toISOString()
    };

    this.transactions.set(transactionId, updatedTransaction);
    return updatedTransaction;
  }

  async cancelTransaction(transactionId: string, reason: string): Promise<Transaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'cancelled',
      failureReason: reason,
      processedAt: new Date().toISOString()
    };

    this.transactions.set(transactionId, updatedTransaction);
    return updatedTransaction;
  }

  async getTransactions(walletId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values())
      .filter(t => t.walletId === walletId);

    if (filters) {
      if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }
      if (filters.category) {
        transactions = transactions.filter(t => t.category === filters.category);
      }
      if (filters.status) {
        transactions = transactions.filter(t => t.status === filters.status);
      }
      if (filters.dateFrom) {
        transactions = transactions.filter(t => t.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        transactions = transactions.filter(t => t.createdAt <= filters.dateTo!);
      }
      if (filters.minAmount) {
        transactions = transactions.filter(t => t.amount >= filters.minAmount!);
      }
      if (filters.maxAmount) {
        transactions = transactions.filter(t => t.amount <= filters.maxAmount!);
      }
      if (filters.referenceId) {
        transactions = transactions.filter(t => t.referenceId === filters.referenceId);
      }
    }

    return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransactionHistory(walletId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const transactions = await this.getTransactions(walletId);
    return transactions.slice(offset, offset + limit);
  }

  // Ledger Management
  async createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> {
    const entryId = `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: LedgerEntry = {
      id: entryId,
      ...entry,
      createdAt: new Date().toISOString()
    };

    this.ledgerEntries.set(entryId, newEntry);
    return newEntry;
  }

  async getLedgerEntries(walletId: string, limit: number = 50, offset: number = 0): Promise<LedgerEntry[]> {
    const entries = Array.from(this.ledgerEntries.values())
      .filter(e => e.walletId === walletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return entries.slice(offset, offset + limit);
  }

  async getTransactionSummary(walletId: string, period: string): Promise<TransactionSummary> {
    const transactions = await this.getTransactions(walletId);
    const now = new Date();
    let periodStart: Date;

    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const periodTransactions = transactions.filter(t => 
      new Date(t.createdAt) >= periodStart && new Date(t.createdAt) <= now
    );

    const totalCredits = periodTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebits = periodTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalCredits - totalDebits;
    const transactionCount = periodTransactions.length;
    const averageTransactionAmount = transactionCount > 0 ? (totalCredits + totalDebits) / transactionCount : 0;

    // Calculate top categories
    const categoryMap = new Map<string, { amount: number; count: number }>();
    periodTransactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      walletId,
      period: period as any,
      totalCredits,
      totalDebits,
      netAmount,
      transactionCount,
      averageTransactionAmount,
      topCategories,
      periodStart: periodStart.toISOString(),
      periodEnd: now.toISOString()
    };
  }

  // Payout Management
  async requestPayout(payoutRequest: Omit<PayoutRequest, 'id' | 'requestedAt'>): Promise<PayoutRequest> {
    return await monitoring.measureAsyncPerformance('requestPayout', async () => {
      const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newPayoutRequest: PayoutRequest = {
        id: payoutId,
        ...payoutRequest,
        requestedAt: new Date().toISOString()
      };

      this.payoutRequests.set(payoutId, newPayoutRequest);
      return newPayoutRequest;
    });
  }

  async processPayout(payoutId: string): Promise<PayoutRequest> {
    const payout = this.payoutRequests.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    const updatedPayout: PayoutRequest = {
      ...payout,
      status: 'completed',
      processedAt: new Date().toISOString()
    };

    this.payoutRequests.set(payoutId, updatedPayout);
    return updatedPayout;
  }

  async cancelPayout(payoutId: string, reason: string): Promise<PayoutRequest> {
    const payout = this.payoutRequests.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    const updatedPayout: PayoutRequest = {
      ...payout,
      status: 'cancelled',
      failureReason: reason,
      processedAt: new Date().toISOString()
    };

    this.payoutRequests.set(payoutId, updatedPayout);
    return updatedPayout;
  }

  async getPayoutHistory(walletId: string): Promise<PayoutRequest[]> {
    return Array.from(this.payoutRequests.values())
      .filter(p => p.walletId === walletId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  // Audit & Compliance
  async createAuditLog(log: Omit<WalletAuditLog, 'id' | 'createdAt'>): Promise<WalletAuditLog> {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLog: WalletAuditLog = {
      id: logId,
      ...log,
      createdAt: new Date().toISOString()
    };

    this.auditLogs.set(logId, newLog);
    return newLog;
  }

  async getAuditLogs(walletId: string, limit: number = 50, offset: number = 0): Promise<WalletAuditLog[]> {
    const logs = Array.from(this.auditLogs.values())
      .filter(l => l.walletId === walletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return logs.slice(offset, offset + limit);
  }

  // Financial Operations
  async transferFunds(fromWalletId: string, toWalletId: string, amount: number, description: string): Promise<Transaction[]> {
    return await monitoring.measureAsyncPerformance('transferFunds', async () => {
      const fromWallet = await this.getWallet(fromWalletId);
      const toWallet = await this.getWallet(toWalletId);

      if (fromWallet.balance < amount) {
        throw new Error('Insufficient balance for transfer');
      }

      const debitTransaction = await this.createTransaction({
        walletId: fromWalletId,
        type: 'debit',
        category: 'payout',
        amount,
        currency: 'INR',
        status: 'completed',
        description: `Transfer to ${toWalletId}: ${description}`,
        referenceId: `transfer_${Date.now()}`
      });

      const creditTransaction = await this.createTransaction({
        walletId: toWalletId,
        type: 'credit',
        category: 'payout',
        amount,
        currency: 'INR',
        status: 'completed',
        description: `Transfer from ${fromWalletId}: ${description}`,
        referenceId: `transfer_${Date.now()}`
      });

      return [debitTransaction, creditTransaction];
    });
  }

  async calculateFees(amount: number, transactionType: string): Promise<{ platformFee: number; gatewayFee: number; taxAmount: number }> {
    const platformFeeRate = 0.025; // 2.5%
    const gatewayFeeRate = 0.018; // 1.8%
    const taxRate = 0.18; // 18% GST

    const platformFee = Math.round(amount * platformFeeRate);
    const gatewayFee = Math.round(amount * gatewayFeeRate);
    const taxableAmount = platformFee + gatewayFee;
    const taxAmount = Math.round(taxableAmount * taxRate);

    return { platformFee, gatewayFee, taxAmount };
  }

  async validateTransaction(transaction: Partial<Transaction>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!transaction.walletId) {
      errors.push('Wallet ID is required');
    }

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!transaction.type || !['credit', 'debit'].includes(transaction.type)) {
      errors.push('Transaction type must be credit or debit');
    }

    if (!transaction.category) {
      errors.push('Transaction category is required');
    }

    if (transaction.type === 'debit') {
      try {
        const wallet = await this.getWallet(transaction.walletId!);
        if (wallet.balance < transaction.amount!) {
          errors.push('Insufficient balance');
        }
      } catch (error) {
        errors.push('Invalid wallet ID');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const walletService = TrackASWalletService.getInstance();
