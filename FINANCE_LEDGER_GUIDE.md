# TrackAS Finance & Ledger System Guide

## 🏦 Overview

The TrackAS Finance & Ledger System provides comprehensive financial management capabilities including digital wallets, transaction processing, automated payouts, and complete audit trails. This system ensures financial transparency, compliance, and seamless payment processing for all user types.

## 🎯 Key Features

### **Digital Wallet System**
- Multi-currency support (INR primary)
- Real-time balance tracking
- Transaction history and reporting
- KYC integration and compliance
- Bank account and UPI integration

### **Transaction Management**
- Automated transaction processing
- Real-time ledger updates
- Transaction categorization and tagging
- Reference tracking and reconciliation
- Multi-level transaction validation

### **Payout System**
- Automated payout processing
- Multiple payout methods (Bank Transfer, UPI, Wallet)
- Fee calculation and deduction
- Payout scheduling and batching
- Compliance and reporting

### **Audit & Compliance**
- Complete audit trail
- Real-time transaction monitoring
- Compliance reporting
- Fraud detection and prevention
- Regulatory compliance tools

## 🚀 System Architecture

### **Core Components**

#### **1. Wallet Service**
```typescript
// Wallet creation and management
const wallet = await walletService.createWallet(userId, userType, {
  kycStatus: 'verified',
  bankAccount: {
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    accountHolderName: 'John Doe'
  },
  upiId: 'john.doe@paytm'
});
```

#### **2. Transaction Processing**
```typescript
// Create and process transactions
const transaction = await walletService.createTransaction({
  walletId: wallet.id,
  type: 'credit',
  category: 'shipping_fee',
  amount: 500000, // ₹5000 in paise
  currency: 'INR',
  status: 'pending',
  description: 'Payment for shipment #SH123456',
  referenceId: 'SH123456',
  metadata: {
    shipmentId: 'SH123456',
    paymentMethod: 'upi',
    gatewayTransactionId: 'TXN123456789'
  }
});
```

#### **3. Ledger Management**
```typescript
// Automatic ledger entry creation
const ledgerEntry = await walletService.createLedgerEntry({
  walletId: wallet.id,
  transactionId: transaction.id,
  type: 'credit',
  amount: 500000,
  balanceBefore: 0,
  balanceAfter: 500000,
  description: 'Credit for shipment payment'
});
```

#### **4. Payout Processing**
```typescript
// Request and process payouts
const payoutRequest = await walletService.requestPayout({
  walletId: wallet.id,
  amount: 450000, // ₹4500 after fees
  currency: 'INR',
  status: 'pending',
  payoutMethod: 'bank_transfer',
  payoutDetails: {
    bankAccount: {
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountHolderName: 'John Doe'
    }
  }
});
```

## 💰 Financial Operations

### **Transaction Types**

#### **Credit Transactions**
- **Shipping Fees**: Payment received for shipment services
- **Platform Fees**: Revenue from platform usage
- **Refunds**: Money returned to customers
- **Bonuses**: Incentive payments
- **Adjustments**: Manual balance corrections

#### **Debit Transactions**
- **Payouts**: Money sent to user bank accounts
- **Platform Fees**: Fees deducted from transactions
- **Penalties**: Deductions for violations
- **Refunds**: Money returned to customers
- **Adjustments**: Manual balance corrections

### **Fee Structure**

#### **Platform Fees**
- **Shipping Fee**: 2.5% of transaction amount
- **Platform Fee**: 1.8% of transaction amount
- **GST**: 18% on platform fees
- **Processing Fee**: ₹2 per transaction

#### **Payout Fees**
- **Bank Transfer**: ₹5 per payout
- **UPI Transfer**: ₹2 per payout
- **Wallet Transfer**: ₹1 per payout

### **Balance Management**

#### **Balance Types**
- **Available Balance**: Immediately usable funds
- **Pending Balance**: Funds awaiting confirmation
- **Frozen Balance**: Funds held for disputes/verification
- **Total Balance**: Sum of all balance types

#### **Balance Operations**
```typescript
// Freeze balance for dispute
await walletService.freezeBalance(walletId, 100000, 'Dispute investigation');

// Unfreeze balance after resolution
await walletService.unfreezeBalance(walletId, 100000);

// Get current balance
const balance = await walletService.getBalance(walletId);
```

