// Admin Role Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalShipments: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeDisputes: number;
  systemAlerts: SystemAlert[];
  recentActivity: AuditLog[];
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface UserRegistration {
  id: string;
  email: string;
  name: string;
  role: 'shipper' | 'fleet' | 'individual';
  status: 'pending' | 'approved' | 'rejected';
  kycStatus: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  documents: KYCDocument[];
}

export interface KYCDocument {
  id: string;
  type: 'pan' | 'aadhar' | 'gst' | 'bank' | 'vehicle' | 'license';
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface DisputeCase {
  id: string;
  shipmentId: string;
  type: 'payment' | 'delivery' | 'damage' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  description: string;
  evidence: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalShipments: number;
  totalRevenue: number;
  averageRating: number;
  systemUptime: number;
  activeUsers: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  commissionEarned: number;
  escrowHeld: number;
  pendingPayouts: number;
  monthlyGrowth: number;
}

export interface AIConfig {
  priceValidationEnabled: boolean;
  routeOptimizationEnabled: boolean;
  fraudDetectionEnabled: boolean;
  demandForecastingEnabled: boolean;
  aiModelVersion: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxVehicles: number;
  isActive: boolean;
}

export interface CommissionSetting {
  id: string;
  role: 'shipper' | 'fleet' | 'individual';
  percentage: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
}

export interface EscrowTransaction {
  id: string;
  shipmentId: string;
  amount: number;
  status: 'pending' | 'held' | 'released' | 'refunded';
  createdAt: string;
  releasedAt?: string;
}

export interface WalletAdjustment {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  adminId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'financial' | 'operational' | 'user' | 'system';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: any;
  generatedAt: string;
}

export interface ComplianceDocument {
  id: string;
  type: 'policy' | 'terms' | 'privacy' | 'gdpr';
  version: string;
  content: string;
  effectiveDate: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface AdminStaffUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
}
