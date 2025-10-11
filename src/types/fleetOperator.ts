// Fleet Operator Role Types
export interface FleetOperatorUser {
  id: string;
  email: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  role: 'fleet';
  kycStatus: 'pending' | 'verified' | 'rejected';
  subscriptionPlan: SubscriptionPlan;
  walletBalance: number;
  reliabilityScore: number;
  createdAt: string;
  lastLogin: string;
}

export interface VehicleDetails {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  type: 'truck' | 'van' | 'car' | 'bike';
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  currentLocation: {
    lat: number;
    lng: number;
  };
  driverId?: string;
  vcode: string;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number;
  rating: number;
  totalTrips: number;
  isActive: boolean;
  vehicleId?: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  createdAt: string;
}

export interface FleetWallet {
  balance: number;
  transactions: WalletTransaction[];
  pendingAmount: number;
  totalEarnings: number;
  monthlyEarnings: number;
  commissionEarned: number;
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

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxVehicles: number;
  features: string[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface FleetAnalytics {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  totalTrips: number;
  completedTrips: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  performanceMetrics: {
    onTimeDelivery: number;
    customerSatisfaction: number;
    vehicleUtilization: number;
    driverRetention: number;
  };
}

export interface KYCDocument {
  id: string;
  type: 'pan' | 'gst' | 'bank' | 'address' | 'vehicle' | 'license';
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
}

export interface FleetRegistrationData {
  email: string;
  password: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  subscriptionPlan: string;
  vehicles: VehicleDetails[];
  drivers: DriverProfile[];
  documents: KYCDocument[];
}

export interface ShipmentOffer {
  id: string;
  shipmentId: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  weight: number;
  value: number;
  offeredPrice: number;
  distance: number;
  status: 'available' | 'assigned' | 'completed' | 'cancelled';
  assignedVehicle?: string;
  createdAt: string;
}

export interface ReliabilityScoreMetrics {
  onTimeDelivery: number;
  customerRating: number;
  cancellationRate: number;
  damageRate: number;
  responseTime: number;
  overallScore: number;
  lastUpdated: string;
}

export interface NotificationEvent {
  id: string;
  type: 'shipment' | 'payment' | 'vehicle' | 'driver' | 'subscription';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface FleetKPIs {
  vehicleUtilizationRate: number;
  averageTripValue: number;
  driverRetentionRate: number;
  customerSatisfactionScore: number;
  monthlyGrowthRate: number;
  costPerTrip: number;
  revenuePerVehicle: number;
}