## 🔄 Payment Processing Flow

### **1. Payment Initiation**
```typescript
// User initiates payment
const payment = await paymentService.initiatePayment({
  amount: 500000,
  currency: 'INR',
  paymentMethod: 'upi',
  walletId: wallet.id,
  shipmentId: 'SH123456'
});
```

### **2. Payment Gateway Integration**
```typescript
// Process through payment gateway
const gatewayResponse = await paymentGateway.processPayment({
  amount: 500000,
  currency: 'INR',
  method: 'upi',
  upiId: 'john.doe@paytm',
  orderId: payment.id
});
```

### **3. Webhook Processing**
```typescript
// Handle payment webhook with retry mechanism
const webhook = await paymentRetryService.processWebhook({
  paymentId: payment.id,
  eventType: 'payment.success',
  payload: gatewayResponse,
  signature: webhookSignature
});
```

### **4. Wallet Credit**
```typescript
// Credit wallet on successful payment
const transaction = await walletService.createTransaction({
  walletId: wallet.id,
  type: 'credit',
  category: 'shipping_fee',
  amount: 500000,
  currency: 'INR',
  status: 'completed',
  description: 'Payment received for shipment',
  referenceId: payment.id,
  metadata: {
    paymentMethod: 'upi',
    gatewayTransactionId: gatewayResponse.transactionId
  }
});
```

### **5. Ledger Update**
```typescript
// Automatic ledger entry creation
const ledgerEntry = await walletService.createLedgerEntry({
  walletId: wallet.id,
  transactionId: transaction.id,
  type: 'credit',
  amount: 500000,
  balanceBefore: previousBalance,
  balanceAfter: previousBalance + 500000,
  description: 'Credit for shipment payment'
});
```

## 🔁 Payment Retry System

### **Automatic Retry Configuration**
```typescript
// Configure retry parameters
paymentRetryService.updateRetryConfig({
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 300000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED']
});
```

### **Retry Logic**
1. **Initial Attempt**: Process webhook immediately
2. **Failure Detection**: Identify retryable errors
3. **Exponential Backoff**: Increase delay between retries
4. **Max Retries**: Stop after configured attempts
5. **Final Failure**: Mark as permanently failed

### **Retry Monitoring**
```typescript
// Get retry statistics
const stats = await paymentRetryService.getRetryStats();
console.log(`Total webhooks: ${stats.totalWebhooks}`);
console.log(`Pending retries: ${stats.pendingRetries}`);
console.log(`Success rate: ${stats.successfulRetries / stats.totalWebhooks * 100}%`);
```

## 📊 Financial Reporting

### **Transaction Summaries**
```typescript
// Get transaction summary for different periods
const dailySummary = await walletService.getTransactionSummary(walletId, 'daily');
const monthlySummary = await walletService.getTransactionSummary(walletId, 'monthly');

console.log(`Daily Credits: ₹${dailySummary.totalCredits / 100}`);
console.log(`Daily Debits: ₹${dailySummary.totalDebits / 100}`);
console.log(`Net Amount: ₹${dailySummary.netAmount / 100}`);
```

### **Revenue Tracking**
```typescript
// Track revenue by user role
monitoring.recordRevenue('shipper', 'shipping_fee', 5000);
monitoring.recordRevenue('fleet', 'platform_fee', 500);
monitoring.recordRevenue('individual', 'bonus', 1000);
```

### **Financial Metrics**
- **Total Transaction Volume**: Sum of all transactions
- **Average Transaction Size**: Mean transaction amount
- **Transaction Success Rate**: Percentage of successful transactions
- **Revenue per User**: Average revenue per user type
- **Fee Collection**: Total fees collected
- **Payout Volume**: Total amount paid out

## 🔒 Security & Compliance

### **Transaction Validation**
```typescript
// Validate transaction before processing
const validation = await walletService.validateTransaction({
  walletId: wallet.id,
  type: 'debit',
  amount: 100000,
  category: 'payout'
});

if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}
```

### **Audit Trail**
```typescript
// Create audit log for all operations
await walletService.createAuditLog({
  walletId: wallet.id,
  action: 'transaction',
  performedBy: userId,
  performedByType: 'user',
  changes: [{
    field: 'balance',
    oldValue: 1000000,
    newValue: 500000
  }],
  reason: 'Payout processing',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
});
```

