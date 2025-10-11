import { AdminUser, AdminDashboardData, UserRegistration, SystemAlert, DisputeCase, PlatformMetrics, FinancialSummary, AIConfig, SubscriptionPlan, CommissionSetting, EscrowTransaction, WalletAdjustment, Report, ComplianceDocument, Permission, AdminRole, AdminStaffUser } from '../types/admin';

// Mock data for demonstration
const mockAdminUser: AdminUser = {
  id: 'admin-1',
  email: 'admin@trackas.com',
  name: 'TrackAS Admin',
  role: 'admin',
  permissions: ['all'],
  lastLogin: new Date().toISOString(),
  isActive: true,
  createdAt: new Date().toISOString(),
};

const mockDashboardData: AdminDashboardData = {
  totalUsers: 1250,
  totalShipments: 5670,
  totalRevenue: 1250000,
  pendingVerifications: 23,
  activeDisputes: 7,
  systemAlerts: [
    {
      id: 'alert-1',
      type: 'warning',
      message: 'High server load detected',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
  ],
  recentActivity: [
    {
      id: 'log-1',
      userId: 'user-123',
      action: 'created_shipment',
      resource: 'shipment-456',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
    },
  ],
};

export class AdminService {
  // Authentication
  static async loginAdmin(email: string, password: string): Promise<AdminUser> {
    // Mock authentication
    if (email === 'admin@trackas.com' && password === 'admin123') {
      return mockAdminUser;
    }
    throw new Error('Invalid credentials');
  }

  static async logoutAdmin(): Promise<void> {
    // Mock logout
    return Promise.resolve();
  }

  // Dashboard Data
  static async getDashboardData(): Promise<AdminDashboardData> {
    return Promise.resolve(mockDashboardData);
  }

  // User Management
  static async getPendingVerifications(): Promise<UserRegistration[]> {
    return Promise.resolve([
      {
        id: 'reg-1',
        email: 'shipper@example.com',
        name: 'John Shipper',
        role: 'shipper',
        status: 'pending',
        kycStatus: 'pending',
        submittedAt: new Date().toISOString(),
        documents: [],
      },
    ]);
  }

  static async approveUser(userId: string): Promise<void> {
    // Mock approval
    return Promise.resolve();
  }

  static async rejectUser(userId: string, reason: string): Promise<void> {
    // Mock rejection
    return Promise.resolve();
  }

  // Financial Management
  static async getFinancialSummary(): Promise<FinancialSummary> {
    return Promise.resolve({
      totalRevenue: 1250000,
      commissionEarned: 125000,
      escrowHeld: 50000,
      pendingPayouts: 25000,
      monthlyGrowth: 15.5,
    });
  }

  static async adjustWallet(userId: string, amount: number, reason: string): Promise<void> {
    // Mock wallet adjustment
    return Promise.resolve();
  }

  // AI Configuration
  static async getAIConfig(): Promise<AIConfig> {
    return Promise.resolve({
      priceValidationEnabled: true,
      routeOptimizationEnabled: true,
      fraudDetectionEnabled: true,
      demandForecastingEnabled: true,
      aiModelVersion: 'v2.1.0',
    });
  }

  static async updateAIConfig(config: Partial<AIConfig>): Promise<void> {
    // Mock AI config update
    return Promise.resolve();
  }

  // System Monitoring
  static async getSystemMetrics(): Promise<PlatformMetrics> {
    return Promise.resolve({
      totalUsers: 1250,
      totalShipments: 5670,
      totalRevenue: 1250000,
      averageRating: 4.7,
      systemUptime: 99.9,
      activeUsers: 450,
    });
  }

  // Dispute Management
  static async getActiveDisputes(): Promise<DisputeCase[]> {
    return Promise.resolve([
      {
        id: 'dispute-1',
        shipmentId: 'ship-123',
        type: 'delivery',
        status: 'open',
        description: 'Package damaged during delivery',
        evidence: ['photo1.jpg', 'photo2.jpg'],
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async resolveDispute(disputeId: string, resolution: string): Promise<void> {
    // Mock dispute resolution
    return Promise.resolve();
  }

  // Reports
  static async generateReport(type: string, period: string): Promise<Report> {
    return Promise.resolve({
      id: 'report-1',
      type: 'financial',
      period: 'monthly',
      data: {},
      generatedAt: new Date().toISOString(),
    });
  }

  // Subscription Management
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Promise.resolve([
      {
        id: 'plan-1',
        name: 'Small Fleet',
        price: 5000,
        features: ['Up to 5 vehicles', 'Basic analytics'],
        maxVehicles: 5,
        isActive: true,
      },
    ]);
  }

  // Commission Settings
  static async getCommissionSettings(): Promise<CommissionSetting[]> {
    return Promise.resolve([
      {
        id: 'comm-1',
        role: 'shipper',
        percentage: 5,
        minAmount: 100,
        maxAmount: 1000,
        isActive: true,
      },
    ]);
  }

  static async updateCommissionSetting(settingId: string, updates: Partial<CommissionSetting>): Promise<void> {
    // Mock commission update
    return Promise.resolve();
  }

  // Escrow Management
  static async getEscrowTransactions(): Promise<EscrowTransaction[]> {
    return Promise.resolve([
      {
        id: 'escrow-1',
        shipmentId: 'ship-123',
        amount: 5000,
        status: 'held',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async releaseEscrow(transactionId: string): Promise<void> {
    // Mock escrow release
    return Promise.resolve();
  }

  // Staff Management
  static async getStaffUsers(): Promise<AdminStaffUser[]> {
    return Promise.resolve([
      {
        id: 'staff-1',
        email: 'staff@trackas.com',
        name: 'Support Staff',
        role: 'support',
        permissions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async createStaffUser(userData: Partial<AdminStaffUser>): Promise<AdminStaffUser> {
    // Mock staff creation
    return Promise.resolve({
      id: 'staff-new',
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'support',
      permissions: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Compliance
  static async getComplianceDocuments(): Promise<ComplianceDocument[]> {
    return Promise.resolve([
      {
        id: 'doc-1',
        type: 'terms',
        version: '1.0',
        content: 'Terms and conditions...',
        effectiveDate: new Date().toISOString(),
        isActive: true,
      },
    ]);
  }

  static async updateComplianceDocument(docId: string, updates: Partial<ComplianceDocument>): Promise<void> {
    // Mock compliance update
    return Promise.resolve();
  }
}
