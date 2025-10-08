// TrackAS Wallet & Ledger System Types
export interface Wallet {
  id: string;
  userId: string;
  userType: 'admin' | 'shipper' | 'fleet' | 'individual';
  balance: number; // in paise (smallest currency unit)
  currency: 'INR';
  status: 'active' | 'suspended' | 'closed';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    kycStatus: 'pending' | 'verified' | 'rejected';
    bankAccount?: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountHolderName: string;
    };
    upiId?: string;
    walletAddress?: string; // For crypto wallets
  };
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  category: 'shipping_fee' | 'platform_fee' | 'refund' | 'payout' | 'bonus' | 'penalty' | 'adjustment';
  amount: number; // in paise
  currency: 'INR';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  referenceId?: string; // External reference (payment gateway, shipment ID, etc.)
  metadata?: {
    shipmentId?: string;
    paymentMethod?: string;
    gatewayTransactionId?: string;
    fees?: {
      platformFee: number;
      gatewayFee: number;
      taxAmount: number;
    };
    exchangeRate?: number;
    originalCurrency?: string;
  };
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  transactionId: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  walletId: string;
  amount: number;
  currency: 'INR';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payoutMethod: 'bank_transfer' | 'upi' | 'wallet';
  payoutDetails: {
    bankAccount?: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountHolderName: string;
    };
    upiId?: string;
    walletAddress?: string;
  };
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  metadata?: {
    fees: {
      platformFee: number;
      processingFee: number;
    };
    exchangeRate?: number;
  };
}

export interface WalletAuditLog {
  id: string;
  walletId: string;
  action: 'create' | 'update' | 'suspend' | 'reactivate' | 'close' | 'transaction' | 'payout';
  performedBy: string; // User ID
  performedByType: 'admin' | 'system' | 'user';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface WalletBalance {
  walletId: string;
  availableBalance: number;
  pendingBalance: number;
  frozenBalance: number;
  totalBalance: number;
  lastUpdated: string;
}

export interface TransactionSummary {
  walletId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
  transactionCount: number;
  averageTransactionAmount: number;
  topCategories: {
    category: string;
    amount: number;
    count: number;
  }[];
  periodStart: string;
  periodEnd: string;
}

// Wallet Service Interface
export interface WalletService {
  // Wallet Management
  createWallet(userId: string, userType: string, metadata?: any): Promise<Wallet>;
  getWallet(walletId: string): Promise<Wallet>;
  getWalletByUserId(userId: string): Promise<Wallet>;
  updateWallet(walletId: string, updates: Partial<Wallet>): Promise<Wallet>;
  suspendWallet(walletId: string, reason: string): Promise<Wallet>;
  reactivateWallet(walletId: string): Promise<Wallet>;
  closeWallet(walletId: string, reason: string): Promise<Wallet>;

  // Balance Management
  getBalance(walletId: string): Promise<WalletBalance>;
  freezeBalance(walletId: string, amount: number, reason: string): Promise<void>;
  unfreezeBalance(walletId: string, amount: number): Promise<void>;

  // Transaction Management
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  processTransaction(transactionId: string): Promise<Transaction>;
  cancelTransaction(transactionId: string, reason: string): Promise<Transaction>;
  getTransactions(walletId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  getTransactionHistory(walletId: string, limit?: number, offset?: number): Promise<Transaction[]>;

  // Ledger Management
  createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry>;
  getLedgerEntries(walletId: string, limit?: number, offset?: number): Promise<LedgerEntry[]>;
  getTransactionSummary(walletId: string, period: string): Promise<TransactionSummary>;

  // Payout Management
  requestPayout(payoutRequest: Omit<PayoutRequest, 'id' | 'requestedAt'>): Promise<PayoutRequest>;
  processPayout(payoutId: string): Promise<PayoutRequest>;
  cancelPayout(payoutId: string, reason: string): Promise<PayoutRequest>;
  getPayoutHistory(walletId: string): Promise<PayoutRequest[]>;

  // Audit & Compliance
  createAuditLog(log: Omit<WalletAuditLog, 'id' | 'createdAt'>): Promise<WalletAuditLog>;
  getAuditLogs(walletId: string, limit?: number, offset?: number): Promise<WalletAuditLog[]>;

  // Financial Operations
  transferFunds(fromWalletId: string, toWalletId: string, amount: number, description: string): Promise<Transaction[]>;
  calculateFees(amount: number, transactionType: string): Promise<{ platformFee: number; gatewayFee: number; taxAmount: number }>;
  validateTransaction(transaction: Partial<Transaction>): Promise<{ valid: boolean; errors: string[] }>;
}

export interface TransactionFilters {
  type?: 'credit' | 'debit';
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  referenceId?: string;
}