### **Fraud Prevention**
- **Transaction Limits**: Daily/monthly limits per user
- **Velocity Checks**: Monitor transaction frequency
- **Pattern Analysis**: Detect unusual spending patterns
- **Risk Scoring**: Assign risk scores to transactions
- **Manual Review**: Flag high-risk transactions

## 🎯 Integration Examples

### **Shipment Payment Flow**
```typescript
// Complete shipment payment flow
export class ShipmentPaymentService {
  async processShipmentPayment(shipmentId: string, paymentData: PaymentData) {
    try {
      // 1. Create payment record
      const payment = await this.createPayment(shipmentId, paymentData);
      
      // 2. Process through gateway
      const gatewayResult = await this.processGatewayPayment(payment);
      
      // 3. Handle webhook with retry
      const webhook = await paymentRetryService.processWebhook({
        paymentId: payment.id,
        eventType: 'payment.success',
        payload: gatewayResult,
        signature: this.generateSignature(gatewayResult)
      });
      
      // 4. Credit shipper wallet
      const transaction = await walletService.createTransaction({
        walletId: paymentData.shipperWalletId,
        type: 'credit',
        category: 'shipping_fee',
        amount: paymentData.amount,
        currency: 'INR',
        status: 'completed',
        description: `Payment for shipment ${shipmentId}`,
        referenceId: shipmentId,
        metadata: {
          shipmentId,
          paymentMethod: paymentData.method,
          gatewayTransactionId: gatewayResult.transactionId
        }
      });
      
      // 5. Update shipment status
      await this.updateShipmentStatus(shipmentId, 'paid');
      
      // 6. Record metrics
      monitoring.recordPayment(paymentData.method, 'completed', paymentData.amount / 100);
      monitoring.recordRevenue('shipper', 'shipping_fee', paymentData.amount / 100);
      
      return { success: true, transactionId: transaction.id };
    } catch (error) {
      monitoring.recordError(error, 'ShipmentPaymentService', 'high');
      throw error;
    }
  }
}
```

### **Fleet Payout Flow**
```typescript
// Automated fleet payout processing
export class FleetPayoutService {
  async processFleetPayout(fleetId: string, payoutData: PayoutData) {
    try {
      // 1. Get fleet wallet
      const wallet = await walletService.getWalletByUserId(fleetId);
      
      // 2. Calculate fees
      const fees = await walletService.calculateFees(payoutData.amount, 'payout');
      
      // 3. Create payout request
      const payoutRequest = await walletService.requestPayout({
        walletId: wallet.id,
        amount: payoutData.amount - fees.platformFee - fees.gatewayFee,
        currency: 'INR',
        status: 'pending',
        payoutMethod: 'bank_transfer',
        payoutDetails: {
          bankAccount: payoutData.bankAccount
        },
        metadata: {
          fees: {
            platformFee: fees.platformFee,
            processingFee: fees.gatewayFee
          }
        }
      });
      
      // 4. Process payout
      const processedPayout = await walletService.processPayout(payoutRequest.id);
      
      // 5. Create debit transaction
      const transaction = await walletService.createTransaction({
        walletId: wallet.id,
        type: 'debit',
        category: 'payout',
        amount: payoutData.amount,
        currency: 'INR',
        status: 'completed',
        description: `Payout to ${payoutData.bankAccount.accountHolderName}`,
        referenceId: payoutRequest.id,
        metadata: {
          payoutMethod: 'bank_transfer',
          fees: fees
        }
      });
      
      // 6. Record metrics
      monitoring.recordPayment('bank_transfer', 'completed', payoutData.amount / 100);
      
      return { success: true, payoutId: processedPayout.id };
    } catch (error) {
      monitoring.recordError(error, 'FleetPayoutService', 'high');
      throw error;
    }
  }
}
```

## 📱 API Endpoints

### **Wallet Management**
```
GET    /api/wallets/:walletId          # Get wallet details
POST   /api/wallets                    # Create new wallet
PUT    /api/wallets/:walletId          # Update wallet
POST   /api/wallets/:walletId/suspend  # Suspend wallet
POST   /api/wallets/:walletId/reactivate # Reactivate wallet
```

