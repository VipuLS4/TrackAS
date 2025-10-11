// Shipper Role Types
export interface ShipperUser {
  id: string;
  email: string;
  name: string;
  companyName: string;
  phone: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  role: 'shipper';
  kycStatus: 'pending' | 'verified' | 'rejected';
  walletBalance: number;
  createdAt: string;
  lastLogin: string;
}

export interface ShipmentDetails {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  description: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  assignedVehicle?: string;
  trackingNumber: string;
  createdAt: string;
}

export interface AIPriceRecommendation {
  suggestedPrice: number;
  confidence: number;
  factors: {
    distance: number;
    weight: number;
    demand: number;
    fuelCost: number;
    marketRate: number;
  };
  alternatives: {
    price: number;
    reason: string;
  }[];
}

export interface ShipperWallet {
  balance: number;
  transactions: WalletTransaction[];
  pendingAmount: number;
  totalSpent: number;
  monthlySpend: number;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  shipmentId?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Invoice {
  id: string;
  shipmentId: string;
  amount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  shipmentId: string;
  type: 'delivery' | 'damage' | 'payment' | 'service';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  evidence: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface ShipperAnalytics {
  totalShipments: number;
  completedShipments: number;
  cancelledShipments: number;
  averageRating: number;
  totalSpent: number;
  monthlySpend: number;
  favoriteRoutes: {
    route: string;
    count: number;
  }[];
  performanceMetrics: {
    onTimeDelivery: number;
    customerSatisfaction: number;
    costEfficiency: number;
  };
}

export interface KYCDocument {
  id: string;
  type: 'pan' | 'gst' | 'bank' | 'address';
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
}

export interface ShipperRegistrationData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  phone: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  documents: KYCDocument[];
}

export interface PriceAuditLog {
  id: string;
  shipmentId: string;
  originalPrice: number;
  suggestedPrice: number;
  finalPrice: number;
  aiConfidence: number;
  factors: any;
  timestamp: string;
}

export interface NotificationEvent {
  id: string;
  type: 'shipment' | 'payment' | 'dispute' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface ShipperKPIs {
  deliverySuccessRate: number;
  averageDeliveryTime: number;
  customerSatisfactionScore: number;
  costPerShipment: number;
  monthlyGrowthRate: number;
  disputeResolutionTime: number;
}