### **Transaction Management**
```
GET    /api/wallets/:walletId/transactions     # Get transactions
POST   /api/wallets/:walletId/transactions      # Create transaction
GET    /api/wallets/:walletId/balance          # Get balance
POST   /api/wallets/:walletId/freeze           # Freeze balance
POST   /api/wallets/:walletId/unfreeze         # Unfreeze balance
```

### **Payout Management**
```
GET    /api/wallets/:walletId/payouts          # Get payout history
POST   /api/wallets/:walletId/payouts          # Request payout
PUT    /api/payouts/:payoutId                  # Update payout
POST   /api/payouts/:payoutId/cancel           # Cancel payout
```

### **Reporting & Analytics**
```
GET    /api/wallets/:walletId/summary/:period  # Transaction summary
GET    /api/wallets/:walletId/ledger           # Ledger entries
GET    /api/wallets/:walletId/audit            # Audit logs
GET    /api/finance/revenue                    # Revenue reports
GET    /api/finance/metrics                    # Financial metrics
```

## 🔧 Configuration

### **Environment Variables**
```env
# Wallet Configuration
WALLET_DEFAULT_CURRENCY=INR
WALLET_MIN_BALANCE=0
WALLET_MAX_BALANCE=1000000000

# Fee Configuration
PLATFORM_FEE_RATE=0.025
GATEWAY_FEE_RATE=0.018
GST_RATE=0.18
PROCESSING_FEE=200

# Payout Configuration
PAYOUT_MIN_AMOUNT=10000
PAYOUT_MAX_AMOUNT=10000000
PAYOUT_DAILY_LIMIT=50000000

# Retry Configuration
PAYMENT_RETRY_MAX_ATTEMPTS=5
PAYMENT_RETRY_INITIAL_DELAY=1000
PAYMENT_RETRY_MAX_DELAY=300000
```

### **Database Schema**
```sql
-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  type VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  description TEXT,
  reference_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Ledger entries table
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  transaction_id UUID REFERENCES transactions(id),
  type VARCHAR(10) NOT NULL,
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚨 Error Handling

### **Common Error Scenarios**
1. **Insufficient Balance**: Handle gracefully with clear messaging
2. **Payment Gateway Failures**: Implement retry logic and fallbacks
3. **Network Timeouts**: Use exponential backoff for retries
4. **Validation Errors**: Provide detailed error messages
5. **Compliance Violations**: Block transactions and notify users

### **Error Recovery**
```typescript
// Comprehensive error handling
try {
  await walletService.createTransaction(transactionData);
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    // Handle insufficient balance
    await this.notifyInsufficientBalance(walletId, requiredAmount);
  } else if (error.message.includes('Validation failed')) {
    // Handle validation errors
    await this.logValidationError(error, transactionData);
  } else {
    // Handle unexpected errors
    monitoring.recordError(error, 'WalletService', 'high');
    throw error;
  }
}
```

## 📈 Performance Optimization

### **Database Optimization**
- **Indexing**: Create indexes on frequently queried fields
- **Partitioning**: Partition large tables by date
- **Connection Pooling**: Use connection pools for database access
- **Query Optimization**: Optimize complex queries

### **Caching Strategy**
- **Redis Caching**: Cache frequently accessed data
- **Balance Caching**: Cache wallet balances with TTL
- **Transaction Caching**: Cache recent transactions
- **Rate Limiting**: Implement rate limiting for API calls

### **Monitoring & Alerting**
- **Transaction Volume**: Monitor transaction volume spikes
- **Error Rates**: Track error rates and patterns
- **Performance Metrics**: Monitor response times
- **Fraud Detection**: Alert on suspicious activities

## 🎯 Best Practices

### **1. Transaction Safety**
- Always use database transactions for multi-step operations
- Implement proper rollback mechanisms
- Validate all inputs before processing
- Use idempotent operations where possible

### **2. Security**
- Encrypt sensitive data at rest and in transit
- Implement proper authentication and authorization
- Use secure communication protocols
- Regular security audits and penetration testing

### **3. Compliance**
- Maintain complete audit trails
- Implement proper data retention policies
- Follow regulatory requirements
- Regular compliance audits

### **4. Monitoring**
- Monitor all financial operations
- Set up alerts for critical events
- Track performance metrics
- Regular health checks

---

**Note**: This finance and ledger system is designed for enterprise-grade financial operations. Ensure proper testing, security audits, and compliance reviews before production deployment.
